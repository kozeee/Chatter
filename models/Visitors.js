const mongoose = require('mongoose')

const visitorSchema = new mongoose.Schema({
    VisitorID: {
        type: String,
    },
    Created: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Visitor', visitorSchema) 