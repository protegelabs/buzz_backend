const uniqid = require('uniqid');
const { Favourite, Event,EventCategory } = require('../models/models');

exports.createFav = async (req, res) => {
    const { event_id } = req.body
    const user_id = req.body.user_id || req.session.user.id
    const id = uniqid()

    const existingFavourite = await Favourite.findOne({
        where: { event_id, user_id }
    })
    if(existingFavourite) return res.json({ error: "Already exists in Favourites" })
    
    try {
        const fav = await Favourite.create({ id, event_id, user_id })
        return res.status(200).json({ fav })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

exports.getFavourites = async (req, res) => {
    const user_id = req.body.user_id || req.session.user_id
    categoryList = ["Music", "Tech", "Food", "Movies", "Workshops", "Art", "All"]

    try {
        const favourites = await Favourite.findAll({ 
            where: { user_id },
            attributes: ['event_id'] 
        });
        const events = await Promise.all(favourites.map(async ({ event_id }) => {
            const event = await Event.findByPk(event_id, {
                attributes: {
                    exclude: ["host_id", 'longitude', 'latitude', 'sold']
                },
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
                                Workshops: 1
                            }
                        },
                        attributes: [...categoryList],
                    },
                ],
            });
            return event
        }))
        const eventsWithCategories = events.map((event) => {
            const eventCategories = categoryList.filter((category) =>

                event.dataValues.event_category.dataValues[category] === 1
            );

            return {
                ...event.toJSON(),
                event_category: eventCategories,
            };
        });
        return res.status(200).json({ fav: eventsWithCategories })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}
exports.getEventFavorite = async (req, res) => {
    const { event_id } = req.body
    try {
        //const fav = await Favourite.findAll({ where: { event_id } })
        const { rows, count } = await Favourite.findAndCountAll({ where: { event_id } })
        res.status(200).json({ fav: rows, favnum: count })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.deleteFav = async (req, res) => {
    const { event_id } = req.body
    const user_id = req.body.user_id || req.session.user_id
    try {
        const fav = await Favourite.destroy({ where: { event_id, user_id } })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}