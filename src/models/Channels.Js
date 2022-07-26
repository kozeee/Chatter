const mongoose = require('mongoose')

const channelSchema = new mongoose.Schema({
    ChannelID: {
        type: String,
        required: true,
        unique: true
    },
    Users: {
        type: Array,
        required: true,
        default: []
    },
    Created: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Channel', channelSchema)