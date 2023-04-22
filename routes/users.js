const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users')


router.route('/register')
    .post(users.register);


router.route('/users')
    .get(users.getUsers)
    .post(users.searchUser)


router.route('/login')
    // .get(users.renderLogin)
    .post(users.login)

router.route('/third-party-auth')
    .get(users.thirdPartyAuth)

router.route('/profile')
    .get(users.getProfile)
    .put(users.editProfile)


router.route('/edit-password')
    .put(users.changePassword)

router.post('/validate/email', users.emailverify)
// router.post('/validate/sms', users.sendsms)
// router.route('/sesh')
//     .get(users.sesh);




router.get('/logout', users.logout)

module.exports = router;