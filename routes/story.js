const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { getFriendStories,uploadstories,deleteStory,getUserStories } = require('../controllers/story')



router.route('/story')
    .get(getFriendStories)
    .post(uploadstories)
    .delete(deleteStory)
    .put(getUserStories)

module.exports = router;