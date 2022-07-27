const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/Users')
const bcrypt = require('bcrypt')

const customFields = {
    usernameField: 'Username',
    passwordField: 'Password'
}

const verifyCallback = async (username, password, done) => {
    const Login = await User.findOne({
        'Username': username
    })
    if (Login === null) return done(null, false)
    try {
        let Validation = await bcrypt.compare(password, Login.Password, function (err, result) {
            if (result == true) { console.log("success"); return done(null, Login) }
            else { console.log("failed"); return done(null, false) }
        });
    }
    catch (e) {
        done(e)
    }

}
const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});