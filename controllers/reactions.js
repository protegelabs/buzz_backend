const session = require('express-session');
const { Reaction } = require('../models/models');
const { Op, where } = require('sequelize');
const uniqid = require('uniqid');




module.exports.getAllReactions = async (req, res) => {
    const reactions = await Reaction.findAll();
    return res.send(reactions)
}

module.exports.getUserReactions = async (req, res) => {
    const user_id = req.session.user_id || req.body.id;
    console.log(req.session)
    try {
        const reactions = await Reaction.findAll({ where: { user_id } });
        return res.send(reactions)
    } catch (error) {
        return res.send('sorry an error occured')
    }

}

module.exports.createReaction = async (req, res) => {
    const { post_id, reaction } = req.body
    const user_id = req.session.user_id || req.body.user_id
    const username = req.session.user.username || req.body.profile_pic
    const profile_pic = req.session.user.profile_pic || req.body.user_id
    const id = uniqid();
    try {
        const newReaction = await Reaction.create({ id, user_id, username, profile_pic, post_id, reaction })
        return res.send(newReaction)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports.deleteReaction = async (req, res) => {
    const id = req.query.reaction_id || req.body.reaction_id;
    console.log(id);
    try {
        const destroy = await Reaction.destroy({
            where: {
                id
            }
        });
        return res.send(destroy)
    } catch (error) {
        return res.send('sorry an error occured')
    }
}
