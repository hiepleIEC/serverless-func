const moment = require('moment-timezone')
const secs = 456;

const formatted = moment.unix(1559531923).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');

downloadTaskFile: async function (taskId) {
 const results = await requestKanboard(
     'getAllTaskFiles',
     { task_id: taskId }
 )
 return results
},
console.log({formatted})

await runWithMessage(`Download attachment from Kanboard && Upload to GSC`, async ({ updateContent }) => {
 const batchAllTaskFiles = batchArr(taskFiles, 10)
 for (let i = 0; i < batchAllTaskFiles.length; i++) {
   const batch = batchAllTaskFiles[i];
   // await P
   const dataDownload = await Promise.all(batch.map(el=>{
    return downloadTaskFile(el.id)
   }))
 }
})