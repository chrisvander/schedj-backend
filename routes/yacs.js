module.exports = (app, api) => {


	app.get("/api/departments", (req,res) => 
		api.departments((err, body) => {
			if (!err) res.send(body);
			else res.send(err);
		}));

	
}