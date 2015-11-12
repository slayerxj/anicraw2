var fs = require("fs");
var http = require("http");

var Database = require("./database.js");
var generatePage = require("./pageGenerater.js");

var ifRegen = (process.argv[2] === "r");
var database = new Database();

if (ifRegen) {
    database
        .regenerate(function () {
            database
                .rank()
                .updateRecord();
        });
} else {
    database
        .initialize()
        .update(function () {
            database.rank()
                .updateRecord();
        });
}

fs.readFile("./mainPage.html", "utf8", function (err, html) {
    if (err) {
        throw err;
    }

    http.createServer(function (request, response) {
        console.log("createServer");
        var insertString = generatePage(database);
        html = html.replace("--PLACEHOLDER--", insertString);
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(html);
        response.end();
    }).listen(3000);
});