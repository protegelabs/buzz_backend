const session = require('express-session');
const bcrypt = require('bcryptjs');
const express = require('express')
const { User } = require('../models/models')
const { Op } = require('sequelize')
const { hashPassword } = require('../utils/hashPassword')
const { Mail, randNum } = require('../utils/validate')
const uniqid = require('uniqid')

module.exports.renderRegister = (req, res) => {
    const james = User.create({ fullName: 'james', id: "me" })
    res.send(james)
}

module.exports.getUsers = async (req, res) => {
    const users = await User.findAll();
    return res.status(200).send(users)
}

module.exports.get = async (req, res) => {
    const users = await User.findAll();
    return res.status(200).send(users)
}

module.exports.register = async (req, res) => {
    try {
        //get params from the request body
        const {
            name,
            username,
            email,
            type,
            phone_number,
            bio,
            password,
            heat,
            profile_pic,
            is_active,
            dob,
            gender,
            location,
            auth_type
        } = req.body;

        //hash password and save to database
        const hash = await hashPassword(password);
        const id = uniqid()


        const check = await User.findOne({
            where: { email: email.toLowerCase() }
        });

        if (check) {
            return res.status(400).send('user already exist')
        } else {
            const newUser = await User.create({
                id, name,
                username, email: email.toLowerCase(),
                type, phone_number, bio, password: hash,
                heat, profile_pic,
                is_active, dob, gender, location,
                authtype: auth_type
            })
            req.session.user_id = id
            return res.status(201).send(newUser.dataValues)
        }
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
}


module.exports.login = async (req, res) => {
    //get params from the request body
    const { email, password } = req.body;

    try {
        //find user in the database
        const user = await User.findOne({
            where: { email: email.toLowerCase() }
        })

        const newUser = user.dataValues
        if (newUser) {
            //check for username in database and ensure password matches, then grant access
            const check = await bcrypt.compare(password, newUser.password);
            console.log(check)
            if (check === true) {
                req.session.user_id = newUser.id
                req.session.user = newUser
                return res.status(200).send(req.session)
            } else {
                return res.status(400).json('wrong email or password')
            }
        } else {
            return res.status(400).json('email or password is incorrect')
        }


    } catch (error) {
        return res.status(400).json({ message: error.message })
    }

}

module.exports.getProfile = async (req, res) => {
    const id = req.params.id || req.session.user_id;
    try {
        const getUser = await User.findOne({ where: { id } })
        res.send(getUser)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

module.exports.editProfile = async (req, res) => {
    //const { name, username, email, type, phone, bio, heat, profile_url, is_active, dob, gender, location } = req.body
    const requestBody = req.body;
    const id = req.session.user_id || req.body.id;
    try {
        const updateUser = await User.update({ ...requestBody }, {
            where: { id }
        });

        return res.status(200).send(updateUser)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports.changePassword = async (req, res) => {
    const { password } = req.body
    const id = req.session.user_id || req.body.id
    try {
        const updatePassword = await User.update({ password }, {
            where: { id }
        });
        return res.status(200).json(updatePassword)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports.emailverify = async (req, res) => {
    const id = req.session.user_id || req.body.id
    try {
        const User = await User.findOne({ where: { id } })
        const { email } = User
        const num = randNum()
        await Mail(email, num)
        return res.status(200).json(num)
    } catch (e) {
        return res.status(400).json({ message: e.message })
    }

}


module.exports.sendsms = async (req, res) => {
    let sms;
    res.send(sms)
}



exports.thirdPartyAuth = async (req,res) => {
    const { auth_type, user_id } = req.params;
    try{
        const user = await User.findByPk(user_id)
        req.session.user_id = user.dataValues.id;
        return res.json({ user_data: user.dataValues })
    } catch(err){
        res.status(400).json({ message:err.message })
    }
}

exports.thirdPartyAuthRegister = async (req, res) => {
    const { auth_type, user_id, email, ...rest } = req.body;
    try {
        const user = await User.create({
            authtype: auth_type,
            id: user_id,
            //email: email.toLowerCase(),
            //...rest
        })
    } catch (e) {

    }

}

exports.searchUser= async (req,res) => {
    const query = req.body.query;
    console.log(req.body);
    
    try {
        console.log(query)
        return await User.findAll({
            where: {
                [Op.or]: [
                    {
                        username: {
                            [Op.like]:`%${query}%`
                        }
                    },
                    {
                        name: {
                            [Op.like]:`%${query}%`
                        }
                    }
                ]
            },
            limit: 7
        })
        .then((resp) => {
            return res.status(200).json({ users: resp });
        })

    } catch(err) {
        return res.status(400).json({message:err.message})
    }

}


module.exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
}

