const express = require("express");
const path = require('path');
const cron = require('node-cron');
const runUpdate = require('./update_data.js');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

var app = express();
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

const port = 4000;

app.listen(port, () => {
	console.log("Listening on port " + port);
});

// handshake
app.get("/verify_status", (req, res) => {
	console.log("Client handshake");
	res.send({ status: 'active' });
});

// YACS
require('./routes/yacs.js')(app);

// SIS
require('./routes/sis.js')(app);

// Mock services
require('./routes/mock.js')(app);

// SERVER

// cron.schedule('0 0 * * *', () => {
//   console.log("Updating YACS data");
//   runUpdate();
// });

// runUpdate();