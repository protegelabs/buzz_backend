const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const events = require('../controllers/events')

router.route('/events')
    .get(events.getAllEvents)

router.route('/host/Event')
    .get(events.getEvent)
    .post(events.createEvent)
    .put(events.editEvent)

router.route('/host/AllEvents')
    .get(events.getHostEvents)


module.exports = router;