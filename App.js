require("dotenv").config();

const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");

const pagesRoutes = require("./routes/pagesRoute");
const blogsRoute = require("./routes/blogsRoute");
const usersRoute = require("./routes/usersRoute");
const googleAuthRoutes = require("./routes/googleAuthRoute");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", pagesRoutes);
app.use("/posts", blogsRoute);
app.use("/users", usersRoute);
app.use("/auth/google", googleAuthRoutes);

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500);
  res.render("error", {
    message: error.message || "An unexpected error has occoured!",
    isLoggedIn: req.isAuthenticated(),
  });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xxjllg5.mongodb.net/dailyJournalDB?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 3000, function () {
      console.log("Server is running on port 3000.");
    });
  })
  .catch((error) => {
    console.log(error);
  });
