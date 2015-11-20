var fs = require("fs");
var request = require("superagent");
var async = require("async");

var pageParser = require("./pageParser.js");

var domain = "http://share.popgo.org";
var searchPagePostfix = "/search.php?title=&groups=&uploader=&sorts=&orderby=&page=";
var fullUrl = domain + searchPagePostfix;
var lastPageNumber = 3296;
var numberOfConcurrency = 10;

var failedUrl = [];

var fetchUrl = function (urlNumber, database, callback, autoNext, whenFinish) {
    console.log("Start to load page", urlNumber);
    var url = fullUrl + urlNumber.toString();

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

            var isVisitedPage = pageParser[domain](res.text, database);
            callback();
            if (autoNext) {
                whenFinish();
                if (isVisitedPage) {
                    console.log("stopped");
                    return;
                } else {
                    fetchUrl(urlNumber + 1, database, callback, autoNext, whenFinish);
                }
            }
        });
};

module.exports.getOneByOne = function (database, whenFinish) {
    fetchUrl(1, database, function () { }, true, whenFinish);
};

module.exports.getAll = function (database, whenFinish) {
    var urlNumbers = [];
    for (var i = 20; i < lastPageNumber + 1; i++) {
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
