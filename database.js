var Item = require("./item.js")

function Database() {
	this.content = [];
	this.contentValidation = [];
	this.contentMap = {};
	this.latest = null;
}

Database.prototype.initialize = function (items) {
	for (var index = 0; index < items.length; index++) {
		var item = items[index];
		this.content.push(item);
		this.contentValidation.push(true);
		this.contentMap[item.url] = item;
	}
};

Database.prototype.insert = function (item) {
	if (!item) {
		return false;
	}

	if (this.contentMap[item.url]) {
		return false;
	} else {
		this.content.push(item);
		this.contentValidation.push(true);
		this.contentMap[item.url] = item;
		return true;
	}
};

module.exports = Database;