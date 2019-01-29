const request = require("request");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const api = require('./api.js');

var app = express();

app.use(cookieParser());

// YACS

require('./yacs.js')(app);

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

// The login route has a lot going on; this takes a few key bits of information from SIS at once

app.post("/login", (req,res) =>
	api.login(req.query.user, req.query.pass, (err, cookie, name) => {
		if (!err) {
			if (cookie[0].startsWith("SESSID=;")) res.send("No SESSID returned");
			else api.get_current_term((err, term) => {
				var reply = new Object();
				reply.term = term;
				reply.sessid = cookie[0].replace("SESSID=", "");
				reply.name = name;
				res.send(JSON.stringify(reply));
			});
		}
		else res.send(err);
	})
);



// SERVER

app.listen(8080, () => {
	console.log("Listening on port 8080");
});