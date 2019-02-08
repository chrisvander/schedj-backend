var request = require("request");
request = request.defaults({jar: true});

const sources = require('./sources.json');
const $ = require('cheerio');

module.exports = {

	sis: {
		login: (user, pass, next) => {
			// gets the URL first to initialize the cookie
			request.get(sources.sis.login, () =>{
				// sends post request, replies with it
				request({
				  uri: sources.sis.login,
				  method: "POST",
				  qs: {
				    "sid": user,
				    "PIN": pass
				  }
				}, (err, res, body) => {
					if (!err && res.statusCode == 200) {
						var msg = $('meta',body).attr('content');
	          next(null, res.headers['set-cookie'], msg.slice(
	          	msg.indexOf('Welcome,+')+9,
	          	msg.indexOf('+to+the+Rensselaer')-1
	          ));
	        } else {
	            next(err);
	        }
				});
			});
		},
		logout: (next) => {
			// gets URL first
			request.get(sources.sis.logout, () =>{
				request({
					uri: sources.sis.logout,
					method: "GET"
				}, (err, res, body) => {
					if (!err && res.statusCode == 200) {
						next(null);
					} else {
						next(err);
					}
				});
			});
		},
		get_student_menu: (next) => {
			request.get(sources.sis.get_student_menu, () =>{
				request({
					uri: sources.sis.get_student_menu,
					method: "GET",
				}, (err, res, body) => {
					if (!err && res.statusCode == 200) {
						next(null);
					} else {
						next(err);
					}
				});
			});
		},
		get_current_term: (next) => {
			request.get(sources.sis.classes, (err, res, html) => {
				if (!err) {
					//success!
			    next(null, $('option', '#term_id', html).attr('value'));
			  }
			  else next(err);
			});
		},
	},

	
	
	yacs: {
		departments: (next) => {
			request.get(sources.yacs.departments, (err, res, body) => {
				if (!err) next(null, body);
				else next(err);
			});
		}
	}

}