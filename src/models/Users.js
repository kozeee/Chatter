const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: false,
        default: "#"
    },
    Email: {
        type: String,
        required: true
    },
    Channels: {
        type: Array,
        default: ['Welcome']
    },
    Token: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)