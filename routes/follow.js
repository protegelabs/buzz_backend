const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const { createFollow,getFollows,getHostFollow,unFollow} = require('../controllers/Follow')

router.route('/user/follow')
    .post(createFollow)
    .get(getFollows)
    .delete(unFollow)
router.route('/host/follow')
    .get(getHostFollow)

module.exports = router;