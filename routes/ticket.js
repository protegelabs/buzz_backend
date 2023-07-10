const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const catchAsync = require('../utils/catchAsync')
const { getEventTickets, updateTicket, updateManyTickets, deleteManyTickets, deleteTicket } = require('../controllers/ticket')



router.route('/ticket')
    .get(getEventTickets)
    .post(updateTicket)
    .delete(deleteTicket)
router.route('./ticket/many')
    .post(updateManyTickets)
    .delete(deleteManyTickets)


module.exports = router;