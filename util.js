var library = require('./library.js');

var permittedFormats = library.getFormatAliases();
var upperPermittedFormats = permittedFormats.map(function (cur) {
    return cur.toUpperCase();
});

var isWorthCreateNewItem = function (text) {
    return (upperPermittedFormats.some(function (format) {
        return (text.toUpperCase().indexOf(format) !== -1);
    }));
};

var sliceString = function (wholeString, before, after) {
    var indexBefore = wholeString.indexOf(before) + before.length;
    var indexAfter = wholeString.indexOf(after, indexBefore);
    var wantedString = wholeString.slice(indexBefore, indexAfter);

    return wantedString;
}

module.exports = {
    isWorthCreateNewItem: isWorthCreateNewItem,
    sliceString: sliceString
};