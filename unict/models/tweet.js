const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({

    _author: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    tweet: { type: String, minlenght: 1, maxlenght: 280 },
    created_at: { type: Date, default: Date.now() },
    parent_id: { type: String, default: "0" },
    //List of likes
    check: { type: Number },
    like_user_list: { type: [mongoose.Schema.Types.ObjectId], ref: "User" }

});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;