function Item() {
	this.name = "";
	this.source = "Blu-ray";
	this.resolution = "1080p";
	this.subtitleProvider = "";
	this.url = "";
	this.isNew = false;
	this.publicTime = {};
	this.isComplete = false;
	this.generalRanking = 4; // represent unranked
	// if not complete, the number of chapters
	this.magnetLink = "";
}

Item.prototype.isUnranked = function() {
	return (this.generalRanking === 4);
};

Item.prototype.isEqual = function(item) {
	if (this.url === item.url) {
		return true;
	} else {
		if ((this.name === item.name) &&
		(this.source === item.source) &&
		(this.resolution === item.resolution) &&
		(this.subtitleProvider === item.subtitleProvider) &&
		(this.isComplete === item.isComplete)) {
			return true;
		}
	}
	
	return false;
};

module.exports = Item;