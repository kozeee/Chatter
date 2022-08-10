const mongoose = require('mongoose')
const axios = require('axios').default;
const bcrypt = require('bcrypt')
require("dotenv").config()
mongoose.connect('mongodb://localhost/Chatter')
const userDB = require('../models/Users')
const channelDB = require('../models/Channels')

const spaceDomain = process.env.SPACE_URL;
auth = { username: process.env.PROJECT_ID, password: process.env.API_KEY }

// Temp test view
const view = (req, res) => {
    res.render('chRouteTest.ejs', { root: 'views' })
}

const home = (req, res) => {
    res.render('home.ejs', { root: 'views', user: req.user })
}


// Request user token, Create user in DB using bcrypt encryption for password.

const signUp = async (req, res) => {
    try {
        let token = await createToken(req.body.Username)
        let Channel = await channelDB.findOne({ ChannelID: 'Welcome' })

        bcrypt.hash(req.body.Password, 10, function async(err, hash) {
            userDB.create({ Username: req.body.Username, Password: hash, Email: req.body.Email, Token: token })

        });

        Channel.Users.push(req.body.Username)
        Channel.save()

        res.redirect("/")

    }
    catch (e) {
        console.log(e)
        res.redirect(404, '/')
    }
}

// Find user by Username in DB, Compare pass hashes (bcrypt), currently just returns true or false.
const signIn = async (req, res) => {
}

//Returns a username and channel array of any valid user
const lookup = async (req, res) => {
    try {
        username = req.body.Username
        const User = userDB.findOne({ "Username": username })
        if (User === null) res.send(null)
        res.send(User.Username, User.Channels)
    }
    catch (e) {
        console.log(e)
    }
}

const token = async (req, res) => {
    const User = req.user
    res.setHeader('Content-Type', 'application/json')
    let token = User.Token
    res.send(JSON.stringify({ token }))
}

//Creates a fresh user token 
async function createToken(Username) {
    const response = await axios.post('https://' + spaceDomain + '/api/chat/tokens', {
        channels: { 'Welcome': { read: true, write: true } },
        ttl: 43200,
        member_id: Username
    }, { auth })
    return response.data.token
}


//export functions to User route
module.exports = {
    signUp,
    signIn,
    view,
    lookup,
    home,
    token
};