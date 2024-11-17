const multer = require("multer");
const { v4: uuidV4 } = require("uuid");

const MIME_TYPE = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const imageUpload = multer({
  limits: 1000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE[file.mimetype];
      cb(null, uuidV4() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE[file.mimetype];
    let error = isValid ? null : new Error("Invalid Mime Type!");
    cb(error, isValid);
  },
});

module.exports = imageUpload;
