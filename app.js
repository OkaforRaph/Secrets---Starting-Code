require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { Console } = require("console");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
	useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
	email: "String",
	password: "String",
});

// userSchema.plugin(encrypt, {
// 	secret: process.env.SECRET,
// 	encryptedFields: ["password"],
// });

const User = new mongoose.model("User", userSchema);

// Home route
app.get("/", function (req, res) {
	res.render("home");
});

// Login route
app
	.route("/login")
	.get(function (req, res) {
		res.render("login");
	})
	.post(function (req, res) {
		const username = req.body.username;
		const password = req.body.password;

		// Find the user with that username from the database
		User.findOne({ email: username })
			.then(function (foundUser) {
				bcrypt.compare(password, foundUser.password, function (err, result) {
					// result == true
					if (result === true) {
						res.render("secrets");
					} else {
						res.send("Wrong Password!");
					}
				});
			})
			.catch(function (err) {
				console.log(err);
			});
	});

// Register route
app
	.route("/register")
	.get(function (req, res) {
		res.render("register");
	})
	.post(function (req, res) {
		bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
			const newUser = new User({
				email: req.body.username,
				password: hash,
			});

			// Save the new user, and then render the secrets page if sucessful
			newUser
				.save()
				.then(function (prams) {
					res.render("secrets");
				})
				.catch(function (err) {
					console.log(err);
				});
		});
	});

// Listening on port 3000
app.listen(3000, function () {
	console.log("Server is started on port 3000.");
});
