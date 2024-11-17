const { validationResult } = require("express-validator");
const passport = require("passport");

const User = require("../models/user");

const loginGet = (req, res, next) => {
  res.render("signup-login", {
    textToDisplay: "Login",
    postTo: "/users/login",
    isLoggedIn: req.isAuthenticated(),
  });
};

const signupGet = (req, res, next) => {
  res.render("signup-login", {
    textToDisplay: "Signup",
    postTo: "/users/signup",
    isLoggedIn: req.isAuthenticated(),
  });
};

const loginPost = (req, res, next) => {
  const { username, password } = req.body;

  const user = new User({
    username: username,
    password: password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      req.login(user, function (err) {
        if (err) {
          console.log(err);
          res.redirect("/login");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/");
          });
        }
      });
    }
  });
};

const signupPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new Error(
        "Invalid inputs received. Please check your credentials and try again!"
      )
    );
  }

  const { username, authorName, password } = req.body;

  User.register(
    { username: username, authorName: authorName },
    password,
    (err, user) => {
      if (err) {
        return next(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/");
        });
      }
    }
  );
};

const logout = (req, res, next) => {
  req.logout(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
};

exports.loginGet = loginGet;
exports.signupGet = signupGet;
exports.loginPost = loginPost;
exports.signupPost = signupPost;
exports.logout = logout;
