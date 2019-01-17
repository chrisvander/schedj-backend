const request = require("request");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const api = require('./api.js');

var app = express();

app.use(cookieParser());

// YACS

app.get("/api/departments", (req,res) => 
	api.yacs.departments((err, body) => {
		if (!err) res.send(body);
		else res.send(err);
	}));

function auth(req,res,next) {
	if (req.cookies.sessid !== "" && req.cookies.sessid) {
		next();
	}
	else res.status(403).send("Requires SESSID");
}

// This will take all routes and translate from SIS

app.post("/login", (req,res) =>
	api.login(req.query.user, req.query.pass, (err, cookie) => {
		if (!err) {
			if (cookie[0].startsWith("SESSID=;")) res.send("No SESSID returned");
			else res.send(cookie[0].replace("SESSID=", ""));
		}
		else res.send(err);
	})
);



// SERVER

app.listen(8080, () => {
	console.log("Listening on port 8080");
});