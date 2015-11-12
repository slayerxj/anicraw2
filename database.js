var fs = require("fs");
var Item = require("./item.js");
var lastResult = require("./result.js");
var rank = require("./rank.js");
var urlFetcher = require("./urlFetcher.js");

function Database() {
	this.content = [];
	this.contentValidation = [];
	this.contentMap = {};
	this.latest = null;
}

Database.prototype.initialize = function () {
	var record = require("./result.js");
	for (var index = 0; index < record.length; index++) {
		var item = record[index];
		this.content.push(item);
		this.contentValidation.push(true);
		this.contentMap[item.url] = item;
	}

	return this;
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

Database.prototype.rank = function () {
	console.log("Database.prototype.rank");
	var unrankedItems = this.content.filter(function (item) {
		return item.isUnranked();
	});

	rank(unrankedItems);
	this.content.sort(function (a, b) {
		return (a.generalRanking - b.generalRanking);
	});

	return this;
};

Database.prototype.update = function (whenFinish) {
	urlFetcher.getOneByOne(this, whenFinish);
};

Database.prototype.regenerate = function (whenFinish) {
	urlFetcher.getAll(this, whenFinish);
};

Database.prototype.needUpdateRecord = function () {
	console.log("Database.prototype.needUpdateRecord");
	return true;
};

Database.prototype.updateRecord = function () {
	console.log("Database.prototype.updateRecord");
	if (this.needUpdateRecord()) {
		fs.writeFile("result.js", "module.exports = " + JSON.stringify(this.content), function (err) {
			if (err) {
				throw err;
			}
		});
	}

	return this;
};

module.exports = Database;