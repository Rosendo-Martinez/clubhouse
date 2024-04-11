const User = require("./models/user");
const bcrypt = require('bcryptjs');

var passport = require('passport');
var LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
    },
    async function verify(email, password, cb) {
    try {
        const user = await User.findOne({ email: email }).exec();
        if (user===null) {
            return cb(null, false, { message: 'Email is incorrect.'}) // no user found w/ given email
        } else {
            const passwordMatched = await bcrypt.compare(password, user.hashedPassword);
            if (passwordMatched) {
                return cb(null, user)
            } else {
                return cb(null, false, { message: 'Password and/or email is incorrect.'})
            }
        }
    } catch (err) {
        cb(err)
    }
}));

passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});
  
passport.deserializeUser(async function(id, cb) {
    try {
        const user = await User.findById(id).exec();
        cb(null, user);
    } catch (err) {
        cb(err)
    }
});

module.exports = passport;