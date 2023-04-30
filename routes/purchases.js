const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const purchases = require('../controllers/purchases')

router.route('/purchases')
    .get(purchases.getAllPurchases)

router.route('/user/Purchase')
    .get(purchases.getPurchase)
    .put(purchases.createPurchase)


router.route('/user/AllPurchases')
    .get(purchases.getUserPurchases)

router.route('/testers')
    .post(purchases.test)


module.exports = router;