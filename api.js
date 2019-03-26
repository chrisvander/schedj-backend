var request = require("request");
// use a single request object in order to hold cookies in session
request = request.defaults({
	jar: true,
	agentOptions: {
    rejectUnauthorized: false
  }
});

const sources = require('./sources.json');
const $ = require('cheerio');

var moment = require('moment');

module.exports = {

	sis: {
		fetch: (url, next) => {
			request.get("http://sis.rpi.edu/" + url, (err,res,body) => {
				if (err) next(err);
				else next(null, body);
			});
		},
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
						try {
							next(null, res.headers['set-cookie'], msg.slice(
		          	msg.indexOf('Welcome,+')+9,
		          	msg.indexOf('+to+the+Rensselaer')-1
		          ));
						}
	          catch (err) {
	          	next("Problem communicating with SIS");
	          }
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
					var start = moment($('td', arr[1]).text() + " " + $('td', arr[2]).text(), "MMM D, YYYY hh:mm a");
					var end = moment($('td', arr[3]).text() + " " + $('td', arr[4]).text(), "MMM D, YYYY hh:mm a");
					obj["start_date"] = start.format("MMMM Do");
					obj["start_time"] = start.format("h:mm A");
					obj["end_date"] = end.format("MMMM Do");
					obj["end_time"] = end.format("h:mm A");
					obj["start_passed"] = start.isBefore();
					obj["end_passed"] = end.isBefore();
					next(null, obj);
				}
			});
		},
		get_student_info: (next) => {
			request.post()
		},
		get_grades: (term_in, next) => {
			request.post(sources.sis.grades + '?term_in=' + term_in, (err, res, html) => {
					if (err) next(err);
					var obj = {};
					var arr = $('div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2)', html).html().split('\n');
					var start = moment($('td', arr[1]).text() + " " + $('td', arr[2]).text(), "MMM D, YYYY hh:mm a");
					var end = moment($('td', arr[3]).text() + " " + $('td', arr[4]).text(), "MMM D, YYYY hh:mm a");
					obj["start_date"] = start.format("MMMM Do");
					obj["start_time"] = start.format("h:mm A");
					obj["end_date"] = end.format("MMMM Do");
					obj["end_time"] = end.format("h:mm A");
					obj["start_passed"] = start.isBefore();
					obj["end_passed"] = end.isBefore();
					next(null, obj);
			});
		},
		get_holds_bool: (next) => {
			request.get(sources.sis.holds, (err, res, html) => {
				if (err) next(err);
				else {
					if ($('body > div.pagebodydiv > table.datadisplaytable > tbody > tr:nth-child(2) > td:nth-child(1)').html()!='')
						next(null, true);
					else next(null, false);
				}
			})
		}
	},



	yacs: {
		departments: (next) => {
			request.get(sources.yacs.departments, (err, res, body) => {
				if (!err) next(null, body);
				else next(err);
			});
		},
		courses: (dep_id, next) => {
			request.get(sources.yacs.courses + dep_id + "&show_periods=true&show_sections=true&", (err, res, body) => {
				if (!err) next(null, body);
				else next(err);
			});
		}
	}

}
