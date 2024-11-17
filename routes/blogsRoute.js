const express = require("express");
const { check } = require("express-validator");

const blogControllers = require("../controllers/blogControllers");
const imageUpload = require("../middlewares/image-upload");

const router = express.Router();

router.get("/compose", blogControllers.compose);

router.get("/privatePosts", blogControllers.getPrivatePosts);

router.get("/publicPosts/:postId", blogControllers.findPublicPostById);

router.get("/privatePosts/:postId", blogControllers.findPrivatePostById);

router.get("/edit/:blogType/:postId", blogControllers.editForm);

router.post(
  "/compose",
  imageUpload.single("blogImage"),
  [
    check("blogTitle").trim().not().isEmpty(),
    check("blogContent").trim().isLength({ min: 10 }),
    check("blogDesc").trim().isLength({ min: 10 }),
    check("typeOfPost").isIn(["Private", "Public"]),
  ],
  blogControllers.newPost
);

router.patch(
  "/edit/:blogType/:postId",
  [
    check("blogTitle").trim().not().isEmpty(),
    check("blogContent").trim().isLength({ min: 10 }),
    check("blogDesc").trim().isLength({ min: 10 }),
  ],
  blogControllers.updateBlog
);

router.delete("/:blogType/:postId", blogControllers.deletePost);

module.exports = router;
