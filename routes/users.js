const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users')


router.route('/register')
    .post(users.register)
    .put(users.isUsernameOrEmailUnique);


router.route('/users')
    .get(users.getUsers)
    .post(users.searchUser)
router.route('/users/heat')
    .put(users.UpdateHeat)

router.route('/login')
    // .get(users.renderLogin)
    .post(users.login)

router.route('/third-party-auth')
    .get(users.thirdPartyAuth)
    .post(users.thirdPartyAuthRegister)

router.route('/profile')
    .get(users.getProfile)
    .put(users.editProfile)


router.route('/edit-password')
    .put(users.changePassword)

router.route('/session')
    .get(users.session)

router.route('/withdraw')
    .post(users.withdraw)

router.post('/validate/email', users.emailverify)
router.post('/verify-otp', users.verifyOtp)
// router.post('/validate/sms', users.sendsms)
// router.route('/sesh')
//     .get(users.sesh);
router.post("/referral", users.referral)
router.route('/host')
    .post(users.HostAnalytics)
router.post("/deleteaccount", users.deleteaccount)
router.route("/host/report")
    .post(users.reportHost)
    .put(users.unblock)

router.route("/get-blocked-status")
    .post(users.getBlocked)

router.post('/logout', users.logout)

module.exports = router;