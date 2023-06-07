const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const reactions = require('../controllers/reactions')

router.route('/reactions')
    .get(reactions.getAllReactions)
    .post(reactions.getUserReactions)
    .put(reactions.deleteReaction)

router.route('/user/reactions')
    .post(reactions.createReaction)




module.exports = router;