require('dotenv').config()
const _ = require('lodash')
const { google } = require('googleapis')
const { getAuth } = require('./google')

module.exports = {
  getDrive: async () => {
    const auth = await getAuth()
    return google.drive({ version: 'v3', auth })
  },

  getForm: async () => {
    const auth = await getAuth()
    console.log({ auth })
    return google.forms({ version: 'v1', auth })
  },

  matchDriveFolderId: (url) => {
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/)
    if (!match) return

    const [, id] = match
    return id
  },
  getFileIdFromDriveLink: (shareUrl) => {
    const match1 = shareUrl.match(/file\/d\/(.+)\/view/)
    if (match1) return match1[1]
    const match2 = shareUrl.match(/uc\?id=(.+)&/)
    if (match2) return match2[1]
    const match3 = shareUrl.match(/open\?id=(.+)/)
    if (match3) return match3[1]
    return false
  },
  parseSheetUrl: async (sheetUrl) => {
    const match = sheetUrl.match(/\/d\/(.+)\/.+gid=(\d+)/)

    if (!match) return null
    else
      return {
        spreadsheetId: match[1],
        sheetId: match[2],
      }
  },

  downloadDrive: (drive, fileId, path) =>
    new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(path)
      drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        {
          responseType: 'stream',
        },
        (err, res) => {
          if (err) return reject(err)
          res.data
            .on('end', function () {
              resolve()
            })
            .on('error', function (err) {
              reject(err)
            })
            .pipe(dest)
        }
      )
    }),
  metadata: (drive, fileId) =>
    new Promise((resolve, reject) => {
      drive.files.get(
        {
          fileId: fileId,
          fields: 'name',
        },
        (err, res) => {
          if (err) return reject(err)
          resolve(res.data)
        }
      )
    }),
  searchDriveByKeyword: async (drive, keyword) => {
    const {
      data: { files },
    } = await drive.files.list({
      q: keyword,
      fields: 'nextPageToken, files(id, name)',
      pageSize: 1,
    })
    return files
  },
  createFolder: async (drive, folderName, folderParentId) => {
    const { data } = await drive.files.create({
      resource: {
        name: folderName,
        parents: [folderParentId],
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    })
    return data.id
  },
  duplicateFile: async (drive, fileTemplateId, folderParentId, folderName) => {
    const { data } = await drive.files.copy({
      fileId: fileTemplateId,
      requestBody: {
        name: folderName,
        parents: [folderParentId],
      },
    })
    return data.id
  },
  // getFilesInFolder: async (drive, folderId, options = {}) => {
  //   const { data } = await drive.files.list({
  //     q: `'${folderId}' in parents and trashed=false`,
  //   })
  //   return data.files
  // },
  getFilesInFolder: async (drive, options = {}) => {
    console.log({ options })
    const { data } = await drive.files.list(options)
    return data.files
  },
  grantAccess: async (drive, role, emailAddress, fileId) => {
    return drive.permissions.create({
      resource: {
        type: 'user',
        role,
        emailAddress,
      },
      fileId,
      fields: 'id',
    })
  },
}
