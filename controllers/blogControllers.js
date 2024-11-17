const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const PublicBlog = require("../models/publicPost");
const PrivateBlog = require("../models/privatePost");
const User = require("../models/user");

const compose = (req, res, next) => {
  res.render("compose", { isLoggedIn: req.isAuthenticated() });
};

const newPost = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new Error(
          "Invalid inputs received. Please provide valid inputs and try again!"
        )
      );
    }

    const { blogTitle, blogContent, blogDesc, typeOfPost } =
      req.body;

    const now = new Date();
    const options = {
      day: "numeric",
      year: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const blogDate = now.toLocaleTimeString("en-US", options);

    const blogAuthorId = req.user.id;

    let user;
    try {
      user = await User.findById(blogAuthorId);
    } catch (err) {
      return next(
        new Error("Cannot save blog at the moment. Please try again later!")
      );
    }

    if (!user) {
      return next(new Error("Cannot find user for the provided userId."));
    }

    let post;
    if (typeOfPost == "Public") {
      post = new PublicBlog({
        blogTitle: blogTitle,
        blogContent: blogContent,
        blogDescription: blogDesc,
        blogDate: blogDate,
        blogAuthor: blogAuthorId,
        blogAuthorName: user.authorName,
        blogImage: req.file.filename,
      });
    } else if (typeOfPost == "Private") {
      post = new PrivateBlog({
        blogTitle: blogTitle,
        blogContent: blogContent,
        blogDescription: blogDesc,
        blogDate: blogDate,
        blogAuthor: blogAuthorId,
        blogImage: req.file.filename,
      });
    }

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await post.save({ session: sess });
      if (typeOfPost === "Private") {
        user.privatePosts.push(post);
      } else if (typeOfPost === "Public") {
        user.publicPosts.push(post);
      }
      await user.save({ session: sess });
      await sess.commitTransaction();
    } catch (error) {
      return next(
        new Error("Cannot save post at the moment. Please try again later!")
      );
    }

    if (typeOfPost === "Private") {
      res.redirect("/posts/privatePosts/" + post.id);
    } else if (typeOfPost === "Public") {
      res.redirect("/posts/publicPosts/" + post.id);
    }
  } else {
    res.redirect("/users/login");
  }
};

const findPublicPostById = async (req, res, next) => {
  const postId = req.params.postId;

  let post;
  try {
    post = await PublicBlog.findById(postId);
  } catch (error) {
    return next(new Error("Something went wrong. Could not find this post!"));
  }

  if (!post) {
    return next(new Error("Could not find post for the provided postId!"));
  }

  let isAuthorOfPost = false;
  if (req.isAuthenticated()) {
    let userId = req.user.id;
    isAuthorOfPost = userId === post.blogAuthor.toString() ? true : false;
  }

  res.render("post", {
    isLoggedIn: req.isAuthenticated(),
    post: post,
    isAuthor: isAuthorOfPost,
  });
};

const getPrivatePosts = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const userId = req.user.id;

    let privatePosts = [];
    try {
      privatePosts = await PrivateBlog.find({ blogAuthor: userId });
    } catch (error) {
      return next(
        new Error("Something went wrong. Could not find your private posts.")
      );
    }

    res.render("privatePosts", {
      posts: privatePosts,
      isLoggedIn: req.isAuthenticated(),
    });
  } else {
    res.redirect("/users/login");
  }
};

const findPrivatePostById = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const postId = req.params.postId;

    let post;
    try {
      post = await PrivateBlog.findById(postId);
    } catch (error) {
      return next(new Error("Something went wrong. Cound not find this post!"));
    }

    if (!post) {
      return next(new Error("Cound not find a post for the provided postId!"));
    }

    let userId = req.user.id;

    if (post.blogAuthor.toString() === userId) {
      res.render("post", {
        isLoggedIn: req.isAuthenticated(),
        post: post,
        isAuthor: true,
      });
    } else {
      return next(new Error("You are not authorized to view this post."));
    }
  } else {
    res.redirect("/users/login");
  }
};

