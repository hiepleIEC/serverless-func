const fs = require('fs');
// const str = fs.readFileSync("playable.html", "utf8");


(() => {
 // read file image
 // convert base 64
 // replace html
 // make copy
})()

// function to encode file data to base64 encoded string
function base64_encode(file) {
 // read binary data
 var bitmap = fs.readFileSync(file);
 // convert binary data to base64 encoded string
 const data = new Buffer.from(bitmap).toString('base64');
 console.log({ data })
}

base64_encode('./Noel/1.png');