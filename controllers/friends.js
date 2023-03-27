const session = require('express-session');
const db = require('../dbconnect');
const bcrypt = require('bcryptjs');
const express = require('express');
const { Friend } = require('../models/models');
const { Op } = require('sequelize');
const { hashPassword } = require('../utils/hashPassword');
const { Mail, randNum } = require('../utils/validate');
const uniqid = require('uniqid');


exports.friendRequest = async (req, res) => {
    const { receiver } = req.body;
    const sender = req.session.user_id || req.body.sender
    const senderName = req.session.user.name
    try {
        const id = uniqid();
        const newFriendRequest = await Friend.create({ id, friend_id: receiver, user_id: sender, friendName: senderName });
        res.status(200).json({ ...newFriendRequest.dataValues });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

exports.getFriends = async (req, res) => {
    const id = req.session.user_id || req.body.sender;
    try {
        const friends = await Friend.findAll({
            where: {
                [Op.and]: [
                    { user_id: id },
                    { status: 'accepted' }
                ]
            }
        });
        res.status(200).send(friends);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

exports.changeFriendStatus = async (req, res) => {
    const { sender, status } = req.body;
    const receiver = res.session.user_id || req.body.user_id
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

