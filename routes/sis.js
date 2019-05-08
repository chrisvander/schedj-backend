module.exports = function(app, auth) {
	var api = require('../api.js')(null).sis;

	function isAuthenticated(req, res, next) {
		var cookie = req.cookies.SESSID;
		req.api = require('../api.js')(cookie).sis;

	  if (req.cookies.SESSID)
	      return next();
	  res.status(403).send('No SESSID token sent.');
	}

	// The login route has a lot going on; this takes a few key bits of information from SIS at once

	app.post("/login", (req,res) => {
		api.login(req.query.user, req.query.pass, (err, cookie, name) => {
			if (!err) {
				if (cookie[0].startsWith("SESSID=;")) res.status(403).send("No SESSID returned");
				else api.get_next_term((err, term) => {
					var reply = new Object();
					reply.sessid = cookie[0].replace("SESSID=", "");
					reply.name = name;
					reply.term = term;
					res.cookie('SESSID', reply.sessid).send(JSON.stringify(reply));
				});
			}
			else {
				res.statusMessage = err;
				res.status(500).send(err);
			}
		})
	});

	app.use(isAuthenticated);

	// IMPORTANT: ALL ROUTES BELOW THIS ARE PROTECTED

	app.get("/fetch", (req,res) => {
		req.api.fetch(req.query.url, (err,body) => {
			if (err) res.status(500).send(err);
			else res.send(body);
		})
	});

	app.get("/schedule", isAuthenticated, (req,res) => {
		req.api.get_schedule((err, body) => {
			if (!err)
				res.send(body);
			else {
				res.statusMessage = err;
				res.status(500).send(err);
			}
		})
	});

	app.get("/class_info", (req,res) => {
		req.api.get_current_term((err, term) => {
			req.api.get_class_info(req.query.crn, term, (err, body) => {
				if (!err)
					res.send(body);
				else {
					res.statusMessage = err;
					res.status(500).send(err);
				}
			});
		});
	});

	// Logout route
	app.get("/logout", (req,res) =>{
		req.api.logout( (err) => {
			if (!err)
				res.send("SUCCESS");
			else {
				res.statusMessage = err;
				res.status(500).send(err);
			}
		})
	});

	//Student Menu Route - just for testing
	app.get("/get_student_menu", (req, res) => {
		req.api.get_student_menu((err, html) => {
			if (!err)
				res.send(html);
			else {
				res.statusMessage = err;
				res.status(500).send(err);
			}})
	})

	app.get("/address", (req, res) => {
		req.api.get_address((err, data) => {
			if (!err)
				res.send(data)
			else {
				res.statusMessage = err;
				res.status(500).send(err);
			}})
	});

	app.get("/feed/registration", (req, res) => {
		var term = req.query.term;
		if (!term) res.status(400).send("Requires term param");
		else req.api.get_registration_status(term, (err, data) => {
			if (err)
				res.status(500).send(err);
			else
				res.send(data);
		});
	});

	app.get("/student_info", (req, res) => {

	});

	app.get("/grades", (req, res) => {
		req.api.get_grades((err, data) => {
			if (err) res.status(500).send(err);
			else res.send(data);
		});
	});

	app.get("/exists_hold", (req, res) => {
		req.api.get_holds_bool((err, hold_exists) => {
			if (err) res.status(500).send(err);
			else res.send(hold_exists);
		});
	})
}
