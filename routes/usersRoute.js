const express = require("express");
const { check } = require("express-validator");

const userControllers = require("../controllers/userControllers");

const router = express.Router();

router.get("/login", userControllers.loginGet);

router.get("/signup", userControllers.signupGet);

router.post("/login", userControllers.loginPost);

router.post(
  "/signup",
  [
    check("username").normalizeEmail().isEmail(),
    check("authorName").not().isEmpty(),
    check("password").isLength({ min: 8 }),
  ],
  userControllers.signupPost
);

router.get("/logout", userControllers.logout);

module.exports = router;
