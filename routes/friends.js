const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { friendRequest, getFriends, changeFriendStatus, getPendingRequest, findFriends,removeFriend } = require('../controllers/friends')

router.route('/friends/request')
    .post(friendRequest)
    .put(getPendingRequest)

router.route('/friends')
    .post(getFriends)
    .put(changeFriendStatus)
router.route('/friends/invite')
    .post(findFriends)
   
router.route('friends/delete')
.put(removeFriend)


module.exports = router;