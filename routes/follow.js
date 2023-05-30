const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const { createFollow, getFollows, getHostFollow, unFollow } = require('../controllers/Follow')

router.route('/user/follow')
    .post(createFollow)
    .delete(unFollow)

router.route('/follow')
    .post(getFollows)

router.route('/host/follow')
    .post(getHostFollow)

module.exports = router;