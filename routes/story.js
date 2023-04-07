const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { getStories } = require('../controllers/story')



router.route('/story')
    .get(getStories)

module.exports = router;