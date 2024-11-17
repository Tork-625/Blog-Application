const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth20");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  googleId: {
    type: String,
  },
  authorName: {
    type: String,
  },
  publicPosts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "PublicPost",
    },
  ],
  privatePosts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "PrivatePost",
    },
  ],
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

const User = mongoose.model("User", UserSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secret",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { googleId: profile.id, authorName: profile.displayName },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

module.exports = User;
