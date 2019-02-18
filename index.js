const express = require("express");
const path = require('path');
const api = require('./api.js');
const cron = require('node-cron');
const runUpdate = require('./update_data.js');

var app = express();

// YACS
require('./routes/yacs.js')(app, api.yacs, runUpdate);

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

cron.schedule('0 0 * * *', () => {
  console.log("Updating YACS data");
  runUpdate();
});