const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { friendRequest, getFriends, changeFriendStatus } = require('../controllers/friends')

router.route('/friends/request')
    .get(getFriends)
    .post(friendRequest)
    .put(changeFriendStatus)




module.exports = router;