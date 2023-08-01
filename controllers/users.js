const session = require('express-session');
const bcrypt = require('bcryptjs');
const express = require('express')
const { User, OtpCode, Withdrawal } = require('../models/models')
const { Op, where } = require('sequelize')
const { hashPassword } = require('../utils/hashPassword')
const { Mail, randNum } = require('../utils/validate')
const uniqid = require('uniqid');
const shortid = require('shortid'); //
const { getHostEvent, getPurchaseFollow, has24HoursPassed } = require('../utils/getFriends');
const { use } = require('passport');

module.exports.renderRegister = (req, res) => {
    const james = User.create({ fullName: 'james', id: "me" })
    res.send(james)
}

module.exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).send(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}
exports.isUsernameOrEmailUnique = async (req, res) => {
    try {
        const { username, email } = req.body
        if (email === undefined || null) {
            const user = await User.count({ where: { username } })
            console.log(username)
            return res.status(200).send({ user: user })
        } else if (username === undefined || null) {
            const user = await User.count({ where: { email: email.toLowerCase() } })
            return res.status(200).send({ user: user })
        } else {
            return res.status(200).send(false)
        }

    } catch (e) {
        console.log(e)
        return res.status(400).json({ message: e.message });
    }
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
            auth_type,
            referral_code
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
            const [newUser, _] = await Promise.all([
                await User.create({
                    id, name,
                    username, email: email.toLowerCase(),
                    type, phone_number, bio, password: hash,
                    heat, profile_pic,
                    is_active, dob, gender, location,
                    authtype: auth_type, heatTime: new Date()
                }),
                await User.increment('heat', { by: 25 , where: { referral_code } })
            ])
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
        console.time('bad await')
        //find user in the database
        const user = await User.findOne({
            where: { email: email.toLowerCase() },
        })
        console.timeEnd('bad await');
        const newUser = user.dataValues
        if (newUser) {
            //check for username in database and ensure password matches, then grant access
            console.time('ba await')
            const check = await bcrypt.compare(password, newUser.password);
            console.timeEnd('ba await');
          
            if (check === true) {
                return res.status(200).send({user_id:newUser.id,user:newUser})
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
    const id = req.query.id || req.session.user_id;
    try {
        const getUser = await User.findOne({ where: { id } })
        return res.send(getUser)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports.withdraw = async (req, res) => {
    const user_id = req.body.user_id || req.session.user_id;
    const { amount, bankName, accountName, accountNumber } = req.body
    try {
        const id = uniqid()
        const user = await User.findOne({ where: { id: user_id } })
        const { name, username, email } = user
        //const balance = parseInt(user.balance)
        /*
        if (balance < parseInt(amount)) {
            return res.status(400).json({ message: "Balance less than amount" })
        }*/
        //const newBalance = balance - parseInt(amount)
        const withdrawal = await Withdrawal.create({ id, user_id, name, username, email, amount, bankName, accountName, accountNumber })
        
        /*
        const updateBalance = await User.update({ balance: newBalance }, {
            where: {
                id: user_id
            }
        });*/


        return res.send(withdrawal)
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: error.message })
    }
}

exports.reportHost= async(req,res)=>{
     const{ id }= req.body
     try{
         const user = await User.increment('reported',{by:1,where:{id}})
        return res.send("done")
     }catch(err){
         res.status(400).json({message:err.message})
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
    const id = req.body.id || req.session.user_id
    const hash = await hashPassword(password)
    try {
        const updatePassword = await User.update({ password: hash }, {
            where: { id }
        });
        return res.status(200).json(updatePassword)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports.emailverify = async (req, res) => {
    const email = req.body.email;
    const num = randNum()

    try {
        const [affectedRows] = await User.update({ code: num }, {
            where: { email }
        })
        //const User = await User.findOne({ where: { email } })
        if (affectedRows === 0) return res.status(200).json({ message: "Account does not exist" })

        await Mail(email, num)


        return res.status(200).json({
            message: "Email successfully sent",
            otp_code: num
        })
    } catch (e) {
        return res.status(400).json({ message: e.message })
    }

}


module.exports.verifyOtp = async (req, res) => {
    const email = req.body.email;
    const code = req.body.otp_code;

    try {
        const otpRecord = await User.findOne({
            where: {
                email,
                code
            }
        })
        if (!otpRecord) return res.status(200).json({ message: "Otp incorrect" });

        return res.status(200).json({
            message: "Otp Successful",
        })
    } catch (e) {
        return res.status(400).json({ message: e.message })
    }

}

module.exports.sendsms = async (req, res) => {
    let sms;
    res.send(sms)
}



exports.thirdPartyAuth = async (req, res) => {
    const { auth_type, user_id } = req.query;
    try {
        const user = await User.findByPk(user_id)
        req.session.user_id = user.dataValues.id;
        return res.json({ user_data: user.dataValues })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.thirdPartyAuthRegister = async (req, res) => {
    const { auth_type, user_id, email, ...rest } = req.body;
    try {
        const newUser = await User.create({
            authtype: auth_type,
            id: user_id,
            email: email.toLowerCase(),
            ...rest
        })
        req.session.user_id = user_id
        return res.status(201).send(newUser.dataValues)

    } catch (e) {
        return res.status(400).json({ message: "Bad Request" })
    }

}

exports.searchUser = async (req, res) => {
    const query = req.body.query;
    console.log(req.body);

    try {
        console.log(query)
        return await User.findAll({
            where: {
                [Op.or]: [
                    {
                        username: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    {
                        name: {
                            [Op.like]: `%${query}%`
                        }
                    }
                ]
            },
            limit: 7
        })
            .then((resp) => {
                return res.status(200).json({ users: resp });
            })

    } catch (err) {
        return res.status(400).json({ message: err.message })
    }

}

exports.HostAnalytics = async (req, res) => {
    console.log(req.session)
    const host_id = req.body.host_id;

    try {
        /**
         * grab all events id done by host attribute will be event id
         * search through the event categories table with each id and grab its categories put it in an object
         * where event are keys categories are values
         * count for all categories
         * display value
         */
        const [event, _, categoriesCount] = await getHostEvent(host_id)
        const eventIds = event.map((event) => event.id)

        const purchase = await getPurchaseFollow(host_id)


        res.status(200).json({
            events: eventIds,
            purchase,
            categories_count: categoriesCount
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}


module.exports.session = (req, res) => {
    return res.status(200).send(req.session);
}

module.exports.logout = (req, res) => {
    req.session.destroy;
    return res.status(200).send('logged out');
}

exports.UpdateHeat = async (req, res) => {
    try {
        const options = { month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' }
        const { userId } = req.body;
        let date;

        // Find the user by ID
        console.log(userId)
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log(user.heatTime)
        if (user.heatTime && !has24HoursPassed(user.heatTime)) {
            date = new Date(user.heatTime)
            const time24HoursFromNow = new Date(date.getTime() + (24 * 60 * 60 * 1000));
            return res.status(400).json({ error: `Heat can only be updated after ${time24HoursFromNow.toLocaleDateString('en-US', options)}.`, timefornext: time24HoursFromNow });
        } else {
            user.heat += 2;

            user.heatTime = new Date();
            date = new Date(user.heatTime)
            const time24HoursFromNow = new Date(date.getTime() + (24 * 60 * 60 * 1000));

            // Save the updated user
            await user.save();

            return res.status(200).json({ message: `Heat value updated successfully.next heat at ${time24HoursFromNow.toLocaleDateString('en-US', options)}. `, timefornext: time24HoursFromNow });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const generateReferralCode = () => {
    // Generate a unique code using shortid
    const uniqueCode = shortid.generate();

    // Take the first 6 characters of the unique code
    const referralCode = uniqueCode.substring(0, 6);

    return referralCode;
};
exports.referral = async (req, res) => {
    const { id } = req.body
    try {
        const referralCode = generateReferralCode();

        // Assuming you have the user ID from the authenticated request
        const userId = req.body.id;
        console.log(referralCode)
        // Find or create the user by ID
        const user = await User.findOne({
            where: { id: userId }
        });

        console.log(user.referral_code)
        if (!user.referral_code) {
            // If the user already exists, update the referralCode field
            user.referral_code = referralCode;
            await user.save();
        }


        return res.send(user.referral_code);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.deleteaccount= async(req,res)=>{
     const{ email }= req.body
     try{
         const user = await User.destroy({where:{email:email.toLowerCase()}})

         res.send("done")
     }catch(err){
         res.status(400).json({message:err.message})
     }
}

