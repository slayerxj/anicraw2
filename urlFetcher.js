var fs = require("fs");
var request = require("superagent");
var cheerio = require("cheerio");
var async = require("async");

var createItemFromEntry = require("./entryParser.js");

var domain = "http://share.popgo.org";
var searchPagePostfix = "/search.php?title=&groups=&uploader=&sorts=&orderby=&page=";
var fullUrl = domain + searchPagePostfix;
var lastPageNumber = 100;
var numberOfConcurrency = 12;

var failedUrl = [];

var fetchUrl = function (urlNumber, database, callback, autoNext) {
    console.log("Start to load page", urlNumber);
    var url = fullUrl + urlNumber.toString();
    var allPageInsertFail = true;

    request
        .get(url)
        .end(function (err, res) {
            if (err) {
                failedUrl.push(parseInt(urlNumber));
                console.log("An error is happend");
                console.log("Stack trace: ", err.stack);
                callback(err);
                if (autoNext) {
                    fetchUrl(urlNumber + 1, database, callback, autoNext);
                }
                return;
            }

            console.log("Page", urlNumber, "is loaded");
            var $ = cheerio.load(res.text);

            var entry = $('#index_maintable').children().children().first();

            var item, insertSuccess;

            while (entry.text()) {
                item = createItemFromEntry(entry);
                // var isForceTop = (entry.text().indexOf("置顶") !== -1);

                if (item) {
                    insertSuccess = database.insert(item);
                    if (insertSuccess) {
                        allPageInsertFail = false;
                        item.isNew = true;
                    }
                    // if (!insertSuccess && !isForceTop) {
                    // return;
                    // }
                }
                entry = entry.next();
            }
            callback();
            if (autoNext) {
                if (allPageInsertFail) {
                    return;
                } else {
                    fetchUrl(urlNumber + 1, database, callback, autoNext);
                }
            }
        });
};

module.exports.getOneByOne = function (database, whenFinish) {
    fetchUrl(1, database, function () { }, true);
}

module.exports.getAll = function (database, whenFinish) {
    var urlNumbers = [];
    for (var i = 10; i < lastPageNumber + 1; i++) {
        urlNumbers.push(i);
    }

    async.eachLimit(urlNumbers, numberOfConcurrency, function (urlNumber, callback) {
        fetchUrl(urlNumber, database, callback);
    }, function (err) {
        if (err) {
            console.log("End error is happend");
            console.log("Stack trace: ", err.stack);
        }

        console.log("finished");
        if (failedUrl.length) {
            console.log("The following page failed.", failedUrl.reduce(function (pre, cur) {
                return pre + ", " + cur;
            }));
        }

        whenFinish();
    });
};
