const session = require('express-session');


const { Friend } = require('../models/models');
const { Op } = require('sequelize');
const uniqid = require('uniqid');


exports.friendRequest = async (req, res) => {
    const { receiver } = req.body;
    const sender = req.body.sender || req.session.user_id
    const senderName = req.body.senderName || req.session.user.name
    try {
        const id = uniqid();
        const newFriendRequest = await Friend.create({ id, friend_id: receiver, user_id: sender, friendName: senderName });
        res.status(200).json({ ...newFriendRequest.dataValues });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

exports.getFriends = async (req, res) => {
    const id = req.body.id || req.session.user_id
    try {
        const friends = await Friend.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { user_id: id },
                            { friend_id: id }
                        ]
                    },
                    { status: 'accepted' }
                ]
            }
        });
        console.log(friends)
        res.status(200).send(friends);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}


exports.changeFriendStatus = async (req, res) => {
    const { sender, status } = req.body;
    const receiver = req.body.receiver || res.session.user_id
    try {
        const friend = await Friend.findOne({
            where: {
                [Op.and]: [
                    { user_id: sender },
                    { friend_id: receiver }
                ]
            }
        });
        friend.status = status;
        await friend.save();
        res.status(200).send(friend);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}



exports.getPendingRequest = async (req, res) => {
    const id = res.session.user_id || req.body.user_id
    try {
        const friends = await Friend.findAll({
            where: {
                [Op.and]: [
                    { friend_id: id },
                    { status: 'pending' }
                ]
            }
        });
        res.status(200).send(friends);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}
