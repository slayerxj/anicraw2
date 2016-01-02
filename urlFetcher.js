var fs = require("fs");
var request = require("superagent");
var async = require("async");

var site = require("./websites/index.js");
var currentSite = null;

var retry = 5;
var failedUrl = [];

var fetchUrlOneByOne = function (urlNumber, database, whenPageIsLoaded) {
    console.log("Start to load page", urlNumber);
    var url = currentSite.getFullUrl(urlNumber);

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
                var isVisitedPage = currentSite.parsePage(res.text, database);
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
    var url = currentSite.getFullUrl(urlNumber);

    request
        .get(url)
        .end(function (err, res) {
            if (err) {
                callback(err);
                console.log("An error is happend");
                console.log("Stack trace: ", err.stack);
                failedUrl.push(parseInt(urlNumber));
            } else {
                currentSite.parsePage(res.text, database, callback);
                console.log("Page", urlNumber, "is loaded");
            }
        });
};

module.exports.getOneByOne = function (domain, database, whenPageIsLoaded) {
    currentSite = site[domain];
    fetchUrlOneByOne(1, database, whenPageIsLoaded);
};

module.exports.getAll = function (domain, database, whenFinish) {
    currentSite = site[domain];
    var urlNumbers = [];
    for (var i = 1; i < currentSite.lastPageNumber + 1; i++) {
        urlNumbers.push(i);
    }

    async.eachLimit(urlNumbers, currentSite.numberOfConcurrency, function (urlNumber, callback) {
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
