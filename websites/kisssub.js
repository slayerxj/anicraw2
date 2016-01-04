var cheerio = require("cheerio");
var request = require("superagent");

var urlFetcher = require('../urlFetcher.js');
var Item = require('../item.js');
var util = require('../util.js');

var domain = "http://www.kisssub.org/";
var searchPagePostfix = ".html";

var getFullUrl = function (urlNumber) {
    if (urlNumber === 1) {
        return domain;
    } else {
        return domain + urlNumber.toString() + searchPagePostfix;
    }
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

    if (util.isWorthCreateNewItem(mixedTitleString)) {
        var item = new Item();
        item.name = mixedTitleString;
        if (mixedTitleString.indexOf("[澄空学园&华盟字幕社] Sound!Euphonium 吹响吧！悠风号 BDRip 合集（修正）") !== -1) {
            console.log("bingo");
        }
        item.publishTime = new Date(timeString);
        item.url = domain + detailPageString;

        return item;
    } else {
        return undefined;
    }
};

var insertLogic = function (database, items) {
    var allPageInsertFail = true;
    items.forEach(function (item) {
        var insertStatus = database.insert(item);
        if (insertStatus) {
            allPageInsertFail = false;
        }
    })
    var isVisitedPage = (items.length !== 0) && allPageInsertFail;
    if (isVisitedPage) {
        return true;
    } else {
        return false;
    }
};

var getDetail = function (item, num) {
    console.log("getDetail", urlFetcher.urlQueue.length);

    var callback = function (responseText) {
        console.log("DetailPage loaded", urlFetcher.urlQueue.length);
        var timeString = util.sliceString(responseText, "发布时间: ", "</p>");
        item.publishTime = new Date(timeString);

        var linkString = util.sliceString(responseText, "a id=\"magnet\" href=\"", "\">磁力下载</a>");
        item.magnetLink = linkString;

        num.decrease();
    }

    urlFetcher.pushUrlToQueue(item.url, callback);
}

var parsePage = function (responseText, items, allSubPageFinish) {
    console.log("parsePage");
    var allEntrys = getAllEntrysOfOnePage(responseText);
    var num = {
        value: allEntrys.length,
        decrease: function () {
            num.value--;
            if (num.value === 0) {
                allSubPageFinish();
            }
        }
    };

    allEntrys.forEach(function (entry) {
        var item = parseEntry(entry);
        if (item) {
            item.index = items.length;
            items.push(item);
            getDetail(item, num);
        } else {
            num.decrease();
        }
    });
};

var fetchNextPage = function (database, pageCount) {
    console.log("fetchNextPage called");
    var items = [];
    var fullUrl = getFullUrl(pageCount);

    var allSubPageFinish = function () {
        var isVisitedPage = insertLogic(database, items);
        // if (!isVisitedPage) {
        //     fetchNextPage(database, pageCount + 1);
        // }
    };

    var pageFinish = function (responseText) {
        console.log("a main page finished");
        parsePage(responseText, items, allSubPageFinish);
    };

    console.log("start get main page");
    urlFetcher.pushUrlToQueue(fullUrl, pageFinish);
};

var fetchNew = function (database, fetchNewfinish) {
    fetchNextPage(database, 1);
    urlFetcher.startFetchingUrls(fetchNewfinish);
};

module.exports = {
    // TODO: Auto fetch
    lastPageNumber: 600,
    numberOfConcurrency: 1,
    fetchNew,
    parsePage,
    getFullUrl
};