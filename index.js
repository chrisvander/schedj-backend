const request = require("request");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const api = require('./api.js');

var app = express();

app.use(cookieParser());

// YACS
require('./routes/yacs.js')(app, api.yacs);

// SIS
require('./routes/sis.js')(app, api.sis);

// handshake
app.get("/verify_status", (req, res) => {
	console.log("Client handshake");
	res.send({ status: 'active' });
});

// SERVER

app.listen(8080, () => {
	console.log("Listening on port 8080");
});