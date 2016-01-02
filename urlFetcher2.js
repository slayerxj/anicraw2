// var fs = require("fs");

// var async = require("async");

// var site = require("./websites/index.js");
// var currentSite = null;

// var retry = 5;
// var failedUrl = [];

// var fetchUrlOneByOne = function (urlNumber, database, whenPageIsLoaded) {
//     console.log("Start to load page", urlNumber);
//     var url = currentSite.getFullUrl(urlNumber);

//     request
//         .get(url)
//         .end(function (err, res) {
//             if (err) {
//                 console.log("An error is happend");
//                 console.log("Stack trace: ", err.stack);
//                 if (retry !== 0) {
//                     fetchUrlOneByOne(urlNumber, database, whenPageIsLoaded);
//                     retry--;
//                 } else {
//                     retry = 5;
//                     fetchUrlOneByOne(urlNumber + 1, database, whenPageIsLoaded);
//                     failedUrl.push(parseInt(urlNumber));
//                 }
//             } else {
//                 console.log("Page", urlNumber, "is loaded");
//                 var isVisitedPage = currentSite.parsePage(res.text, database);
//                 if (isVisitedPage) {
//                     console.log("stopped");
//                     whenPageIsLoaded();
//                     return;
//                 } else {
//                     fetchUrlOneByOne(urlNumber + 1, database, whenPageIsLoaded);
//                 }
//             }
//         });
// };

// var fetchUrl = function (urlNumber, database, callback) {
//     console.log("Start to load page", urlNumber);
//     var url = currentSite.getFullUrl(urlNumber);

//     request
//         .get(url)
//         .end(function (err, res) {
//             if (err) {
//                 callback(err);
//                 console.log("An error is happend");
//                 console.log("Stack trace: ", err.stack);
//                 failedUrl.push(parseInt(urlNumber));
//             } else {
//                 currentSite.parsePage(res.text, database, callback);
//                 console.log("Page", urlNumber, "is loaded");
//             }
//         });
// };

// module.exports.getOneByOne = function (database, whenPageIsLoaded) {
//     fetchUrlOneByOne(1, database, whenPageIsLoaded);
// };

// module.exports.getAll = function (domain, database, whenFinish) {
//     currentSite = site[domain];
//     var urlNumbers = [];
//     for (var i = 1; i < currentSite.lastPageNumber + 1; i++) {
//         urlNumbers.push(i);
//     }

//     async.eachLimit(urlNumbers, currentSite.numberOfConcurrency, function (urlNumber, callback) {
//         fetchUrl(urlNumber, database, callback);
//     }, function (err) {
//         if (err) {
//             console.log("End error is happend");
//             console.log("Stack trace: ", err.stack);
//         }

//         console.log("finished");
//         if (failedUrl.length) {
//             console.log("The following page failed.", failedUrl.reduce(function (pre, cur) {
//                 return pre + ", " + cur;
//             }));
//         }

//         whenFinish();
//     });
// };





var request = require("superagent");
var defaultConfiguration = require("./defaultConfiguration.js");

var urlQueue = [];
var urlFailCount = {};
var overallFailCount = 0;
var failedUrl = [];
var currentSite = null;
var retry = defaultConfiguration.defaultRetry;
var overallRetry = defaultConfiguration.defaultOverallRetry;

var increaseOverallFailCount = function() {
    overallFailCount = overallFailCount + 1;
    
    if (overallFailCount > overallRetry) {
        pauseFetchingUrls();
        setTimeout(startFetchingUrls, 120000);
    }
};

var handleFetchUrlFailed = function (url, callback) {
    urlFailCount[url] = urlFailCount[url] + 1;
    
    if (urlFailCount[url] <= retry) {
        pushUrlToQueue(url, callback);
    } else {
        failedUrl.push(url);
    }
};

var fetchUrl = function (url, callback) {
    request
        .get(url)
        .end(function (err, res) {
            if (err) {
                console.log("Load", url, "is failed");
                console.log("Stack trace: ", err.stack);
                handleFetchUrlFailed(url, callback);
            } else {
                console.log(url, "is loaded");
                callback(res);
            }
        });
};

var pushUrlToQueue = function (url, callback) {
    urlQueue.push({ url, callback });
}

var pauseFetchingUrls = function() {};
var startFetchingUrls = function() {};

module.exports = {
    pushUrlToQueue
}