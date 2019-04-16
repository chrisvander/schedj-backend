const express = require("express");
const path = require('path');
const cron = require('node-cron');
const runUpdate = require('./update_data.js');
const https = require('https');
const fs = require('fs');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());

app.listen(8080, () => {
	console.log("Listening on port 8080");
});

// handshake
app.get("/verify_status", (req, res) => {
	console.log("Client handshake");
	res.send({ status: 'active' });
});

// YACS
require('./routes/yacs.js')(app, runUpdate);

// SIS
require('./routes/sis.js')(app);

// SERVER

cron.schedule('0 0 * * *', () => {
  console.log("Updating YACS data");
  runUpdate();
});