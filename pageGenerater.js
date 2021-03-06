var domain = "http://share.popgo.org";

var stars = [
    "&#9733;&#9733;&#9733;&#9733;",
    "&#9733;&#9733;&#9733;",
    "&#9733;&#9733;",
    "&#9733;"
];

var convertToTimeString = function(date) {
    return (date.getFullYear() - 2000) + "." + (date.getMonth() + 1) + "." + date.getDate();
};

var assembleString = function (database) {
    return database.content.reduce(function (pre, cur) {
        return pre + "<tr>" +
        "<td>" + convertToTimeString(cur.publishTime) +"</td>" +
        "<td><a href='" + domain + cur.url + "'>" + cur.name +"</a></td>" +
        "<td>" + stars[cur.generalRanking] +"</td>" +
        "<td><a href='" + cur.magnetLink + "'>" + "link" +"</a></td>" +
        "</tr>";
    }, "");
};

module.exports = assembleString;