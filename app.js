require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const publicRoutes = require("./src/routes/v1");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./src/public")));

// Use express-session middleware
app.use(
  session({
    secret: "your_secret_key", // replace 'your_secret_key' with a real secret key
    resave: false, // do not automatically write to the session store
    saveUninitialized: false, // do not save uninitialized sessions
    cookie: {
      maxAge: 60 * 60 * 1000, // configure when sessions expires
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Public & protected routes
app.use("/api/v1", publicRoutes);

app.use(require("./src/middlewares/errorHandler"));

module.exports = app;
