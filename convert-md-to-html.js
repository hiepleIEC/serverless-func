const { Remarkable } = require('remarkable');
const showdown   = require('showdown');
const markdown = require("markdown-js");
const fs = require("fs");
const str = fs.readFileSync("private-policy.md", "utf8");
const result = markdown.makeHtml(str);
console.log(result);


