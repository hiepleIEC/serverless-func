require('dotenv').config()
const {
  getFilesInFolder,
  createFolder,
  getDrive,
  duplicateFile,
} = require('./drive')
;(async () => {
  // create folder
  const drive = await getDrive()
  const folderId = '1kJyHnkMU2JRHm9ZhYUXrZseMpUaZaDT0'
  const gameDesignFolderId = await createFolder(drive, 'Game Design', folderId)
  // create folder overview && analytic tools
  const [analyticFolderId] = await Promise.all([
    createFolder(drive, 'Analytic Tools', gameDesignFolderId),
    createFolder(drive, 'Overview', gameDesignFolderId),
  ])
  console.log({ gameDesignFolderId })
  // duplicate file
  const [listFileAnaliticTool, listFilePO] = await Promise.all([
    getFilesInFolder(drive, {
      q: `'1mvN2vnlQeyf0UVa0_bVRu7f6RUGHorkZ' in parents and trashed=false'`,
    }),
    getFilesInFolder(drive, {
      q: `'17Q2ei416J6c0aMAgdCPgHQkoe2cXYWKl' in parents and trashed=false'`,
    }),
  ])
  console.log({ listFileAnaliticTool, listFilePO })
  // console.log({ listFileAnaliticTool, listFilePO })
  const promises = listFileAnaliticTool
    .map((file) =>
      duplicateFile(
        drive,
        file.id,
        analyticFolderId,
        `Disassemble Pin Puzzle (DPP) ${file.name}`
      )
    )
    .concat(
      listFilePO.map((file) =>
        duplicateFile(
          drive,
          file.id,
          folderId,
          `Disassemble Pin Puzzle (DPP) ${file.name}`
        )
      )
    )
  console.log({ promises })
  await Promise.all(promises)
})()