const deletePost = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const postId = req.params.postId;
    const blogType = req.params.blogType;

    let post;
    try {
      if (blogType === "PublicBlog") {
        post = await PublicBlog.findById(postId).populate("blogAuthor");
      }
      if (blogType === "PrivateBlog") {
        post = await PrivateBlog.findById(postId).populate("blogAuthor");
      }
    } catch (error) {
      return next(
        new Error(
          "Could not delete post at the moment. Please try again later!"
        )
      );
    }

    if (!post) {
      return next(new Error("Could not find a post for the provided postId!"));
    }

    if (post.blogAuthor.id.toString() !== req.user.id) {
      return next(new Error("You are not authorized to make this request!"));
    }

    const imageName = post.blogImage;

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await post.remove({ session: sess });
      if (blogType === "PublicBlog") {
        post.blogAuthor.publicPosts.pull(post);
      } else if (blogType === "PrivateBlog") {
        post.blogAuthor.privatePosts.pull(post);
      }
      await post.blogAuthor.save({ session: sess });
      await sess.commitTransaction();
    } catch (error) {
      return next(
        new Error(
          "Could not delete post at the moment. Please try again later!"
        )
      );
    }

    fs.unlink("public/images/" + imageName, (err) => {
      console.log(err);
    });

    if (blogType === "PublicBlog") {
      res.redirect("/");
    } else if (blogType === "PrivateBlog") {
      res.redirect("/posts/privatePosts");
    }
  } else {
    return next(new Error("You are not authorized to make this request!"));
  }
};

const editForm = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const postId = req.params.postId;
    const blogType = req.params.blogType;

    let post;
    try {
      if (blogType === "PublicBlog") {
        post = await PublicBlog.findById(postId);
      }
      if (blogType === "PrivateBlog") {
        post = await PrivateBlog.findById(postId);
      }
    } catch (error) {
      return next(
        new Error("Could not edit post at the moment. Please try again later!")
      );
    }

    if (!post) {
      return next(
        new Error("Could not edit post at the moment. Please try again later!")
      );
    }

    if (post.blogAuthor.toString() !== req.user.id) {
      return next(new Error("Your are not authorized to make this request"));
    }

    res.render("edit", { post: post, isLoggedIn: req.isAuthenticated() });
  } else {
    return next(new Error("You are not authorized to make this request!"));
  }
};

const updateBlog = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new Error(
          "Invalid inputs received. Please enter valid inputs and try again!"
        )
      );
    }

    const { blogTitle, blogDesc, blogContent } = req.body;
    const postId = req.params.postId;
    const blogType = req.params.blogType;

    let post;
    try {
      if (blogType === "PublicBlog") {
        post = await PublicBlog.findById(postId);
      }
      if (blogType === "PrivateBlog") {
        post = await PrivateBlog.findById(postId);
      }
    } catch (error) {
      return next(
        new Error("Cannot update post at the moment. Please try again later!")
      );
    }

    if (!post) {
      return next(new Error("Could not find post for the provided postId!"));
    }

    if (post.blogAuthor.toString() !== req.user.id) {
      return next(new Error("Your are not authorized to make this request"));
    }

    post.blogTitle = blogTitle;
    post.blogContent = blogContent;
    post.blogDescription = blogDesc;

    try {
      await post.save();
    } catch (error) {
      return next(
        new Error("Could not save post at the moment. Please try again later!")
      );
    }

    let redirectUrl =
      blogType === "PublicBlog" ? "publicPosts" : "privatePosts";

    res.redirect("/posts/" + redirectUrl + "/" + post.id);
  } else {
    return next(new Error("You are not authorized to make this request!"));
  }
};

exports.compose = compose;
exports.newPost = newPost;
exports.findPublicPostById = findPublicPostById;
exports.getPrivatePosts = getPrivatePosts;
exports.findPrivatePostById = findPrivatePostById;
exports.deletePost = deletePost;
exports.editForm = editForm;
exports.updateBlog = updateBlog;
