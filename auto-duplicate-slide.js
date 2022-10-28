const dateObj = new Date();
const month = dateObj.getUTCMonth() + 1;
const day = dateObj.getUTCDate();
const year = dateObj.getUTCFullYear();
const date = `${day}/${month}/${year}`;
const srcId = "1R9nCXYxkr_2IcnnLkuVCJGaLY7kyovnWIWMUDasNgWs";
const folderId = '1jtzUIgRs2qtp31HvAOSZr8a7uVCGDMzW';
const slideName = `Auto Duplicate slide ${date}`
function doGet() {
  const file = DriveApp.getFileById(srcId).makeCopy();
  file.setName(slideName)
  DriveApp.getFolderById(folderId).addFile(file);
  return HtmlService.createHtmlOutput(`Duplicate slide ${file.getName()} completed `)
}
