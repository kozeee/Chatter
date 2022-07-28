const { Router } = require('express')
const express = require('express')
const passport = require('passport');
const router = express.Router()
const controller = require("../controllers/UserController");
const isAuth = require('./auth').isAuth;

router.get('/', isAuth, controller.view)
router.get('/token', isAuth, controller.token)
router.get('/home', isAuth, controller.home)
router.post('/sign_up', controller.signUp)
router.post('/sign_in', passport.authenticate('local', { failureRedirect: '/', successRedirect: '/users/home' }))
router.get('/sign_out', (req, res, next) => {
    req.logout(function (e) {
        if (e) return next(e)
        res.redirect('/')
    })
})

module.exports = router