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
    .get(purchases.getPurchase)
    .put(purchases.createPurchase)


router.route('/user/allpurchases')
    .get(purchases.getUserPurchases)

router.route('/pay')
    .post(purchases.makePayment)
    .get(purchases.paymentVerification)

router.route('/testers')
    .get(purchases.test)


module.exports = router;