const session = require('express-session');
const { Event, Review, User, Purchase, EventCategory, Ticket, Blocked } = require('../models/models')
const { Op, where } = require('sequelize')
const uniqid = require('uniqid')
const { filterOutBlockedHosts } = require('../utils/blocked')
const { sequelize } = require('../config/sequelize')
const Url = require('url');

require("dotenv")
const { makePayment } = require("./purchases")


module.exports.getAllEvents = async (req, res) => {
    const user_id = req.body.user_id
    const events = await Event.findAll();
    // console.log('events is', events)
    const filteredEvents = await filterOutBlockedHosts(user_id, events)
    return res.send({ filteredEvents, events })
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

        const [host, attendance_count, category] = await Promise.all([
            await User.findByPk(event.host_id, {
                attributes: ['name', 'id', 'profile_pic', 'bio']
            }),
            await Purchase.count({ where: { event_id: event.id } }),
            await EventCategory.findAll({ where: { event_id: event.id } })
        ])
        // return res.send(event)
        return res.send({ event, reviews, host, attendance_count, category })
    } catch (error) {
        return res.send('sorry an error occured')
    }
}

module.exports.createEvent = async (req, res) => {
    const {
        name, price,
        location, longitude,
        latitude, date, discount,
        is_active, event_pic,
        tickets, timeStart,
        timeEnd, categories,
        description,
        promotional_code
    } = req.body
    const host_id = req.session.user_id || req.body.host_id
    const event_id = uniqid();
    try {
        const newEvent = await Event.create({
            id: event_id, name,
            price, location,
            longitude, latitude,
            date, host_id,
            discount, is_active,
            event_pic, timeStart,
            timeEnd, description, promotional_code
        })
        const newcat = categories.map((category) => {
            return { [category]: 1 }
        })

        const eventCategory = await EventCategory.create({
            id: uniqid(),
            event_id, name,
            ...Object.assign({}, ...newcat)
        });

        await Promise.all(tickets.map(async (item) => {
            return await Ticket.create({
                id: uniqid(),
                event_id,
                ...item
            })
        }))
        return res.send(newEvent)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


module.exports.editEvent = async (req, res) => {
    const { name, price, location, longitude, latitude, date, host_id, discount, is_active, event_pic, tickets } = req.body
    const id = req.body.event_id || req.params.event_id;


    try {
        const newEvent = await Event.update({ ...req.body }, {
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
        const event = await Event.findAll({
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
};

exports.closestEvent = async (req, res) => {
    const parsedurl = Url.parse(req.url, true)
    const { user_id, longitude, latitude, range } = parsedurl.query

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
        const filteredEvents = await filterOutBlockedHosts(user_id, nearest)
        return res.status(200).json(filteredEvents)

    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: err.message })
    }
}

exports.TrendingEvents = async (req, res) => {
    try {
        const user_id = req.body.user_id
        categoryList = ["Music", "Tech", "Food", "Movies", "Workshops", "Art", "All"]
        const trendingEventsByPurchases1 = await Event.findAll({
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
            where: {
                date: {
                    [Op.gte]: new Date()
                },
            },
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
                            Movies: 1,
                            All: 1,
                            Workshops: 1,
                            Sports: 1
                        }
                    },
                    attributes: [...categoryList],
                },
            ],
            order: [[sequelize.literal('favoriteCount'), 'DESC']],
            where: {
                date: {
                    [Op.gte]: new Date()
                },
            },
            limit: 100
            // You can adjust the limit as per your requirements
        });

        const eventsWithCategories1 = trendingEventsByFavorites.map((event) => {
            const eventCategories = categoryList.filter((category) =>

                event.dataValues.event_category.dataValues[category] === 1
            );

            return {
                ...event.toJSON(),
                event_category: eventCategories,
            };
        });
        const [trendingEventsByPurchases, eventsWithCategories] = await Promise.all([trendingEventsByPurchases1, eventsWithCategories1].map(async (events) => {
            return await filterOutBlockedHosts(user_id, events)
        }))



        res.json({
            trendingEventsByPurchases,
            eventsWithCategories,

        });
    } catch (error) {
        console.error('Error retrieving trending events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const returnDifferentCategories = (tags) => {
    if (tags !== typeof Array) return;

    if (tags.includes("All")) return;

    return {
        model: EventCategory,
        where: {
            [Op.or]: tags.reduce((acc, category) => {
                acc[category] = 1;
                return acc;
            }, {}),
        }
    }

}
exports.filterEvents = async (req, res) => {
    const { user_id, tags, location, price_range } = req.body
    try {
        const Events = await Event.findAll({
            where: {
                [Op.or]: [
                    {
                        price: {
                            [Op.between]: price_range,

                        }
                    },
                    {
                        location: {
                            [Op.like]: `%${location}%`
                        }
                    },
                ]
            },
            include: returnDifferentCategories(tags)
        })

        const eventsWithCategories1 = Events.map((event) => {
            const eventCategories = tags?.filter((category) =>
                event?.dataValues.event_category?.dataValues[category] === 1
            );

            return {
                ...event.toJSON(),
                event_category: eventCategories,
            };
        });
        const eventsWithCategories = await filterOutBlockedHosts(user_id, eventsWithCategories1)
        return res.send(eventsWithCategories)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.SearchByTags = async (req, res) => {
    try {
        const { user_id, categories } = req.body;

        // Convert the categories parameter to an array if it's a string
        let categoryList = Array.isArray(categories) ? categories : [categories];

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



        const filteredEvents = await filterOutBlockedHosts(user_id, eventsWithCategories)
        return res.send(filteredEvents)

        // Find events with matching event categories

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



exports.Populate = async (req, res) => {

    try {


        const event = await Event.findAll()


        const pop = await Promise.all(event.map(async ({ id }) => {
            const categories = ["Music", "Tech", "Food", "Movies", "Workshops", "Art"];

            // Select one random category
            const selectedCategory = getRandomCategory(categories);
            const selectedCategory2 = getRandomCategory(categories)
            // Create the newcat array with the selected category
            const newcat = [{ [selectedCategory]: 1, [selectedCategory2]: 1 }];

            function getRandomCategory(array) {
                const randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }


            return await EventCategory.create({
                id: uniqid(),
                event_id: id,
                ...Object.assign({}, ...newcat)
            })
        }))
        // await EventCategory.destroy({ where: {} })
        return res.send(pop)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

module.exports.getFeaturedEvents = async (req, res) => {

    const { user_age, user_location, limit } = req.body;
    try {
        const featuredEvents1 = await Event.findAll({
            where: {
                featured: true,
                date: {
                    [Op.gte]: new Date()
                },
                [Op.or]: [
                    {
                        [Op.and]: [
                            {
                                target_age_lower: {
                                    [Op.gte]: user_age,
                                },
                            },
                            {
                                target_age_upper: {
                                    [Op.lte]: user_age,
                                }
                            }
                        ]
                    },
                    {
                        location: {
                            [Op.like]: `%${user_location}%`
                        }
                    }
                ]
            },
            limit: limit
        })

        if (featuredEvents1.length >= 10) {

            return res.send(featuredEvents1)
        }

        const additionalLength = 10 - featuredEvents1.length
        const additionalEvents1 = await Event.findAll({
            where: {
                location: {
                    [Op.like]: `%${user_location}%`
                },
                date: {
                    [Op.gte]: new Date()
                },
            },
            limit: additionalLength
        })
        const [featuredEvents, additionalEvents] = await Promise.all([featuredEvents1, additionalEvents1].map(async (events) => {
            return await filterOutBlockedHosts(user_id, events)
        }))
        return res.send([...featuredEvents, ...additionalEvents])

    } catch (e) {
        return res.status(500).json({ message: e })
    }
}

module.exports.audienceReach = async (req, res) => {
    const { location, age_range } = req.body;
    const { upper, lower } = age_range;

    const currentDay = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    try {
        const users = await User.count({
            where: {
                location: {
                    [Op.like]: `%${location}%`
                },
                dob: {
                    [Op.lte]: new Date(currentYear + lower, currentMonth, currentDay),
                    [Op.gte]: new Date(currentYear - upper, currentMonth, currentDay)
                }
            }
        })
        return res.json({ target_reach: users })
    } catch (e) {
        return res.status(500).json({ message: e })
    }

}

module.exports.promoteEvent = async (req, res) => {

    const { event_id, age_range, start_date, end_date } = req.body;
    const { upper, lower } = age_range;

    try {
        //Doing this here incase verify doesn't work
        await Event.update({
            featured: false,
            target_age_lower: lower,
            target_age_upper: upper,
            featured_start_date: start_date,
            featured_ending_date: end_date,
            //may make default ending day after 7 days
        }, {
            where: {
                id: event_id,
            }
        })
        return res.json({ message: "Promoted Successfully" })
    }
    catch (e) {
        return res.status(500).json({ message: e })
    }

}






