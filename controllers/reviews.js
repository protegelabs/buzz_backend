const session = require('express-session');
const { Review } = require('../models/models');
const { Op, where } = require('sequelize');
const uniqid = require('uniqid');

module.exports.getAllReviews = async (req, res) => {
    const review = await Review.findAll();
    return res.send(review)
}

module.exports.getReviewsForHost = async (req, res) => {
    const { host_id } = req.body;

    try {
        const reviews = await Review.findAll({ where: { host_id } });
        return res.send(reviews)
    } catch (e) {
        return res.status(500).send(e)
    }

}

module.exports.createReview = async (req, res) => {
    const { event_id, review, rating, host_id, user_id, username, profile_pic } = req.body;

    const id = uniqid();
    try {
        const newReview = await Review.create({ id, event_id, user_id, username, profile_pic, review, rating, host_id })
        return res.send(newReview)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports.deleteReview = async (req, res) => {
    const id = req.query.review_id || req.body.review_id;
    console.log(id);
    try {
        const destroy = await Review.destroy({
            where: {
                id
            }
        });
        return res.send(destroy)
    } catch (error) {
        return res.send('sorry an error occured')
    }
}
