const uniqid = require('uniqid');
const { Favourite } = require('../models/models');
exports.createFav = async (req, res) => {
    const { event_id } = req.body
    const user_id = req.body.user_id || req.session.user.id
    const id = uniqid()
    try {
        const fav = await Favourite.create({ id, event_id, user_id })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.getFavourites = async (req, res) => {
    const user_id = req.body.user_id || req.session.user_id
    try {
        const fav = await Favourite.findAll({ where: { user_id } })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}
exports.getEventFavorite = async (req, res) => {
    const { event_id } = req.body
    try {
        //const fav = await Favourite.findAll({ where: { event_id } })
        const { rows, count } = await Favourite.findAndCountAll({ where: { event_id } })
        res.status(200).json({ fav: rows, favnum: count })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.deleteFav = async (req, res) => {
    const { event_id } = req.body
    const user_id = req.body.user_id || req.session.user_id
    try {
        const fav = await Favourite.destroy({ where: { event_id, user_id } })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}