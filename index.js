require('dotenv').config()
const moment = require('moment-timezone')
const { google } = require('googleapis')
const fetch = require('node-fetch')
const DISCORD_URL = process.env.DISCORD_URL || 'https://discord.com/api/v9'
const SHEET_ID = process.env.SHEET_ID;
const TYPE_REMAINDER = {
  ONCE: '1',
  DAILY: '2',
  WEEKLY: '3',
}
exports.myFunction = async () => {
  const { sheets, values } = await getDataFromSheet(
    SHEET_ID,
    'List'
  )
  for (let i = 1; i < values.length; i++) {
    const type = values[i][6]
    const row = i + 1
    switch (type) {
      case TYPE_REMAINDER.ONCE: {
        processMessageFollowType(values[i], sheets, row, type)
        break
      }
      case TYPE_REMAINDER.DAILY: {
        processMessageFollowType(values[i], sheets, row, type)
        break
      }
      case TYPE_REMAINDER.WEEKLY: {
        processMessageFollowType(values[i], sheets, row, type)
        break
      }
      default:
        processMessageFollowType(values[i], sheets, row, type)
    }
  }
}

const processMessageFollowType = async (
  [userID, messageID, channelID, time],
  sheets,
  row,
  type
) => {
  try {
    switch (type) {
      case TYPE_REMAINDER.ONCE: {
        if (new Date(time) < new Date()) {
          // send message to discord;
          await sendMessageToDiscord(messageID, channelID,userID)
          // delete row in sheet
          await deleteRow(sheets, SHEET_ID, row)
        }
        break
      }
      case TYPE_REMAINDER.DAILY: {
        const oldReminderTime = new Date(time)
        if (oldReminderTime < new Date()) {
          // send message to discord;
          await sendMessageToDiscord(messageID, channelID,userID)
          // update row in sheet
          const newReminderTime = oldReminderTime.setDate(
            oldReminderTime.getDate() + 1
          )
          const rowValue = [
            userID,
            messageID,
            channelID,
            moment(newReminderTime)
              .tz('Asia/Ho_Chi_Minh')
              .format('MMMM DD YYYY h:mm:ss a'),
          ]
          await updateRowSheet(sheets, row, rowValue)
        }
        break
      }
      case TYPE_REMAINDER.WEEKLY: {
        const oldReminderTime = new Date(time)
        if (new Date(time) < new Date()) {
          // send message to discord;
          await sendMessageToDiscord(messageID, channelID, userID)
          // update row in sheet
          const newReminderTime = oldReminderTime.setDate(
            oldReminderTime.getDate() + 7
          )
          const rowValue = [
            userID,
            messageID,
            channelID,
            moment(newReminderTime)
              .tz('Asia/Ho_Chi_Minh')
              .format('MMMM DD YYYY h:mm:ss a'),
          ]
          await updateRowSheet(sheets, row, rowValue)
        }
        break
      }
      default: {
        if (new Date(time) < new Date()) {
          // send message to discord;
          await sendMessageToDiscord(messageID, channelID, userID)
          // delete row in sheet
          await deleteRow(sheets, SHEET_ID, row)
        }
        break
      }
    }
  } catch (error) {
    console.log(error)
  }
}


const getAuthGoogle = async () => {
  const oAuth2Client = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/devstorage.read_only',
    ]
  })
  return google.sheets({ version: 'v4', oAuth2Client })
}

const getSheets = () => {
  const auth = getAuthGoogle()
  return google.sheets({ version: 'v4', auth })
}

const getDataFromSheet = async (sheetId, sheetName) => {
  const sheets = getSheets()
  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:G`,
  })
  return { sheets, values }
}

const updateRowSheet = (sheets, row, rowValue) =>
  sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `List!A${row}:G${row}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [rowValue],
    },
  })

const deleteRow = (sheets, sheetId, row) => {
  const batchUpdateRequest = {
    requests: [
      {
        deleteDimension: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: parseInt(row - 1),
            endIndex: parseInt(row),
          },
        },
      },
    ],
  }
  return sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    resource: batchUpdateRequest,
  })
}

const sendMessageToDiscord = async (messageID, channelID,userID) => {
  const options = {
    method: 'post',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message_reference: { message_id: messageID },content:`<@${userID}>` }),
  }
  const response = await fetch(
    `${DISCORD_URL}/channels/${channelID}/messages`,
    options
  )
  const data = await response.json()
  return data
}

