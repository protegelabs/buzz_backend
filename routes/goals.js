const express = require('express');
const router = express.Router();
const goals = require('../controllers/goals')


router.route('/ticket-goal')
    .post(goals.getTicketGoal)

router.route('/ticket-goal/create')
    .post(goals.createTicketGoal)

router.route('/revenue-goal')
    .post(goals.getRevenueGoal)

router.route('/revenue-goal/create')
    .post(goals.createRevenueGoal)


module.exports = router;