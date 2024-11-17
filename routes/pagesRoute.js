const express = require("express");

const pageControllers = require("../controllers/pageControllers");

const router = express.Router();

router.get("/", pageControllers.homePage);

router.get("/about", pageControllers.aboutPage);

module.exports = router;