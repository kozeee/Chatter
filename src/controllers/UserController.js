const mongoose = require('mongoose')
const axios = require('axios').default;
const bcrypt = require('bcrypt')
require("dotenv").config()
mongoose.connect('mongodb://localhost/Chatter')
const user = require('../models/Users')

const spaceDomain = process.env.SPACE_URL;
const username = process.env.PROJECT_ID;
const password = process.env.API_KEY

// Temp test view
const view = (req, res) => {
    res.sendFile('views/chRouteTest.html', { root: 'src' })
}


// Request user token, Create user in DB using bcrypt encryption for password.

const signUp = async (req, res) => {
    try {
        token = await createToken(req.body.Username)

        bcrypt.hash(req.body.Password, 10, function async(err, hash) {
            user.create({ Username: req.body.Username, Password: hash, Email: req.body.Email, Token: token })
        });

        res.send("Success")
    }
    catch (e) {
        console.log(e)
        res.redirect(404, '/')
    }
}

// Find user by Username in DB, Compare pass hashes (bcrypt), currently just returns true or false.
const signIn = async (req, res) => {
    const Login = await user.findOne({
        'Username': req.body.Username
    })
    if (Login == null) return res.status(400).send("Username Not Found")
    try {
        bcrypt.compare(req.body.Password, Login.Password, function (err, result) {
            res.send(result)
        });
    }
    catch (e) {
        console.log(e)
    }
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
    lookup
};