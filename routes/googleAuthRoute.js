const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/secret",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

module.exports = router;
