const axios = require('axios').default
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/Chatter')
const channelDB = require('../models/Channels')
const userDB = require('../models/Users')
require("dotenv").config()

const spaceDomain = process.env.SPACE_URL;
auth = { username: process.env.PROJECT_ID, password: process.env.API_KEY }
/* 

Users/Channels = array
Username/channelID = string
User/Channel = db object
userDB/channelDB = database

*/

//Returns a list of users assigned to a channel
const listUsers = async (req, res) => {
    try {
        const { username, channelID } = req.body;
        const Users = await chListUsers(channelID)
        if (Users === null) return res.status(400)
        res.sendStatus(200, Users)
    }
    catch (e) {
        console.log(e)
    }
}

// Refs listUsers, takes string
async function chListUsers(channelID) {
    try {
        const Users = await channelDB.findOne({ "ChannelID": channelID })
        return Users.Users
    }
    catch (e) {
        console.log(e)
        return ("Unexpected Error, please retry.")
    }
}


// Adds user to the User array in Channels, adds channel to channel array in Users
const addUser = async (req, res) => {
    const { Username, channelID } = req.body;
    console.log(req.body)

    const Channel = await channelDB.findOne({ 'ChannelID': channelID })
    if (Channel === null) return res.sendStatus(404)
    const User = await userDB.findOne({ "Username": Username })
    if (User === null) return res.sendStatus(404)

    success = await chAddUser(Channel, User)
    if (success) {
        await userUpdateToken(User.Username)
        return res.redirect('/channel/' + channelID)
    }
    else return res.sendStatus(404)

}

// Refs addUser, takes two objects
async function chAddUser(Channel, User) {
    try {
        if (!(Channel.Users.includes(User.Username)) && (!(User.Channels.includes(Channel.ChannelID)))) {
            Channel.Users.push(User.Username)
            User.Channels.push(Channel.ChannelID)
            await Channel.save()
            await User.save()
            return (true)
        }
        return (false)
    }
    catch (e) {
        console.log(e)
    }
}


// Removes a user from the User array in Channels, removes channel from Users channel array
const popUser = async (req, res) => {
    const { Username, channelID } = req.body;
    success = chPopUser(channelID, Username)
    if (success) {
        await userUpdateToken(Username)
        res.send(true)
    }
    else res.sendStatus(404)
}

// removes Username from channelID
async function chPopUser(channelID, Username) {
    try {
        const User = await userDB.findOne({ 'Username': Username })
        const Channel = await channelDB.findOne({ 'ChannelID': channelID })
        if (User === null || Channel === null) return false
        let userI = Channel.Users.indexOf(Username)
        let channelI = User.Channels.indexOf(channelID)
        if (userI > 0 && channelI > 0) {
            Channel.Users.splice(userI, 1)
            User.Channels.splice(channelI, 1)
            await User.save()
            await Channel.save()
            return true
        }
        else return false

    }
    catch (e) {
        console.log(e)
    }

}

// Create a new channel and add it to the User's channel Array
const newChannel = async (req, res) => {
    const channelID = req.body.ChannelID;
    const User = req.user
    const Username = User.Username
    success = await chNewChannel(channelID, Username)
    await userUpdateToken(Username)
    if (success) {
        res.redirect('/users/home')
    }
    else res.sendStatus(404)
}

// refs newChannel, takes two strings
async function chNewChannel(channelID, Username) {
    try {
        channelID = channelID.replace(/\s/g, '')

        await channelDB.create({ "ChannelID": channelID, "Users": [Username] })
        const User = await userDB.findOne({ "Username": Username })
        User.Channels.push(channelID)
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
        const User = await userDB.findOne({ 'Username': Username })
        token = await userUpdateToken(User.Username)
        return true
    }
    catch (e) {
        console.log(e)
        return false
    }
}

// refs updateToken, takes one string
async function userUpdateToken(Username) {
    try {
        let User = await userDB.findOne({ Username: Username })
        let channelPerms = {}
        for (const channelID in User.Channels) {
            channelPerms[User.Channels[channelID]] = { read: true, write: true }
        }
        const response = await axios.post('https://' + spaceDomain + '/api/chat/tokens',
            {
                channels: channelPerms,
                ttl: 43200,
                member_id: User.Username
            }, { auth });

        token = response.data.token
        User.Token = token
        await User.save()
        return 200
    }
    catch (e) {
        console.log(e)
        return 404
    }
}

// pulls data down to render the chat channel and video room
const viewChannel = async (req, res) => {
    const channelID = req.params.id;
    const UserList = await channelDB.findOne({ ChannelID: channelID })
    const User = req.user
    success = await chViewChannel(channelID, User)
    if (success) {
        res.render('chat', { ChannelID: channelID, User: User, UserList: UserList })
    }
    else res.sendStatus(404)

}

//refs viewChannel, takes a string and User object
async function chViewChannel(channelID, User) {
    const channel = await channelDB.findOne({ 'ChannelID': channelID })
    if (channel === null) return false
    if (!channel.Users.includes(User.Username)) return false

    return true
}

// Creates a new token for users joining the audio channel
const videoToken = async (req, res) => {
    let user_name = req.user.Username
    const roomname = req.body.roomname
    let token = await axios.post(
        "https://" + spaceDomain + "/api/video/room_tokens",
        {
            user_name: user_name,
            room_name: roomname,
        },

        { auth }
    );
    return res.json({ token: token.data.token });
}

// export to channels route
module.exports = {
    listUsers,
    addUser,
    popUser,
    newChannel,
    updateToken,
    videoToken,
    viewChannel,
};