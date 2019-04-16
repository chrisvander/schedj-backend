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
const reg_params = require('./register.js');

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
		register: (term, CRN, next) => {
			// gets the registration
			request.get(sources.sis.register, () =>{
				request({
				  uri: sources.sis.register,
				  method: "POST",
				  qs: reg_params(term, CRN)
				},
				(err, res, body) => {
					if (!err && res.statusCode == 200) {
						next("SUCCESS");
						// ISSUE: does not actually reflect errors like being past your registration time
					}
			        else{
			         	next("Problem communicating with SIS");
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
			request.get(sources.sis.schedule.current_week, (err, res, html) => {
				if (!err) {
					//success!
					var reply = $('input[name="termDir"]', html).attr('value');
			    next(null, reply);
			  }
			  else next(err);
			});
		},
		get_next_term: (next) => {
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
				try {
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
				}
				catch (err) {
					next(err);
				}
			})
		},
		get_registration_status: (term, next) => {
			request.post(sources.sis.registration + '?term_in=' + term, (err, res, html) => {
				if (err) next(err);
				else {
					var obj = {};
					try {
						var arr = $('div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2)', html).html().split('\n');
					}
					catch (err) {
						next(err);
						return;
					}
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
		get_schedule: (next) => {
			request(sources.sis.schedule.current_week, (err, res, html) => {
				if (err) next(err);
				else {
					var schedule_date = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
					// ordered by day of the week
					var obj = {
						'start': '',
						'end': '',
						'today': [],
						'clinfo': [[],[],[],[],[]]
					};
					$('div.pagebodydiv > table.datadisplaytable > tbody tr', html).each((i, row) => {
						$('td', row).each((j, td) => {
							var classinfo = $('a', td).html();
							if (classinfo) {
								var m_f = 'h:mm a';
								var clinfo = classinfo.split('<br>');
								var start_time = moment(clinfo[2].split('-')[0], m_f);
								var end_time = moment(clinfo[2].split('-')[1], m_f);

								if (obj.start==='') obj.start = start_time.format(m_f);
								else if (moment(obj.start, m_f).isAfter(start_time)) obj.start = start_time.format(m_f);

								if (obj.end==='') obj.end = end_time.format(m_f);
								else if (moment(obj.end, m_f).isBefore(end_time)) obj.end = end_time.format(m_f);

								var classinfo = {
									"name": clinfo[0],
									"CRN": clinfo[1].split(' ')[0],
									"start_time": start_time.format(m_f),
									"end_time": end_time.format(m_f),
									"location": clinfo[3]
								}

								obj.clinfo[j].push(classinfo);
								if (moment().day()-1 == j)
									obj.today.push(classinfo);
							}
						});
					});
					next(null, JSON.stringify(obj));
				}
			});
		},
		get_class_info: (crn, term, next) => {
			request(sources.sis.schedule.class_info + crn + "&term_in=" + term, (err, res, html) => {
				if (err) next(err);
				else {
					var obj = {};
					var split_info = $('div.pagebodydiv > table > caption', html).html()
					if (!split_info) next("No split object");
					else {
						split_info=split_info.split(' - ');
						obj["name"] = split_info[0];
						obj["id"] = split_info[1];
						obj["section"] = split_info[2];
						obj["instructor"] = $('body > div.pagebodydiv > table:nth-child(3) > tbody > tr:nth-child(4) > td', html).text()
						obj["instructor_email"] = $('body > div.pagebodydiv > table:nth-child(3) > tbody > tr:nth-child(4) > td > a', html).attr('href')
						next(null, obj);
					}
				}
			});
		},
		get_student_info: (next) => {
			request.post()
		},
		get_grades: (next) => {
			request.get(sources.sis.grades_term, (err, res, html) => {
				var requests = [];
				var grades_obj = {};
				var total = $('#term_id > option', html).length;
				if (total==0) next("No results");
				$('#term_id > option', html).each((index, option)=> {
					var term_in = $(option).attr('value');
					requests.push(request.post(sources.sis.grades + '?term_in=' + term_in, (err, res, html) => {
						if (err) next(err);
						else {
							var obj = [];
							var param;
							$('div.pagebodydiv > table:nth-child(4) > tbody > tr', html).each((j, row)=>{
									// skip 0th row, it only has headings for each thing
									if (j==0) return;
									// creates a variable that holds all the data for a row
									var course_data = {
										'CRN': '',
										'SUBJ': '',
										'COURSE': '',
										'SECTION': '',
										'TITLE': '',
										'CAMPUS': '',
										'GRADE': '',
										'ATTEMPTED': '',
										'EARNED': '',
										'GPA_HRS': '',
										'POINTS': ''
									};

									// goes through each column in the rows
									$( "td", row ).each(function( index ) {
										// scrapes the text from the column
										var txt = $(this).text().trim();
										var i=0;
										// inputs the text into the course_data
										for (var prop in course_data) {
											if (index==i)
												course_data[prop] = txt;
											i+=1;
										}
									});

									// inputs course_data object into obj for returning
									obj.push(course_data);
							});
							grades_obj[term_in] = obj;
							var size = Object.keys(grades_obj).length;
							if (size==total)
								next(null, grades_obj)
						}
					}));
				});
			});
		},
		get_holds_bool: (next) => {
			request.get(sources.sis.holds, (err, res, html) => {
				if (err) next(err);
				else {
					if ($('div.pagebodydiv > table.datadisplaytable > tbody > tr:nth-child(2)', html).html()!=null)
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
