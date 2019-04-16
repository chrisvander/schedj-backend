module.exports = (app, update) => {

	app.get("/api/update", (req,res) => {
		update();
		res.send("Ran update");
	});

}