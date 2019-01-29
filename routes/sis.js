// SIS middleware to verify SESSID exists on authorized paths
function auth(req,res,next) {
	if (req.cookies.sessid !== "" && req.cookies.sessid) {
		next();
	}
	else res.status(403).send("Requires SESSID");
}

module.exports = function(app, api, auth) {

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
}