const api = require('./api.js')(null).yacs;
const fs = require('fs');
const path = require('path');

var num_files = 0;
var total = 0;

function writeDepartment (dep) {
	api.courses(dep.id, (err, body) => {
		if (err) console.log(err);
		else
			fs.writeFile("./data/courses/"+dep.id+".json", body, (err) => {
		    if (err) return console.log(err);
		    num_files++;
		    console.log("\x1b[1A\x1b[0K- ["+num_files+"/"+total+"] Saved '"+dep.id+".json'");
			});
	})
}

module.exports = () => {
	num_files = 0;
	api.departments((err, body) => {
		if (err) console.log(err);
		else
			fs.writeFile("./data/departments.json", body, (err2) => {
		    if (err2)
		        return console.log(err2);
		    console.log("- Saved 'departments.json'");
		    var directory = "./data/courses/";
		    fs.readdir(directory, (err, files) => {
				  if (err) throw err;

				  for (const file of files) {
				    fs.unlink(path.join(directory, file), err => {
				      if (err) throw err;
				    });
				  }

				  var obj = JSON.parse(body)
			    total = 0;
			    try {
			    	obj.schools.forEach((school) => total+=school.departments.length);
						obj.schools.forEach(
							(school) => school.departments.forEach((item) => {
								writeDepartment(item)
							})
						);
			    }
			    catch (err) {
			    	console.error("Could not load departments.")
			    	console.error(obj);
			    }
				});
			});
	});
}