var domain = "http://share.popgo.org";

var stars = [
    "&#9733;&#9733;&#9733;&#9733;",
    "&#9733;&#9733;&#9733;",
    "&#9733;&#9733;",
    "&#9733;"
];

var assembleString = function (items) {
    return items.reduce(function (pre, cur) {
        return pre + "<tr><td><a href='" + domain + cur.url + "'>" + cur.name +
            "</a></td><td>" + stars[cur.generalRanking] +
            "</td><td><a href='" + cur.magnetLink + "'>" + "link" +
            "</a></td></tr>";
    }, "");
};

module.exports = assembleString;