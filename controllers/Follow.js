const uniqid = require('uniqid');
const { Follow, User, Event, Review } = require('../models/models');
const { sequelize } = require('../config/sequelize');
const { Op } = require('sequelize');


exports.createFollow = async (req, res) => {
    const { host, user_id } = req.body
    try {
        const fav = await Follow.create({ id: uniqid(), host, follower: user_id })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.getFollows = async (req, res) => {
    const { user_id } = req.body
    try {
        const fav = await Follow.findAll({ where: { follower: user_id } })
        const promises = fav.map(async(follow) => await User.findByPk(follow.host, { 
            attributes: ['id', 'name', 'profile_pic']
        }))
        const hostsFollowed = await Promise.all(promises)
        return res.status(200).json({ hosts: hostsFollowed, follow_count: fav.length })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

const getHostRating = async (host_id) => {
    const hostEvents = await Event.findAll({ 
        attributes: ['id'],
        where: { host_id } 
    });
    const hostEventIds = hostEvents.map((event) => event.id)

    const reviews = await Review.findAll({
        attributes: [
            [
                sequelize.fn('AVG', sequelize.col('rating')),
                'average_rating'
            ]
        ],
        where: {
            event_id: {
                [Op.in]: hostEventIds
            }
        }
    })
    return reviews.average_rating
}

exports.getHostFollow = async (req, res) => {
    const { host_id } = req.body
    try {
        const fav = await Follow.findAll({ where: { host: host_id } });
        
        const promises = fav.map(async(follow) => await User.findByPk(follow.dataValues.follower, { 
            attributes: ['id', 'name', 'profile_pic']
        }))
        
        const [usersFollowingHost, hostRating] = await Promise.all([
            await Promise.all(promises),
            await getHostRating(host_id)
        ])

        return res.status(200).json({ 
            following: usersFollowingHost, 
            following_count: fav.length, 
            //SHould be changed to followers and followers_count later
            //Make sure to inform teh frontend team once updated

            rating: hostRating || 0
        })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

exports.unFollow = async (req, res) => {
    const { user_id, host } = req.body
    try {
        const fav = await Follow.destroy({ where: { host, follower: user_id } })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}