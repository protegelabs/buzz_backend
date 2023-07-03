const session = require('express-session');
const { Event, Review, User, Purchase, EventCategory } = require('../models/models')
const { Op, where } = require('sequelize')
const uniqid = require('uniqid')
const { sequelize } = require('../config/sequelize')
const Url = require('url');



module.exports.getAllEvents = async (req, res) => {
    const event = await Event.findAll();
    return res.send(event)
}

module.exports.getHostEvents = async (req, res) => {
    const host_id = req.session.user_id || req.body.user_id;
    console.log(req.session)
    try {
        const event = await Event.findAll({ where: { host_id } });
        return res.send(event)
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.getEvent = async (req, res) => {
    const id = req.query.event_id || req.body.event_id;
    console.log(id);
    try {
        const [event, reviews] = await Promise.all([
            await Event.findByPk(id),
            await Review.findAll({ where: { event_id: id } })
        ])

        const [host, attendance_count,category] = await Promise.all([
            await User.findByPk(event.host_id, {
                attributes: ['name', 'id', 'profile_pic']
            }),
            await Purchase.count({ where: { event_id: event.id } }),
            await EventCategory.findAll({where:{event_id:event.id}})
        ])
        // return res.send(event)
        return res.send({ event, reviews, host, attendance_count ,category})
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.createEvent = async (req, res) => {
    const { name, price, location, longitude, latitude, date, discount, is_active, event_pic, tickets, timeStart, timeEnd, categories } = req.body
    const host_id = req.session.user_id || req.body.host_id
    const event_id = uniqid();
    try {
        const newEvent = await Event.create({ id: event_id, name, price, location, longitude, latitude, date, host_id, discount, is_active, event_pic, tickets, timeStart, timeEnd })
        const newcat = categories.map((category) => {
            return { [category]: 1 }
        })

        const eventCategory = await EventCategory.create({
            id: uniqid(),
            event_id,
            ...Object.assign({}, ...newcat)
        });
        return res.send(newEvent)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


module.exports.editEvent = async (req, res) => {
    const { name, price, location, longitude, latitude, date, host_id, discount, is_active, event_pic, tickets } = req.body
    const id = req.body.event_id || req.params.event_id;
    try {
        const newEvent = await Event.update({ name, price, location, longitude, latitude, date, host_id, discount, is_active, event_pic, tickets }, {
            where: { id }
        });
        return res.send(newEvent)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


exports.searchEvent = async (req, res) => {
    const { event_name, ...rest } = req.body;
    try {
        return await Event.findAll({
            where: {
                name: {
                    [Op.like]: `%${event_name}%`
                },
                ...rest
            }
        })
            .then((data) => {
                return res.json({ events: data })
            })

    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
}
exports.closestEvent = async (req, res) => {
    const parsedurl = Url.parse(req.url, true)
    const { id, longitude, latitude, range } = parsedurl.query

    try {
        const constant = 6371
        const haversine = `(
            ${constant} * acos(
                cos(radians(${latitude}))
                * cos(radians(latitude))
                * cos(radians(longitude) - radians(${longitude}))
                + sin(radians(${latitude})) * sin(radians(latitude))
            )
        )`;
        const distance = range || 50; // 50km
        const nearest = await Event.scope({
            method: ['distance', latitude, longitude, distance]
        })
            .findAll({
                attributes: [
                    'id',
                    'name',
                    'price',
                    'location',
                    'longitude',
                    'latitude',
                    'date',
                    'host_id',
                    'discount',
                    'event_pic',
                    'tickets'
                ],
                where: {
                    [Op.and]: [
                        sequelize.where(sequelize.literal(haversine), '<=', distance),

                    ]
                },
                order: sequelize.col('distance'),
                limit: 5
            });
        return res.status(200).json(nearest)

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}

exports.TrendingEvents = async (req, res) => {
    try {
        categoryList =[ "Music", "Art","Tech", "Food","Movies"]
        const trendingEventsByPurchases = await Event.findAll({
            attributes: [
                'id',
                'name',
                'price',
                'location',
                'date',
                'event_pic',
                'timeStart',
                'timeEnd',
                [
                    sequelize.literal(`(
              SELECT COUNT(*)
              FROM purchase
              WHERE purchase.event_id = Event.id
            )`),
                    'purchaseCount'
                ]
            ],
            order: [[sequelize.literal('purchaseCount'), 'DESC']],
            limit: 10 // You can adjust the limit as per your requirements
        });

        // Retrieve the top trending events based on the number of favorites
        const trendingEventsByFavorites = await Event.findAll({
            attributes: [
                'id',
                'name',
                'price',
                'location',
                'date',
                'event_pic',
                'timeStart',
                'timeEnd',
                [
                    sequelize.literal(`(
              SELECT COUNT(*)
              FROM favourites
              WHERE favourites.event_id = Event.id
            )`),
                    'favoriteCount'
                ]
            ],
            include: [
                {
                    model: EventCategory,
                    where: {
                        [Op.or]: {
                            Music: 1,
                            Art: 1,
                            Tech: 1,
                            Food: 1,
                            Movies: 1
                        }
                    },
                    attributes: [...categoryList],
                },
            ],
            order: [[sequelize.literal('favoriteCount'), 'DESC']],
            limit:100
           // You can adjust the limit as per your requirements
        });
        const eventsWithCategories = trendingEventsByFavorites.map((event) => {
            const eventCategories = categoryList.filter((category) =>

                event.dataValues.event_category.dataValues[category] === 1
            );

            return {
                ...event.toJSON(),
                event_category: eventCategories,
            };
        });




        res.json({
            trendingEventsByPurchases,
            eventsWithCategories,

        });
    } catch (error) {
        console.error('Error retrieving trending events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.filterEvents = async (req, res) => {
    const { tags, location, TicketPriceRange, EventLocationRange, } = req.body
    try {
        const newEvent = await Event.create({})
        return res.send(newEvent)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.SearchByTags = async (req, res) => {
    try {
        const { categories } = req.body;

        // Convert the categories parameter to an array if it's a string
        let categoryList = Array.isArray(categories) ? categories : [categories];
        if (categoryList.includes("All")) {
             categoryList =[ "Music", "Art","Tech", "Food","Movies"] // 2nd parameter means remove one item only
            const events = await Event.findAll({
                include: [
                    {
                        model: EventCategory,
                        where: {
                            [Op.or]: {
                                Music: 1,
                                Art: 1,
                                Tech: 1,
                                Food: 1,
                                Movies: 1
                            }
                        },
                        attributes: [...categoryList],
                    },
                ],
            });
            const eventsWithCategories = events.map((event) => {
                const eventCategories = categoryList.filter((category) =>

                    event.dataValues.event_category.dataValues[category] === 1
                );

                return {
                    ...event.toJSON(),
                    event_category: eventCategories,
                };
            });
            res.json(eventsWithCategories);
        } else {
            const events = await Event.findAll({
                include: [
                    {
                        model: EventCategory,
                        where: {
                            [Op.or]: categoryList.reduce((acc, category) => {
                                acc[category] = 1;
                                return acc;
                            }, {}),
                        },
                        attributes: [...categoryList],
                    },
                ],
            });


            const eventsWithCategories = events.map((event) => {
                const eventCategories = categoryList.filter((category) =>
                    event.dataValues.event_category.dataValues[category] === 1
                );

                return {
                    ...event.toJSON(),
                    event_category: eventCategories,
                };
            });



            res.json(eventsWithCategories);
        }
        // Find events with matching event categories

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};











