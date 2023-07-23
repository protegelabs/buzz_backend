const { HostRevenueGoal, HostTicketGoal, Purchase } = require('../models/models');
const { Op, where } = require('sequelize');
const uniqid = require('uniqid');

//This is for revenue
module.exports.createRevenueGoal = async (req, res) => {
    const { goal_end_day, goal, host_id } = req.body;
    const id = uniqid();

    try {
        const existingGoal = await HostRevenueGoal.findOne({
            where: { host_id }
        })

        if(!existingGoal) {
            const revenueGoal = await HostRevenueGoal.create({
                id,
                host_id,
                goal_start_day: new Date(),
                goal_end_day, 
                goal
            })
            return res.status(201).send(revenueGoal)          
        }

        await HostRevenueGoal.update({ goal, goal_end_day }, {
            where: { host_id }
        })
        return res.json({ message: "Goal Created Successfully" })
    } 
    catch (err) {
        return res.status(500).json({ message: err })
    }
}

module.exports.getRevenueGoal = async (req, res) => {
    const { host_id } = req.body;

    try {
        const revenueGoal = await HostRevenueGoal.findOne({
            where: { host_id }
        })

        if(!revenueGoal) {
            return res.json({
                goal: 0,
                progress: 0,
                exists: false,
                goal_end_day: new Date().toISOString(),
            })
        }

        if(new Date(revenueGoal.dataValues.goal_end_day) < new Date()) {
            return res.json({
                goal: 0,
                progress: 0,
                exists: false,
                goal_end_day: new Date().toISOString(),
            })
        }


        const purchaseSum = await Purchase.sum('amount', {
            where: {
                host_id: host_id,
                createdAt: {
                    [Op.gte]: new Date(revenueGoal.dataValues.goal_start_day)
                }
            }
        });

        return res.json({
            goal: revenueGoal.dataValues.goal,
            progress: purchaseSum ?? 0,
            exists: true,
            goal_end_day: revenueGoal.goal_end_day
        })
    } catch (e) {
        return res.status(500).json({ mesaage: e })
    }
}



//This is for tickets
module.exports.createTicketGoal = async (req, res) => {
    const { goal_end_day, goal, host_id } = req.body;
    const id = uniqid();

    try {
        const existingGoal = await HostTicketGoal.findOne({
            where: { host_id }
        })

        if(!existingGoal) {
            const ticketGoal = await HostTicketGoal.create({
                id,
                host_id,
                goal_start_day: new Date(),
                goal_end_day, 
                goal
            })
            return res.status(201).send(ticketGoal)          
        }

        await HostTicketGoal.update({ goal, goal_end_day }, {
            where: { host_id }
        })
        return res.json({ message: "Goal Created Successfully" })
    } 
    catch (err) {
        return res.status(500).json({ message: err })
    }
}

module.exports.getTicketGoal = async (req, res) => {
    const { host_id } = req.body;

    try {
        const ticketGoal = await HostTicketGoal.findOne({
            where: { host_id }
        })

        if(!ticketGoal) {
            return res.json({
                goal: 0,
                progress: 0,
                exists: false,
                goal_end_day: new Date().toISOString(),
            })
        }

        if(new Date(ticketGoal.dataValues.goal_end_day) < new Date()) {
            return res.json({
                goal: 0,
                progress: 0,
                exists: false,
                goal_end_day: new Date().toISOString(),
            })
        }

        const ticketCount = await Purchase.count({
            where: {
                host_id: host_id,
                createdAt: {
                    [Op.gte]: ticketGoal.dataValues.goal_start_day
                }
            }
        });

        return res.json({
            goal: ticketGoal.dataValues.goal,
            progress: ticketCount ?? 0,
            exists: true,
            goal_end_day: ticketGoal.dataValues.goal_end_day
        })
    } catch (e) {
        return res.status(500).json({ message: e })
    }
}