var fs = require("fs");
var request = require("superagent");
var async = require("async");

var pageParser = require("./pageParser.js");
var kisssub = require("./websites/kisssub.js");

var domain = "http://www.kisssub.org/";
var searchPagePostfix = ".html";
var fullUrl = domain + searchPagePostfix;
var lastPageNumber = 3321;
var numberOfConcurrency = 10;
var retry = 5;
var failedUrl = [];

var getFullUrl = function (urlNumber) {
    return domain + urlNumber.toString() + searchPagePostfix;;
};

var fetchUrlOneByOne = function (urlNumber, database, whenPageIsLoaded) {
    console.log("Start to load page", urlNumber);
    var url = getFullUrl(urlNumber);

    request
        .get(url)
        .end(function (err, res) {
            if (err) {
                console.log("An error is happend");
                console.log("Stack trace: ", err.stack);
                if (retry !== 0) {
                    fetchUrlOneByOne(urlNumber, database, whenPageIsLoaded);
                    retry--;
                } else {
                    retry = 5;
                    fetchUrlOneByOne(urlNumber + 1, database, whenPageIsLoaded);
                    failedUrl.push(parseInt(urlNumber));
                }
            } else {
                console.log("Page", urlNumber, "is loaded");
                var isVisitedPage = pageParser[domain](res.text, database);
                if (isVisitedPage) {
                    console.log("stopped");
                    whenPageIsLoaded();
                    return;
                } else {
                    fetchUrlOneByOne(urlNumber + 1, database, whenPageIsLoaded);
                }
            }
        });
};

var fetchUrl = function (urlNumber, database, callback) {
    console.log("Start to load page", urlNumber);
    var url = getFullUrl(urlNumber);

    request
        .get(url)
        .end(function (err, res) {
            if (err) {
                callback(err);
                console.log("An error is happend");
                console.log("Stack trace: ", err.stack);
                failedUrl.push(parseInt(urlNumber));
            } else {
                pageParser[domain](res.text, database);
                console.log("Page", urlNumber, "is loaded");
                callback();
            }
        });
};

module.exports.getOneByOne = function (database, whenPageIsLoaded) {
    fetchUrlOneByOne(1, database, whenPageIsLoaded);
};

module.exports.getAll = function (database, whenFinish) {
    var urlNumbers = [];
    for (var i = 1; i < lastPageNumber + 1; i++) {
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
