var cheerio = require("cheerio");

var Item = require('./item.js');
var library = require('./library.js');

var permittedFormats = library.getFormatAliases();
var upperPermittedFormats = permittedFormats.map(function (cur) {
    return cur.toUpperCase();
});

var convertToStandardTime = function (entry) {
    var date = entry.children()[1].children[0].children[0].data;
    var time = entry.children()[1].children[1].data;
    return new Date("20" + date + "T" + time);
};

var parseEntry = function (entry) {
    var entryText = entry.text();
    if (upperPermittedFormats.some(function (format) {
        return (entryText.toUpperCase().indexOf(format) !== -1);
    })) {
        var item = new Item();
        var mainTd = entry.find(" .inde_tab_seedname").children().first();
        item.name = mainTd.attr("title");
        item.url = mainTd.attr("href");
        item.magnetLink = entry.children().last().children().first().attr("href");
        item.publishTime = convertToStandardTime(entry);

        return item;
    }

    return undefined;
};

module.exports = {
    "http://share.popgo.org": function (responseText, database) {
        var $ = cheerio.load(responseText);
        var entry = $('#index_maintable').children().children().first();

        var item, insertSuccess;
        var hasItemGen = false;
        var isEntirePageInsertFailed = true;
        while (entry.text()) {
            item = parseEntry(entry);
            if (item) {
                hasItemGen = true;
                insertSuccess = database.insert(item);
                if (insertSuccess) {
                    isEntirePageInsertFailed = false;
                    item.isNew = true;
                }
            }
            entry = entry.next();
        }

        var isVisitedPage = hasItemGen && isEntirePageInsertFailed;
        if (isVisitedPage) {
            return true;
        } else {
            return false;
        }

    }
}