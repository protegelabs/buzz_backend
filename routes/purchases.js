const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const purchases = require('../controllers/purchases')

router.route('/purchases')
    .get(purchases.getAllPurchases)

router.route('/host/Purchase')
    .get(purchases.getPurchase)
    .post(purchases.createPurchase)


router.route('/user/AllPurchases')
    .get(purchases.getUserPurchases)


module.exports = router;