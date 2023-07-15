const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const keys = require("./keys");
const User = require("../models/user");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: keys.google.clientID,
//       clientSecret: keys.google.clientSecret,
//       callbackURL: "/auth/google/redirect",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Check if user already exists in our database
//       User.findOne({ googleId: profile.id }).then((currentUser) => {
//         if (currentUser) {
//           // User already exists
//           done(null, currentUser);
//         } else {
//           // Create new user
//           new User({
//             googleId: profile.id,
//             name: profile.displayName,
//             email: profile.emails[0].value,
//           })
//             .save()
//             .then((newUser) => {
//               done(null, newUser);
//             });
//         }
//       });
//     }
//   )
// );

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: keys.facebook.clientID,
//       clientSecret: keys.facebook.clientSecret,
//       callbackURL: "/auth/facebook/redirect",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Check if user already exists in our database
//       User.findOne({ facebookId: profile.id }).then((currentUser) => {
//         if (currentUser) {
//           // User already exists
//           done(null, currentUser);
//         } else {
//           // Create new user
//           new User({
//             facebookId: profile.id,
//             name: profile.displayName,
//             email: profile.emails[0].value,
//           })
//             .save()
//             .then((newUser) => {
//               done(null, newUser);
//             });
//         }
//       });
//     }
//   )
// );
