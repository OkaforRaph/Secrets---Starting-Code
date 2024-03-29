require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { Console } = require("console");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		secret: "Our little secret.",
		resave: false,
		saveUninitialized: false,
		// cookie: { secure: true },
	})
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
	useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
	email: "String",
	password: "String",
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home route
app.get("/", function (req, res) {
	res.render("home");
});

// Register route
app
	.route("/register")
	.get(function (req, res) {
		res.render("register");
	})
	.post(function (req, res) {
		User.register(
			{ username: req.body.username },
			req.body.password,
			function (err, user) {
				if (err) {
					console.log(err);
					res.redirect("/register");
				} else {
					passport.authenticate("local")(req, res, function () {
						res.redirect("/secrets");
					});
				}
			}
		);
	});

// Secrets route
app.get("/secrets", function (req, res) {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.redirect("/login");
	}
});

// Login route
app
	.route("/login")
	.get(function (req, res) {
		res.render("login");
	})
	.post(function (req, res) {
		const user = new User({
			username: req.body.username,
			password: req.body.password,
		});

		req.login(user, function (err) {
			if (err) {
				console.log(err);
			} else {
				passport.authenticate("local")(req, res, function () {
					res.redirect("/secrets");
				});
			}
		});
	});

// Listening on port 3000
app.listen(3000, function () {
	console.log("Server is started on port 3000.");
});
