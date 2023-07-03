const session = require('express-session');


const { Friend, User, Purchase, Event } = require('../models/models');
const { Op } = require('sequelize');
const uniqid = require('uniqid');


exports.friendRequest = async (req, res) => {
    const { receiver } = req.body;
    const sender = req.body.sender || req.session.user_id
    const senderName = req.body.senderName || req.session.user.name
    
    const existingFriendRecord = await Friend.findOne({
        where: {
            friend_id: receiver, 
            user_id: sender, 
            friendName: senderName
        }
    })

    if(existingFriendRecord) return res.json({ error: "Alredy sent Friend Request" });

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

    console.log(req.body);

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
        return res.status(200).json({ friends });
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }

}

exports.findFriends = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the events attended by the user
        const attendedEvents = await Purchase.findAll({
            where: {
                user_id: userId
            },
            attributes: ["event_id"]

        });

        const eventAttendees = await Promise.all(
            attendedEvents.map(async ({ event_id }) => {
                const event = await Purchase.findAll({
                    where: {
                        event_id
                    },
                    attributes: ["user_id", "username","profile_pic"]
                })

                return event
            }))


        // Extract the attendees


        return res.send(eventAttendees.flat());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};



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
    const id = req.body.user_id
    try {
        const friends = await Friend.findAll({
            where: {
                [Op.and]: [
                    { friend_id: id },
                    { status: 'pending' }
                ]
            },

        });
        return res.status(200).json({ pending: friends });
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}
