const session = require('express-session');
const { Notification } = require('../models/models')
const { Op, where } = require('sequelize')
const uniqid = require('uniqid')
const { sequelize } = require('../config/sequelize')


module.exports.getAllNotifications = async (req, res) => {
    const notification = await Notification.findAll();
    return res.send(notification)
}

module.exports.getUserNotifications = async (req, res) => {
    const user_id = req.session.user_id || req.body.user_id;
    console.log(req.session)
    try {
        const notification = await Notification.findAll({ where: { user_id } });
        return res.send(notification)
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.createNotification = async (req, res) => {
    const { name, price, location, longitude, latitude, date, discount, is_active, notification_pic, tickets, timeStart, timeEnd, categories } = req.body
    const user_id = req.session.user_id || req.body.user_id
    const notification_id = uniqid();
    try {
        const newNotification = await Notification.create({ id: notification_id, name, price, location, longitude, latitude, date, user_id, discount, is_active, notification_pic, tickets, timeStart, timeEnd })
        const newcat = categories.map((category) => {
            return { [category]: 1 }
        })

        const notificationCategory = await NotificationCategory.create({
            id: uniqid(),
            notification_id,
            ...Object.assign({}, ...newcat)
        });
        return res.send(newNotification)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}










