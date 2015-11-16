var library = require("./library.js");

var formatAliases = library.getFormatAliases();
var workNames = library.getWorkNames();
var subtitleProviders = library.getSubtitleProviders();
var completeAliases = library.getCompleteAliases();

var stringFilter = function (items, words) {
    var validItems = [];
    var leftItems = [];

    for (var i = 0; i < items.length; i++) {
        for (var j = 0; j < words.length; j++) {
            if (items[i].name.toUpperCase().indexOf(words[j].toUpperCase()) !== -1) {
                validItems.push(items[i]);
                break;
            }
        }

        if (validItems[validItems.length - 1] !== items[i]) {
            leftItems.push(items[i]);
        }
    }

    return {
        valid: validItems,
        left: leftItems
    };
};

var rank = function (item, lines) {
    var i = 0;
    item.generalRanking = 3;
    for (i = 0; i < workNames.length; i++) {
        if (item.name.toUpperCase().indexOf(workNames[i].toUpperCase()) !== -1) {
            item.generalRanking--;
            break;
        }
    }

    for (i = 0; i < subtitleProviders.length; i++) {
        if (item.name.toUpperCase().indexOf(subtitleProviders[i].toUpperCase()) !== -1) {
            item.generalRanking--;
            break;
        }
    }

    for (i = 0; i < completeAliases.length; i++) {
        if (item.name.toUpperCase().indexOf(completeAliases[i].toUpperCase()) !== -1) {
            item.isComplete = true;
            item.generalRanking--;
            break;
        }
    }
};

module.exports = function (items) {
    var splitItems = stringFilter(items, formatAliases);
    splitItems.valid.forEach(function (item) {
        rank(item);
    });
};