const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { friendRequest, getFriends, changeFriendStatus, getPendingRequest } = require('../controllers/friends')

router.route('/friends/request')
    .post(friendRequest)
    .put(getPendingRequest)

router.route('/friends')
    .post(getFriends)
    .put(changeFriendStatus)




module.exports = router;