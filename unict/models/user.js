const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    surname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bookmarks: [{ type: String }] //storia3 idtweet
});

const User = mongoose.model('User', userSchema);

module.exports = User;