const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const { createFav, getEventFavorite, getFavourites, deleteFav } = require('../controllers/favourites')

router.route('/user/fav')
    .post(createFav)
    .get(getFavourites)
    .delete(deleteFav)
router.route('/host/fav')
    .get(getEventFavorite)

module.exports = router;