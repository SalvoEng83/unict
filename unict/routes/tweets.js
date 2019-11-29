const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const Tweet = require('../models/tweet');
const autenticationMiddleware = require('../middlewares/auth');
const { checkValidation } = require('../middlewares/validation');


router.get('/', function(req, res, next) {
    Tweet.find().populate("_author", "-password").exec(function(err, tweets) {
        if (err) return res.status(500).json({ error: err });
        res.json(tweets);
    });
});

router.get('/parent', function(req, res, next) {

    Tweet.find({ parent_id: req.query.parent_id }).populate("_author", "-password").exec(function(err, tweets) {
        if (err) return res.status(500).json({ error: err });
        res.json(tweets);
    });
});

router.get('/:id', function(req, res, next) {
    Tweet.findOne({ _id: req.params.id })
        .populate("_author", "-password")
        .exec(function(err, tweet) {
            if (err) return res.status(500).json({ error: err });
            if (!tweet) return res.status(404).json({ message: 'Tweet not found' })
            res.json(tweet);
        });
});

router.post('/', autenticationMiddleware.isAuth, [
    check('tweet').isString().isLength({ min: 1, max: 120 })
], checkValidation, function(req, res, next) {
    const newTweet = new Tweet(req.body);
    newTweet._author = res.locals.authInfo.userId;
    newTweet.save(function(err) {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.status(201).json(newTweet);
    });
});

router.put('/:id', autenticationMiddleware.isAuth, [
    check('tweet').isString().isLength({ min: 1, max: 120 })
], checkValidation, function(req, res, next) {
    Tweet.findOne({ _id: req.params.id }).exec(function(err, tweet) {
        if (err) {
            return res.status(500).json({
                error: err,
                message: "Error reading the tweet"
            });
        }
        if (!tweet) {
            return res.status(404).json({
                message: "Tweet not found"
            })
        }
        if (tweet._author.toString() !== res.locals.authInfo.userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "You are not the owner of the resource"
            });
        }
        tweet.tweet = req.body.tweet;
        tweet.save(function(err) {
            if (err) return res.status(500).json({ error: err });
            res.json(tweet);
        });
    });
});
/*ADD likes */
router.put('/:id/:user_id', [
    check('tweet').isString().isLength({ min: 1, max: 120 })
], function(req, res, next) {
    Tweet.findOne({ _id: req.params.id }).exec(function(err, tweet) {
        if (err) {
            return res.status(500).json({
                error: err,
                message: "Error reading the tweet"
            });
        }
        if (!tweet) {
            return res.status(404).json({
                message: "Tweet not found"
            })
        }
        //Check if user liked the tweet before
        var user = tweet.like_user_list.find(x => x == req.params.user_id);
        if (user != undefined) {
            //If user liked the tweet delete his like
            var index = tweet.like_user_list.findIndex(x => x == req.params.user_id);
            tweet.like_user_list.splice(index, 1);
            console.log("Like deleted");
        } else {
            //Add user like
            tweet.like_user_list.push(req.params.user_id);
            console.log("Like added");
        }

        //Count the number of likes 
        let likeCounter = 0;
        likeCounter = tweet.like_user_list.length;
        console.log("Length: " + likeCounter);

        tweet.save(function(err) {
            if (err) return res.status(500).json({ error: err });
            res.json(likeCounter);

        });
    });
});

router.delete('/:id', autenticationMiddleware.isAuth, function(req, res, next) {
    Tweet.findOne({ _id: req.params.id }).exec(function(err, tweet) {
        if (err) {
            return res.status(500).json({
                error: err,
                message: "Error reading the tweet"
            });
        }
        if (!tweet) {
            return res.status(404).json({
                message: "Tweet not found"
            })
        }
        if (tweet._author.toString() !== res.locals.authInfo.userId) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "You are not the owner of the resource"
            });
        }
        Tweet.remove({ _id: req.params.id }, function(err) {
            if (err) {
                return res.status(500).json({ error: err })
            }
            res.json({ message: 'Tweet successfully deleted' })
        });
    });
});

module.exports = router;