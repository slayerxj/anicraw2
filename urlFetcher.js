var fs = require("fs");
var request = require("superagent");
var cheerio = require("cheerio");

var createItemFromEntry = require("./entryParser.js");

var domain = "http://share.popgo.org";
var searchPagePostfix = "/search.php?title=&groups=&uploader=&sorts=&orderby=&page=";

var failedUrl = [];
var fetchUrl = function (urlNumber, database) {
    console.log("Start to load page", urlNumber);
    var fullUrl = domain + searchPagePostfix + urlNumber.toString();

    request
        .get(fullUrl)
        .end(function (err, res) {
            if (err) {
                failedUrl.push(parseInt(urlNumber));
                console.log("An error is happend");
                console.log("Stack trace: ", err.stack);
                return;
            }

            console.log("Page", urlNumber, "is loaded");
            var $ = cheerio.load(res.text);

            var entry = $('#index_maintable').children().children().first();

            var item, insertSuccess;

            while (entry.text()) {
                item = createItemFromEntry(entry);
                var isForceTop = (entry.text().indexOf("置顶") !== -1);

                if (item) {
                    insertSuccess = database.insert(item);
                    if (!insertSuccess && !isForceTop) {
                        // return;
                    }
                }
                entry = entry.next();
            }
            if (urlNumber < 3277) {
                fetchUrl(++urlNumber, database);
            } else {
                fs.writeFile("result.js", "module.exports = " + JSON.stringify(database.content), function (err) {
                    if (err) throw err;
                    console.log('It\'s saved!');
                });
            }
        });
};

module.exports = function (database) {
    fetchUrl(1, database);
}
