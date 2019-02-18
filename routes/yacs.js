module.exports = (app, api, update) => {

	app.get("/api/update", (req,res) => {
		update();
		res.send("Ran update");
	});

}