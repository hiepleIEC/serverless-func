const { google } = require('googleapis')
const { Storage } = require('@google-cloud/storage')
const DRIVE_CREDENTIALS = process.env.DRIVE_CREDENTIALS
const DRIVE_TOKEN = process.env.DRIVE_TOKEN

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/drive.file',
]

module.exports = {
  getAuth: () => {
    if (process.env.SERVICE_ACCOUNT_FILENAME && process.env.PROJECT_ID_GCP) {
      const auth = new google.auth.GoogleAuth({
        projectId: process.env.PROJECT_ID_GCP,
        keyFilename: `./${process.env.SERVICE_ACCOUNT_FILENAME}`,
        scopes: DEFAULT_SCOPES,
      })
      return auth
    } else if (DRIVE_CREDENTIALS && DRIVE_TOKEN) {
      const credentialsString = DRIVE_CREDENTIALS
      const tokenString = DRIVE_TOKEN

      const credentials = JSON.parse(credentialsString)
      const token = JSON.parse(tokenString)

      const { client_secret, client_id, redirect_uris } = credentials.installed
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      )

      oAuth2Client.setCredentials(token)
      return oAuth2Client
    } else {
      return google.auth.getClient({
        scopes: DEFAULT_SCOPES,
      })
    }
  },

  getAuthForGCS: () => {
    if (process.env.SERVICE_ACCOUNT_FILENAME && process.env.PROJECT_ID_GCP) {
      return new Storage({
        projectId: process.env.PROJECT_ID_GCP,
        keyFilename: `./${process.env.SERVICE_ACCOUNT_FILENAME}`,
      })
    } else {
      return new Storage()
    }
  },

  createGetTokenAgent: (SCOPES = DEFAULT_SCOPES) => {
    const credentialsString = DRIVE_CREDENTIALS
    const credentials = JSON.parse(credentialsString)

    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )

    return {
      authUrl: oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      }),

      getToken: (code) =>
        new Promise((resolve, reject) => {
          oAuth2Client.getToken(code, (err, token) => {
            if (err) reject(err.toString())
            else resolve(token)
          })
        }),
    }
  },
}
