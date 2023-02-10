require('dotenv').config()
const { google } = require('googleapis')
const moment = require('moment')
const request = require('request')
const { parse } = require('csv-parse')
const PROJECT_ID = 'be-dev-364407'
// const oAuth2Client = new google.auth.GoogleAuth({
//   projectId: PROJECT_ID,
//   keyFilename: './service-account.json',
// })

const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN, scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
  ]
})
  ;
// oAuth2Client.defaultScopes[
//   'https://www.googleapis.com/auth/drive',
//   'https://www.googleapis.com/auth/spreadsheets',
// ]
; ((column, sheetId, spreadsheetId) => {
  oAuth2Client.getRequestHeaders().then((authorization) => {
    const spreadsheetId = '10swVLyLzApaVNnjCI-W585q2oRIIyyLFe8gIHALEniQ' // Please set the Spreadsheet ID.
    const sheetId = 0 // Please set the sheet ID.
    const searchId = `Previous` // what im searching for
    const query = `select * where ${column} like '%${searchId}%' limit 20` // K can be changed to the col the data is on
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${sheetId}&tq=${encodeURI(
      query
    )}`
    console.log(url)
    let options = {
      url: url,
      method: 'GET',
      headers: authorization,
    }
    request(options, (err, res, result) => {
      if (err) {
        console.log(err)
        return
      }
      console.log(result)
      parse(result, {}, (err, ar) => console.log(ar))
    })
  })
})('C')
