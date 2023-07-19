const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const reviews = require('../controllers/reviews')

router.route('/reviews')
    .get(reviews.getAllReviews)
    .post(reviews.getReviewsForHost)

router.route('/review')
    .post(reviews.createReview)

router.route('/delete/review')
    .put(reviews.deleteReview)

module.exports = router;