var cheerio = require("cheerio");
var request = require("superagent");

var Item = require('../item.js');
var util = require('../util.js');

var domain = "http://www.kisssub.org/";
var searchPagePostfix = ".html";

var getFullUrl = function (urlNumber) {
    return domain + urlNumber.toString() + searchPagePostfix;;
};

var parseDetailPage = function (resText, item) {
    var timeString = util.sliceString(resText, "发布时间: ", "</p>");
    item.publishTime = new Date(timeString);

    var linkString = util.sliceString(resText, "a id=\"magnet\" href=\"", "\">磁力下载</a>");
    item.magnetLink = linkString;
}

var getDetailByDetailPage = function (item, database, count, callback) {
    request
        .get(item.url)
        .end(function (err, res) {
            if (err) {
                console.log("Fail to get details");
                console.log("Stack trace: ", err.stack);
            } else {
                console.log("Success to load detail page");
                parseDetailPage(res.text, item);
            }
            
            count.value--;
            if(count.value === 0) {
                callback();
            }
        });
}

var parsePage = function (responseText, database, callback) {
    var allEntrys = getAllEntrysOfOnePage(responseText);
    var entryNum = allEntrys.length;
    var count = {
        value: entryNum
    };
    for (var i = 0; i < entryNum; i++) {
        var item = parseEntry(allEntrys[i], callback);
        if (item) {
            getDetailByDetailPage(item, database, count, callback);
            database.insert(item);
        } else {
            count.value--;
            if (count.value === 0) {
                callback();
            }
        }
    }
    // TODO
    return true;
};

var getAllEntrysOfOnePage = function (responseText) {
    var $ = cheerio.load(responseText);
    var allEntryObject = $('#data_list').first().children();
    var allEntrys = [];
    for (var i = 0; i < allEntryObject.length; i++) {
        allEntrys.push(allEntryObject[i]);
    }

    return allEntrys;
};

var parseEntry = function (entry) {
    var timeString = entry.children[1].children[0].data;
    var detailPageString = entry.children[5].children[1].attribs.href;
    var mixedTitleString = entry.children[5].children[1].children[0].data;
    // var sizeString = entry.children[7].children[0].data;

    if (util.isWorthCreateNewItem(mixedTitleString)) {
        var item = new Item();
        item.name = mixedTitleString;
        item.publishTime = new Date(timeString);
        item.url = domain + detailPageString;

        return item;
    } else {
        return undefined;
    }
};

// var insertLogic =  function () {
//     while (entry.text()) {
//         entry = parseEntry(entry);
//         if (entry) {
//             hasEntryGen = true;
//             insertSuccess = database.insert(entry);
//             if (insertSuccess) {
//                 isEntirePageInsertFailed = false;
//                 entry.isNew = true;
//             }
//         }
//         entry = entry.next();
//     }

//     var isVisitedPage = hasEntryGen && isEntirePageInsertFailed;
//     if (isVisitedPage) {
//         return true;
//     } else {
//         return false;
//     }
// };

module.exports = {
    // TODO: Auto fetch
    lastPageNumber: 600,
    numberOfConcurrency: 1,
    parsePage: parsePage,
    getFullUrl: getFullUrl
};