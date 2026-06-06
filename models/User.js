const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    referralCode: {
        type: String
    },

    referredBy: {
        type: String
    },

    balance: {
        type: Number,
        default: 0
    },

    lastVideo: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('User', UserSchema);
