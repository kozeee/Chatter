const { Router } = require('express')
const express = require('express')
const router = express.Router()
const controller = require("../controllers/ChannelsController");
const isAuth = require('./auth').isAuth;

router.post('/list', controller.listUsers)
router.post('/add', controller.addUser)
router.post('/pop', controller.popUser)
router.post('/new', controller.newChannel)
router.post('/update_token', controller.updateToken)
router.post('/videoToken', controller.videoToken)
router.get('/:id', isAuth, controller.viewChannel)
router.get('/', (req, res) => { res.redirect('/users/home') })

module.exports = router