var request = require("request");
request = request.defaults({jar: true});

const sources = require('./sources.json');
const scraper = require('./scraper.js')

module.exports = {
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
            next(null, res.headers['set-cookie']);
        } else {
            next(err);
        }
			});
		});
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