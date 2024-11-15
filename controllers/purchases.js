const session = require('express-session');
const { Purchase, Event, User, Withdrawal } = require('../models/models');
const { sequelize } = require("../config/sequelize")
const { Op } = require('sequelize')
const uniqid = require('uniqid')
const dotenv = require('dotenv');

var paystack = require('paystack')('process.env.PAYSTACK_SECRET_KEY');



module.exports.getAllPurchases = async (req, res) => {
    const event = await Purchase.findAll();
    return res.send(event)
}

module.exports.getUserPurchases = async (req, res) => {
    const user_id = req.body.user_id;
    console.log(req.session)
    try {
        const purchases = await Purchase.findAll({ where: { user_id } });
        const events = await Promise.all(purchases.map(async (purchase) => {
            const event = await Event.findByPk(purchase.event_id)//reduce the retrieved
            const purchaseRecord = {
                purchase: purchase,
                event: event,
            }

            return purchaseRecord
        }))

        const currentDateAndTime = new Date()
        const upcomingEvents = events.filter(({ event, purchase }) => {
            const eventDate = new Date(event.date);
            return eventDate > currentDateAndTime && purchase.status === "active"
        });
        const completedEvents = events.filter(({ event, purchase }) => {
            const eventDate = new Date(event.date);
            return eventDate <= currentDateAndTime && purchase.status === "active"
        });
        const cancelledEvents = events.filter(({ purchase }) => purchase.status === "cancelled")

        return res.json({ 
            upcoming: upcomingEvents, 
            completed: completedEvents, 
            cancelled: cancelledEvents,
        })
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.getPurchase = async (req, res) => {
    const id = req.body.purchase_id;
    console.log(id);
    try {
        const event = await Purchase.findOne({ where: { id } });
        return res.send(event)
    } catch (error) {
        return res.send('sorry an error occured')
    }

}

module.exports.createPurchase = async (req, res) => {
    const { event_id } = req.body
    const user_id = req.body.user_id || req.session?.user_id
    const username =  req.body.username || req.session.user?.username
    const profile_pic = req.body.profile_pic || req.session.user?.profile_pic

    const { email, phone_number, host_id, seats, amount, purchase_method } = req.body
    
    console.log("user_id is", user_id)
    const id = uniqid();
    try {
        const purchase = await Purchase.findOne({ where: { user_id, event_id } })
        if(purchase) return res.send(purchase)

        const [newPurchase, _] = await Promise.all([
            await Purchase.create({ id, user_id, username, profile_pic, event_id, email, host_id, phone_number, seats, amount }),
            await Event.increment({ sold: 1 }, { where: { id: event_id } }),
            purchase_method === "heat" ? await User.decrement('heat', { by: amount + 2, where: { id: user_id } }) :
            await User.increment('heat', { by: 2, where: { id: user_id } })
        ])
        return res.send(newPurchase)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}
module.exports.makePayment = async (req, res) => {
    const https = require('https')

    const { email, amount } = req.body;

    const params = JSON.stringify({
        "email": email,
        "amount": amount
    })

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    }

    const reqPay = https.request(options,
        resPay => {
            let data = ''

            resPay.on('data', (chunk) => {
                data += chunk
            });

            resPay.on('end', () => {
                console.log(JSON.parse(data))
                res.send(JSON.parse(data))
            })
        }).on('error', error => {
            console.error(error)
        })

    reqPay.write(params)
    reqPay.end()

};


module.exports.paymentVerification = async (req, res) => {
    const https = require('https')
    // 0tr5rj4j5c
    const { reference } = req.body;
    const path = `/transaction/verify/${reference}`
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    }

    let result = https.get(options, response => {
        let data = ''

        response.on('data', (chunk) => {
            data += chunk
        });

        response.on('end', () => {
            console.log(JSON.parse(data))
            res.send(JSON.parse(data))
        })
    }).on('error', error => {
        console.error(error)
    })
};

exports.getattendees = async (req, res) => {
    const { event_id } = req.body
    try {
        const attendee = await Purchase.findAll({
            where: {
                event_id
            },

            attributes: ['id', 'username', 'profile_pic']

        })
        res.status(200).json({ attendee, attendeeCount: attendee.length })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

module.exports.purchaseList = async (req, res) => {
    const event_id = req.session.event_id || req.body.event_id;
    // console.log(req.session)
    try {
        const event = await Purchase.findAll({ where: { event_id } });
        return res.send(event)
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.cancelPurchase = async (req, res) => {
    const { user_id, event_id } = req.body;

    try {
        await Purchase.update({ status: "cancelled" }, {
            where: {
                user_id,
                event_id
            }
        })
        return res.status(200).json({ message: "Event Cancelled" });
    } 
    catch (err) {
        return res.status(200).json({ message: err })
    }
}

module.exports.getHostBalance = async (req, res) => {
    const { host_id } = req.body;
    try {
        const [withdrawAmount, purchases, alreadyRequestedAmount] = await Promise.all([
            await Purchase.sum('amount', {
                where: {
                    host_id,
                    status: "active"
                },
            }),
            await Purchase.findAll({
                where: {
                    host_id,
                    status: "active"
                },
                group: 'createdAt'
            }),
            await Withdrawal.sum('amount', {
                where: {
                    user_id: host_id,
                }
            })
        ])

        const hostBalance = (withdrawAmount ?? 0) - (alreadyRequestedAmount ?? 0)
        return res.status(200).json({ withdraw_amount: hostBalance, purchases: purchases })
    }
    catch (err) {
        return res.status(500).send(err)
    }
}

