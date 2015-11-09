var domain = "http://share.popgo.org";

var assembleString = function(items) {
    return items.reduce(function(pre, cur) {
        return pre + "<tr><td><a href='" + domain + cur.url + "'>" + cur.name + "</a></td><td>B</td><td>C</td></tr>";
    }, "");
};

module.exports = assembleString;