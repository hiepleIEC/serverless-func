const _ = require('lodash')
const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const FlexCommand = require('../modules/FlexCommand')
const { CommandOptionType } = require('slash-create')
const { uploadGCS } = require('../modules/google')
const moment = require('moment-timezone')
const initials = require('initials')
const SERVER_IDS = [
  '499892055980507136', // WW
  '864778887976452136', // WW Affair
  ...(process.env.TEST_SERVER_ID ? [process.env.TEST_SERVER_ID] : []),
]
const { getSheets } = require('../modules/sheets')
const {
  getDrive,
  searchDriveByKeyword,
  createFolder,
  duplicateFile,
  grantAccess,
} = require('../modules/drive')
const { createGitlab } = require('../modules/gitlabApi')
const {
  createFunctionRunnerCheckList,
} = require('../modules/createFunctionRunnerCheckList')
const { getMessage } = require('../modules/discordApi')
module.exports = (modifiers) =>
  class CheckListCreate extends FlexCommand {
    constructor(creator) {
      super(
        creator,
        {
          name: 'checklist-create',
          description: 'Checklist create ',
          guildIDs: SERVER_IDS,
          deleteCommands: true,
          defaultPermission: true,
          options: [
            {
              type: CommandOptionType.STRING,
              name: 'game_name',
              description:
                'Name of the game. Capitalized (eg. Ball Sort Puzzle)',
              required: true,
            },
            {
              type: CommandOptionType.STRING,
              name: 'account',
              description: 'Account',
              required: true,
              autocomplete: true,
            },
            {
              type: CommandOptionType.BOOLEAN,
              name: 'should_create_gitlab_project',
              description: 'Should we create a new Gitlab Project ?',
              required: true,
            },
          ],
        },
        modifiers
      )
    }

    async run(ctx) {
      try {
        const runWithMessage = await createFunctionRunnerCheckList(ctx, {
          logResult: true,
          showLogEvenWhenNoError: false,
        })
        const gameName = ctx.options.game_name
        const accountName = ctx.options.account
        const shouldCreateGitlab = ctx.options.should_create_gitlab_project
        const sheets = await getSheets()
        const {
          data: { values },
        } = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.SHEET_ID_ACCOUNT_CHECKLIST_CREATE,
          range: 'Accounts!A2:D',
        })
        const account = values.filter((el) => el.includes(accountName))[0]
        if (!account) {
          return ctx.send({
            content: `${accountName} not found`,
            ephemeral: true,
          })
        }
        const [, supportEmail, , keystoreApiEndPoint] = account
        const package_name_prefix = 'com.'
        const keystoreName = gameName
          .replace(/\s/g, '')
          .toLowerCase()
          .padEnd(6, '0')
        const drive = await getDrive()
        let folderIdByGameName
        let sheetChecklistId
        let keystoreLink, folders, rowsMap
        await runWithMessage(
          `Uploading keystorefile to google storage...`,
          async () => {
            const { data: keystoreArrayBuffer } = await axios.get(
              `${keystoreApiEndPoint}${keystoreName}`,
              {
                responseType: 'arraybuffer',
              }
            )
              // upload keystore to GCS && check folder exists
              ;[keystoreLink, folders] = await Promise.all([
                uploadGCS(
                  `${keystoreName}_${uuidv4()}.keystore`,
                  keystoreArrayBuffer,
                  process.env.BUCKET_NAME_KEYSTORE_CHECKLIST
                ),
                searchDriveByKeyword(
                  drive,
                  `mimeType = 'application/vnd.google-apps.folder' and name = '${gameName}' and '${process.env.FOLDER_ID_PROJECT_CHECKLIST}' in parents`
                ),
              ])
          }
        )

        await runWithMessage(
          `Checking folder and file sheet exists...`,
          async () => {
            // create folder by game name if it doesn't exists
            if (folders.length > 0) {
              folderIdByGameName = folders[0].id
            } else {
              folderIdByGameName = await createFolder(
                drive,
                gameName,
                process.env.FOLDER_ID_PROJECT_CHECKLIST
              )
            }
            // check file checklist exists
            const files = await searchDriveByKeyword(
              drive,
              `mimeType = 'application/vnd.google-apps.spreadsheet' and name contains 'Checklist' and '${folderIdByGameName}' in parents`
            )
            if (files.length > 0) {
              sheetChecklistId = files[0].id
            } else {
              sheetChecklistId = await duplicateFile(
                drive,
                process.env.SHEET_ID_CHECKLIST_TEMPLATE,
                folderIdByGameName,
                `${gameName} (${initials(gameName)}) Project Checklist`
              )
            }
          }
        )

        await runWithMessage(
          `Fetching data sheet checklist and update data...`,
          async () => {
            // fetch data checklist sheet
            const {
              data: { values: valuesCheckListSheet },
            } = await sheets.spreadsheets.values.get({
              spreadsheetId: sheetChecklistId,
              range: 'Checklist!A:B',
            })
            rowsMap = _.chain(valuesCheckListSheet)
              .map(([name], index) => ({ name, index: index + 1 }))
              .keyBy('name')
              .mapValues('index')
              .mapValues((index) => `Checklist!B${index}`)
              .value()
            let promiseUpdateKeyStoreLinkCell
            const positionKeyStoreLinkCell = rowsMap['Keystore Link']
            if (positionKeyStoreLinkCell) {
              promiseUpdateKeyStoreLinkCell = sheets.spreadsheets.values.update(
                {
                  spreadsheetId: sheetChecklistId,
                  range: positionKeyStoreLinkCell,
                  valueInputOption: 'USER_ENTERED',
                  resource: {
                    values: [[keystoreLink]],
                  },
                }
              )
            } else {
              promiseUpdateKeyStoreLinkCell =
                await sheets.spreadsheets.values.append({
                  spreadsheetId: sheetChecklistId,
                  range: `Checklist!A:B`,
                  valueInputOption: 'RAW',
                  resource: {
                    values: [['Keystore Link', keystoreLink]],
                  },
                })
            }
            // update data check list sheet
            const package_name = `${package_name_prefix}${gameName
              .toLowerCase()
              .replaceAll(' ', '.')
              .replaceAll(/\.(\d)/g, '.x$1')}`
            const promisesUpdateSheet = [
              { key: 'Keystore Name', value: keystoreName },
              { key: 'Support Email', value: supportEmail },
              { key: 'Tên game', value: gameName },
              { key: 'BundleID', value: package_name },
            ].map((el) => {
              if (rowsMap[el.key]) {
                return sheets.spreadsheets.values.update({
                  spreadsheetId: sheetChecklistId,
                  range: rowsMap[el.key],
                  valueInputOption: 'USER_ENTERED',
                  resource: {
                    values: [[el.value]],
                  },
                })
              } else {
                return sheets.spreadsheets.values.append({
                  spreadsheetId: sheetChecklistId,
                  range: `Checklist!A:B`,
                  valueInputOption: 'RAW',
                  resource: {
                    values: [[el.key, el.value]],
                  },
                })
              }
            })
            await Promise.allSettled([
              ...promisesUpdateSheet,
              promiseUpdateKeyStoreLinkCell,
            ])
          }
        )

        if (shouldCreateGitlab) {
          await runWithMessage(`Checking repo on gitlab...`, async () => {
            try {
              const { http_url_to_repo } = await createGitlab(gameName)
              await sheets.spreadsheets.values.update({
                spreadsheetId: sheetChecklistId,
                range: rowsMap['Gitlab project'],
                valueInputOption: 'USER_ENTERED',
                resource: {
                  values: [[http_url_to_repo]],
                },
              })
            } catch (error) {
              console.error(error)
            }
          })
        }

        await runWithMessage(
          `Updating marketing **Overall Game** list...`,
          async () => {
            const {
              data: {
                values: { length: rows },
              },
            } = await sheets.spreadsheets.values.get({
              spreadsheetId: process.env.SHEET_ID_OVERALL_CHECKLIST,
              range: 'Game list!A:A',
            })
            const { data } = await sheets.spreadsheets.values.get({
              spreadsheetId: sheetChecklistId,
              range: rowsMap['BundleID'],
            })
            const {
              values: [[bundleId]],
            } = data
            await sheets.spreadsheets.values.update({
              spreadsheetId: process.env.SHEET_ID_OVERALL_CHECKLIST,
              range: `Game list!A${rows + 1}:F${rows + 1}`,
              valueInputOption: 'USER_ENTERED',
              resource: {
                values: [
                  [
                    gameName,
                    initials(gameName),
                    'Android',
                    bundleId,
                    bundleId,
                    'CPI Testing',
                  ],
                ],
              },
            })
          }
        )
        const [{ content: contentMessageEdit }, { content: contentMessageView }] =
          await Promise.all([
            getMessage(
              process.env.CHANNEL_CHECKLIST_GRANT_ACCESS_ID,
              process.env.MESSAGE_LIST_EMAIL_CHECKLIST_EDIT_ROLE_ID
            ),
            getMessage(
              process.env.CHANNEL_CHECKLIST_GRANT_ACCESS_ID,
              process.env.MESSAGE_LIST_EMAIL_CHECKLIST_VIEW_ROLE_ID
            ),
          ])
        await runWithMessage(
          `Grant access checklist sheet...`,
          async () => {
            if (contentMessageEdit && contentMessageEdit.split('\n').length > 0) {
              const listEmailEdit = contentMessageEdit.split('\n')
              await Promise.all(
                listEmailEdit.map((email) =>
                  grantAccess(drive, 'writer', email, sheetChecklistId)
                )
              )
            }
            if (contentMessageView && contentMessageView.split('\n').length > 0) {
              const listEmailView = contentMessageView.split('\n')
              await Promise.all(
                listEmailView.map((email) =>
                  grantAccess(drive, 'reader', email, sheetChecklistId)
                )
              )
            }
          }
        )

        ctx.send({
          content: `${gameName} Project Checklist: https://docs.google.com/spreadsheets/d/${sheetChecklistId}`,
          ephemeral: true,
        })
      } catch (e) {
        console.error(e)
        ctx.send({
          content: e.toString(),
          ephemeral: true,
        })
        throw e
      }
    }

    async autocomplete(ctx) {
      try {
        switch (ctx.focused) {
          case 'account': {
            const account = ctx.options.account
            const sheets = await getSheets()
            const {
              data: { values },
            } = await sheets.spreadsheets.values.get({
              spreadsheetId: process.env.SHEET_ID_ACCOUNT_CHECKLIST_CREATE,
              range: 'Accounts!A2:D',
            })
            const results = _.chain(values)
              .map(
                ([accountName, supportEmail, status, keystoreApiEndPoint]) => ({
                  accountName,
                  supportEmail,
                  status,
                  keystoreApiEndPoint,
                })
              )
              .filter((account) => account.status == 'Alive')
              .keyBy('accountName')
              .value()
            const renderList = _.map(results, (account) => ({
              name: account.accountName,
              value: account.accountName,
            }))
            if (!account) {
              return ctx.sendResults([...renderList])
            }
            const listTypeFilter = [...renderList]
              .filter((el) => {
                return el.name.toLowerCase().includes(account.toLowerCase())
              })
              .splice(0, 20)
            return ctx.sendResults(
              listTypeFilter.length > 0
                ? listTypeFilter
                : [
                  {
                    name: 'Not found account',
                    value: '',
                  },
                ]
            )
          }
          default:
            break
        }
      } catch (error) {
        console.error(__filename, error.message)
      }
    }
  }
