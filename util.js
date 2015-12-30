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

var a = function () { };

module.exports = {
    isWorthCreateNewItem: isWorthCreateNewItem,
    a: a
};