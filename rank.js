var library = require("./library.js");

var tier3String = library.getFormatAliases();
console.log(tier3String);
var tier2String = library.getWorkNames();
console.log(tier2String);
var tier1String = library.getSubtitleProviders();
var SpecialString = library.getCompleteAliases();

var stringFilter = function(items, words) {
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

module.exports = function(items) {
    var lines = [];
    lines.push(tier2String, tier1String, SpecialString);

    var splitItems = stringFilter(items, tier3String);
    splitItems.valid.forEach(function(item) {
        item.generalRanking = 3;
        lines.forEach(function(words, index) {
            for (var j = 0; j < words.length; j++) {
                if (item.name.toUpperCase().indexOf(words[j].toUpperCase()) !== -1) {
                    item.generalRanking--;
                    break;
                }
            }
        });
    });
};