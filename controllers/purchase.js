const session = require('express-session');
const { Purchase } = require('../models/models')
const { Op } = require('sequelize')
const uniqid = require('uniqid')



module.exports.getAllPurchases = async (req, res) => {
    const event = await Purchase.findAll();
    return res.send(event)
}

module.exports.getUserPurchases = async (req, res) => {
    const id = req.session.user_id || req.body.id;
    console.log(req.session)
    try {
        const event = await Purchase.findAll({ where: { id } });
        return res.send(event)
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.getPurchase = async (req, res) => {
    const id = req.query.event_id || req.body.purchase_id;
    console.log(id);
    try {
        const event = await Purchase.findOne({ where: { id } });
        return res.send(event)
    } catch (error) {
        return res.send('sorry an error occured')
    }

}

module.exports.createPurchase = async (req, res) => {
    const { event_id } = req.body
    const user_id = req.session.user_id || req.body.user_id
    console.log("user_id is", user_id)
    const id = uniqid();
    try {
        const newPurchase = await Purchase.create({ id, user_id, event_id })
        return res.send(newPurchase)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


module.exports.editPurchase = async (req, res) => {
    const { user_id, event_id } = req.body
    const id = req.body.id || req.params.event_id;
    try {
        const newPurchase = await Purchase.update({ user_id, event_id }, {
            where: { id }
        });
        return res.send(newPurchase)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}