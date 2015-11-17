var fs = require("fs");
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var Database = require("./database.js");
var generatePage = require("./pageGenerater.js");

var ifRegen = (process.argv[2] === "r");
var database = new Database();
database.initialize().rank();

app.use(express.static("public"));
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/mainPage.html');
});

io.on('connection', function (socket) {
	socket.on('page load', function () {
		console.log("receive page load");

		var insertString = generatePage(database);
		console.log("emit update message");
		io.emit('update message', insertString);
		database.update(function () {
			database.rank();
			insertString = generatePage(database);
			console.log("emit update message again");
			io.emit('update message', insertString);
		});
	});
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});
