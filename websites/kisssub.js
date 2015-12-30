var cheerio = require("cheerio");
var request = require("superagent");

var Item = require('../item.js');
var util = require('../util.js');

var domain = "http://www.kisssub.org/";

var parseDetailPage = function (resText, item) {
    var publishTimeP = resText.indexOf("发布时间: ");
    var publishTimeS = resText.indexOf("</p>", publishTimeP);
    var timeString = resText.slice(publishTimeP + 6, publishTimeS);
    item.publishTime = new Date(timeString);

    var linkP = resText.indexOf("a id=\"magnet\" href=\"");
    var linkS = resText.indexOf("磁力下载");
    var linkString = resText.slice(linkP + 20, linkS - 2);
    item.magnetLink = linkString;
}

var getDetailByDetailPage = function (item, database) {
    if (item) {
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
            });
    }
}

var parsePage = function (responseText, database) {
    var allEntrys = getAllEntrysOfOnePage(responseText);
    for (var i = 0; i < allEntrys.length; i++) {
        var item = parseEntry(allEntrys[i]);
        database.insert(item);
        getDetailByDetailPage(item, database);
    }
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
    var sizeString = entry.children[7].children[0].data;

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
    parsePage: parsePage
};