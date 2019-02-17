var request = require("request");
// use a single request object in order to hold cookies in session
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
		},
		get_student_menu: (next) => {
			request({
				uri: sources.sis.get_student_menu,
				method: "GET",
			}, (err, res, body) => {
				if (!err && res.statusCode == 200) {
					next(null, body);
				} else {
					next(err);
				}
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
		get_address: (next) => {
			request.get(sources.sis.address, (err, res, html) => {
				if (!err) {
					var data = {
						address: '',
						city: '',
						zip: '',
						zip_short: ''
					}
					var raw = $('table.datadisplaytable > tbody > tr:nth-child(3) > td:nth-child(2)', html)
						.html()
						.replace(/\n/g,'')
						.split('<br>');
					var cityzip = raw[1].split('&#xA0; &#xA0; ');
					data.address = raw[0];
					data.city = cityzip[0].split(', ')[0];
					data.state = cityzip[0].split(', ')[1];
					data.zip = cityzip[1];
					data.zip_short = cityzip[1].split('-')[0];
					next(null, data);
				}
				else next(err)
			})
		},
		get_registration_status: (term, next) => {
			request.post(sources.sis.registration + '?term_in=' + term, (err, res, html) => {
				if (err) next(err);
				else {
					var obj = {};
					var arr = $('div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2)', html).html().split('\n');
					obj["start_date"] = $('td', arr[1]).text();
					obj["start_time"] = $('td', arr[2]).text();
					obj["end_date"] = $('td', arr[3]).text();
					obj["end_time"] = $('td', arr[4]).text();
					next(null, obj);
				}
			});
		}
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