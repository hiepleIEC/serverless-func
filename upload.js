const axios = require('axios')
const { Storage } = require('@google-cloud/storage')
const BUCKET_NAME = 'idea-attacments'
const PROJECT_ID = 'be-dev-364407'
const gcs = new Storage({
  projectId: PROJECT_ID,
  keyFilename: './service-account.json',
})
const url =
  'https://cdn.discordapp.com/ephemeral-attachments/1046642411880861706/1046691420863463465/index.html'
const originalFileName = url.split('/').slice(-1).pop()
const bucket = gcs.bucket(BUCKET_NAME)
;(async () => {
  try {
    const res = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    }).then(async (response) => {
      console.log(response.headers)
      await uploadGCS(originalFileName, response.data)
    })
    console.log({ res })
  } catch (error) {
    console.log(error.message)
  }
})()

const uploadGCS = async (fileName, fileData) => {
  const gcsFileName = fileName
  const file = bucket.file(gcsFileName)
  await file.save(fileData)
  return file
    .makePublic()
    .then(
      (res) => `https://storage.googleapis.com/${BUCKET_NAME}/${res[0].object}`
    )
}
