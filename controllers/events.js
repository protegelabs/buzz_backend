const session = require('express-session');
const { Event, Review, User } = require('../models/models')
const { Op, where } = require('sequelize')
const uniqid = require('uniqid')
const { sequelize } = require('../config/sequelize')



module.exports.getAllEvents = async (req, res) => {
    const event = await Event.findAll();
    return res.send(event)
}

module.exports.getHostEvents = async (req, res) => {
    const host = req.session.user_id || req.body.id;
    console.log(req.session)
    try {
        const event = await Event.findAll({ where: { host } });
        return res.send(event)
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.getEvent = async (req, res) => {
    const id = req.query.event_id || req.body.event_id;
    console.log(id);
    try {
        const event = await Event.findOne({ where: { id } });
        const reviews = await Review.findAll({ where: { event_id: id } });
        // return res.send(event)
        return res.send({ event, reviews })
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.createEvent = async (req, res) => {
    const { name, price, location, longitude, latitude, date, discount, is_active, event_pic, tickets } = req.body
    const host_id = req.session.user_id || req.body.host
    console.log("host is", host)
    const id = uniqid();
    try {
        const newEvent = await Event.create({ id, name, price, location, longitude, latitude, date, host_id, discount, is_active, event_pic, tickets })
        return res.send(newEvent)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


module.exports.editEvent = async (req, res) => {
    const { name, price, location, longitude, latitude, date, host_id, discount, is_active, event_pic, tickets } = req.body
    const id = req.body.event_id || req.params.event_id;
    try {
        const newEvent = await Event.update({ name, price, location, longitude, latitude, date, host_id, discount, is_active, event_pic, tickets }, {
            where: { id }
        });
        return res.send(newEvent)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


exports.searchEvent = async (req, res) => {
    const { event_name, ...rest } = req.body;
    try {
        return await Event.findAll({
            where: {
                name: {
                    [Op.like]: `%${event_name}%`
                },
                ...rest
            }
        })
            .then((data) => {
                return res.json({ events: data })
            })

    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
}
exports.closestEvent = async (req, res) => {
    const { id, longitude, latitude } = req.body
    try {
        const distance = 50; // 50km
        const nearest = await Event.scope({
            method: ['distance', latitude, longitude, distance]
        })
            .findAll({
                where:{
                  is_active: 1
                },
                order: sequelize.col('distance'),
                limit: 5
            });
        return res.status(200).json(nearest)

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}