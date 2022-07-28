const axios = require('axios').default
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/Chatter')
const channel = require('../models/Channels')
const user = require('../models/Users')
require("dotenv").config()

const spaceDomain = process.env.SPACE_URL;
const username = process.env.PROJECT_ID;
const password = process.env.API_KEY

/*
Convention:
Each route has an exported function, and a helper function(prefaced with ch)
exported functions pass db objects to helper functions and redirect or return a status
helper functions actually influence db and return true or false
*/


//Returns a list of users assigned to a channel, exception to convention as it returns an array directly.
const listUsers = async (req, res) => {
    try {
        const { Username, channelID } = req.body;
        const users = await chListUsers(channelID)
        if (users === null) return res.status(400)
        res.sendStatus(200, users)
    }
    catch (e) {
        console.log(e)
    }
}

// refs listUsers
async function chListUsers(channelID) {
    try {
        const userList = await channel.findOne({ "ChannelID": channelID })
        return userList.Users
    }
    catch (e) {
        console.log(e)
        return ("Unexpected Error, please retry.")
    }
}


// Adds user to the User array in Channels, adds channel to channel array in Users
const addUser = async (req, res) => {
    const { Username, channelID } = req.body;

    const ch = await channel.findOne({ 'ChannelID': channelID })
    if (ch === null) res.sendStatus(404)
    const lookUp = await user.findOne({ "Username": Username })
    if (lookUp === null) res.sendStatus(404)

    success = await chAddUser(ch, lookUp)
    if (success) {
        await userUpdateToken(lookUp.Username)
        res.sendStatus(200)
    }
    else res.sendStatus(404)

}

// refs adduser
async function chAddUser(channel, Username) {
    try {
        if (!(channel.Users.includes(Username.Username)) && (!(Username.Channels.includes(channel.ChannelID)))) {
            channel.Users.push(Username.Username)
            Username.Channels.push(channel.ChannelID)
            await channel.save()
            await Username.save()
            return (true)
        }
        return (false)
    }
    catch (e) {
        console.log(e)
    }
}


// Removes a user from the User array in Channels, removes channel from Users channel array
const popUser = (req, res) => {
    const { Username, channelID } = req.body;

    success = chPopUser(channelID, Username)
    if (success) {
        userPopChannel(channelID, Username)
        userUpdateToken(Username)
    }

    res.sendStatus(success)
}

// removes Username from channelID
function chPopUser(channelID, Username) {


}

// Create a new channel and add it to the User's channel Array
const newChannel = async (req, res) => {
    const { ChannelID } = req.body;
    const User = req.user
    const Username = User.Username
    success = await chNewChannel(ChannelID, Username)
    await userUpdateToken(User)
    if (success) {
        res.redirect('/users/home')
    }
    else res.sendStatus(404)
}

// refs newChannel
async function chNewChannel(ChannelID, Username) {
    try {
        await channel.create({ "ChannelID": ChannelID, "Users": [Username] })
        const User = await user.findOne({ "Username": Username })
        User.Channels.push(ChannelID)
        await User.save()
        return (true)
    }
    catch (e) {
        console.log(e)
        return (false)
    }
}

// this route is only meant for testing functionality. we can call userUpdateToken when we act on the user object instead.
const updateToken = async (req, res) => {
    try {
        const { Username } = req.body;
        const User = await user.findOne({ 'Username': Username })
        token = await userUpdateToken(User)
        return true
    }
    catch (e) {
        console.log(e)
        return false
    }
}

// refs updateToken
async function userUpdateToken(Username) {
    try {
        let channelPerms = {}
        for (const channel in Username.Channels) {
            channelPerms[Username.Channels[channel]] = { read: true, write: true }
        }
        console.log(Username.Channels)
        const options = {
            method: 'POST',
            url: 'https://' + spaceDomain + '/api/chat/tokens',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Basic ' + new Buffer.from(username + ':' + password).toString('base64') },
            data: {
                channels: channelPerms,
                ttl: 43200,
                member_id: Username.Username
            },
            json: true
        };

        const response = await axios(options)
        token = response.data.token
        Username.Token = token
        await Username.save()
        return 200
    }
    catch (e) {
        console.log(e)
        return 404
    }
}

const viewChannel = async (req, res) => {
    const ChannelID = req.params.id;
    const UserList = await channel.findOne({ ChannelID: ChannelID })
    const User = req.user
    success = await chViewChannel(ChannelID, User)
    if (success) {
        res.render('chat', { ChannelID: ChannelID, User: User, UserList: UserList })
    }
    else res.sendStatus(404)

}

async function chViewChannel(ChannelID, User) {
    const ch = await channel.findOne({ 'ChannelID': ChannelID })
    if (ch === null) return false
    if (!ch.Users.includes(User.Username)) return false

    return true
}

// export to channels route
module.exports = {
    listUsers,
    addUser,
    popUser,
    newChannel,
    updateToken,
    viewChannel
};