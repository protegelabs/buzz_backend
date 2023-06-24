const uniqid = require('uniqid');
const { Follow, User } = require('../models/models');
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
exports.getHostFollow = async (req, res) => {
    const { host } = req.body
    try {
        const fav = await Follow.findAll({ where: { host } });
        const promises = fav.map(async(follow) => await User.findByPk(follow.host, { 
            attributes: ['id', 'name', 'profile_pic']
        }))
        const usersFollowingHost = await Promise.all(promises)
        return res.status(200).json({ 
            following: usersFollowingHost, 
            following_count: fav.length 
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