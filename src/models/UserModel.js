const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: Object,
        default: null,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    phone: String,
    link: String
},
{timestamps: true},
)

module.exports = mongoose.model("User", userSchema)
