const mongoose = require('mongoose');

const userScchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {type: String, required: true, unique: true},
    pass: {type: Number, required: true}
});

module.exports = mongoose.model('User', userScchema);