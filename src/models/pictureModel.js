const mongoose = require('mongoose');

const pictureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    picture: {
        type: Object,
        required: true,
    },
    gallaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gallary',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    private: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true});

module.exports = mongoose.model('Picture', pictureSchema)