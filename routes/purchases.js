const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const purchases = require('../controllers/purchases')

router.route('/purchases')
    .get(purchases.getAllPurchases)

router.route('/user/purchase')
    .post(purchases.getPurchase)
    .put(purchases.createPurchase)

router.route('/user/attendee')
    .post(purchases.getattendees)

router.route('/user/allpurchases')
    .post(purchases.getUserPurchases)

router.route('/pay')
    .post(purchases.makePayment)


router.route('/payment/verify')
    .post(purchases.paymentVerification)

router.route('/attendance')
    .post(purchases.purchaseList)

router.route('/host/balance')
    .post(purchases.getHostBalance)

router.route('/cancel')
    .post(purchases.cancelPurchase)


module.exports = router;