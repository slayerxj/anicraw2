var Database = require('./database.js');
var lastResult = require("./result.js");
var generatePage = require("./pageGenerater.js");

var database = new Database();
database.initialize(lastResult);

var http = require('http');
var fs = require('fs');

var insertString = generatePage(database.content);
fs.readFile('./mainPage.html', "utf8", function (err, html) {
    if (err) {
        throw err;
    }
    
    html = html.replace("--PLACEHOLDER--", insertString);
    http.createServer(function (request, response) {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(html);
        response.end();
    }).listen(3000);
});