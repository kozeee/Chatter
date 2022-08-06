const mongoose = require('mongoose')
const axios = require('axios').default;
const bcrypt = require('bcrypt')
require("dotenv").config()
mongoose.connect('mongodb://localhost/Chatter')
const user = require('../models/Users')
const ch = require('../models/Channels')

const spaceDomain = process.env.SPACE_URL;
const username = process.env.PROJECT_ID;
const password = process.env.API_KEY

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
        let channel = await ch.findOne({ ChannelID: 'Welcome' })

        bcrypt.hash(req.body.Password, 10, function async(err, hash) {
            user.create({ Username: req.body.Username, Password: hash, Email: req.body.Email, Token: token })

        });

        channel.Users.push(req.body.Username)
        channel.save()

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
        const lookUp = user.findOne({ "Username": username })
        if (lookUp === null) res.send(null)
        res.send(lookup.Username, lookup.channels)
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
    const options = {
        method: 'POST',
        url: 'https://' + spaceDomain + '/api/chat/tokens',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + new Buffer.from(username + ':' + password).toString('base64') },
        data: {
            channels: { 'Welcome': { read: true, write: true } },
            ttl: 43200,
            member_id: Username
        },
        json: true
    };
    const response = await axios(options)
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