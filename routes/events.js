const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { request } = require('express');
const events = require('../controllers/events')

router.route('/event')
    .get(events.getEvent)
    
router.route('/events')
    .get(events.getAllEvents)
    .post(events.searchEvent)

router.route('/host/Event')
    .get(events.getEvent)
    .post(events.createEvent)
    .put(events.editEvent)

router.route('/host/AllEvents')
    .get(events.getHostEvents)


module.exports = router;