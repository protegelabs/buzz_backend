const express = require('express');
const router = express.Router();
const goals = require('../controllers/goals')


router.route('/ticket-goal')
    .post(goals.createTicketGoal)
    .get(goals.createTicketGoal)

router.route('/revenue-goal')
    .post(goals.createRevenueGoal)
    .get(goals.getRevenueGoal)


module.exports = router;