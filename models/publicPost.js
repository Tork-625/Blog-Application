const mongoose = require("mongoose");
const { marked } = require("marked");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM("").window);

const PublicBlogSchema = new mongoose.Schema({
  blogTitle: {
    type: String,
    required: true,
  },
  blogContent: {
    type: String,
    required: true,
  },
  blogDescription: {
    type: String,
    required: true,
  },
  blogAuthorName: {
    type: String,
    required: true,
  },
  blogAuthor: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  blogDate: {
    type: String,
    required: true,
  },
  blogAuthorName: {
    type: String,
    required: true,
  },
  blogImage: {
    type: String,
    required: true,
  },
  sanitizedContent: {
    type: String,
    require: true,
  },
  blogType: {
    type: String,
    required: true,
  },
});

PublicBlogSchema.pre("validate", function (next) {
  if (this.blogContent) {
    this.sanitizedContent = dompurify.sanitize(marked.parse(this.blogContent));
    this.blogType = "PublicBlog";
  }

  next();
});

module.exports = mongoose.model("PublicBlog", PublicBlogSchema);
