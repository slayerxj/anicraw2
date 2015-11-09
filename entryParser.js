var Item = require('./item.js');
var library = require('./library.js');

var permittedFormats = library.getFormatAliases();
var upperPermittedFormats = permittedFormats.map(function (cur) {
    return cur.toUpperCase();
});

module.exports = function(entry) {
	 var entryText = entry.text();
    if (upperPermittedFormats.some(function (format) {
        return (entryText.toUpperCase().indexOf(format) !== -1);
    })) {
        var item = new Item();
        var mainTd = entry.find(" .inde_tab_seedname").children().first();
        item.name = mainTd.attr("title");
        item.url = mainTd.attr("href");
        item.magnetLink = entry.children().last().children().first().attr("href");

        return item;
    }

    return undefined;
};