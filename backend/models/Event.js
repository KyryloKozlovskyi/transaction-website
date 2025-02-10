const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;