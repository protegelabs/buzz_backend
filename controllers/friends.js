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
    const { sender, receiver, senderName } = req.body;
    const id = uniqid();
    const newFriendRequest = await Friend.create({ id, friend_id: sender, user_id: receiver, friendName: senderName });
    res.send(newFriendRequest);
}

exports.getFriends = async (req, res) => {
    const { id } = req.body;
    const friends = await Friend.findAll({ where: { [Op.or]: [{ user_id: id }, { friend_id: id }] } });
    res.send(friends);
}
