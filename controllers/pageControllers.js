const PublicBlog = require("../models/publicPost");

const homePage = async (req, res, next) => {
  let publicBlogs;
  try {
    publicBlogs = await PublicBlog.find({});
  } catch (error) {
    return next(
      new Error("Cannot show blogs at the moment! Please try again later")
    );
  }

  publicBlogs.sort((a, b) => {
    return new Date(b.blogDate) - new Date(a.blogDate);
  });

  res.render("home", { isLoggedIn: req.isAuthenticated(), posts: publicBlogs });
};

const aboutPage = (req, res, next) => {
  res.render("about", { isLoggedIn: req.isAuthenticated() });
};

exports.homePage = homePage;
exports.aboutPage = aboutPage;
