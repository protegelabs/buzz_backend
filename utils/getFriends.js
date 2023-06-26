const { Friend, Event, EventCategory, Purchase, Follow } = require('../models/models')
const { Op } = require('sequelize')

exports.getFriends = async (id) => {
    try {
        const friendRecieved = await Friend.findAll({
            where: {
                [Op.and]: [
                    { user_id: id },
                    { status: 'accepted' }
                ]
            },
            attributes: ['friend_id']
        });
        const friendSent = await Friend.findAll({
            where: {
                [Op.and]: [
                    { friend_id: id },
                    { status: 'accepted' }
                ]
            },
            attributes: ['user_id']
        });
        return Promise.all([friendRecieved, friendSent])


    } catch (err) {
        console.log({ message: err.message })
    }
}

exports.getHostEvent = async (id) => {
    let categories = []
    
    try {
        const event = await Event.findAll({
            where: {
                host_id: id
            },
            attributes: ['id']
        })

        if(event.length < 0) return [event, categories]

        categories = await Promise.all(
            event.map(async ({ id }) => {
            const t = await EventCategory.findOne({
                where: {
                    event_id: id
                }
            })
            return t
        }))

        if(categories.length < 0) return [event, categories]

        const categoriesCount = {
            Music: categories.filter((category) => category.Art === 1).length,
            Art: categories.filter((category) => category.Art === 1).length,
            Workshop: categories.filter((category) => category.Workshop=== 1).length,
            Movies: categories.filter((category) => category.Movies === 1).length,
            Food: categories.filter((category) => category.Food === 1).length,
            Tech: categories.filter((category) => category.Tech === 1).length,
            Sports: categories.filter((category) => category.Sports === 1).length
        }


        return [event, categories, categoriesCount]
    } catch (error) {
        console.log({ message: error.message })

    }

}

exports.getPurchaseFollow = async (id, events) => {
    /**get the events
     * loop through and count for te tickets each event sold
     * find total ticket sold
     */
    const arr = []
    try {
        const purchaseCount = await Promise.all(
            events.map(async ({ id }) => {
                const ticket = await Purchase.count(
                    { where: { event_id: id } }
                )

                arr.push(ticket)
                return { [id]: ticket }
            })
        )
        const followcount = await Follow.count({ where: { host: id } })

        const total = arr.reduce((a, b) => a + b, 0)
        // console.log(purchaseCount)
        return { purchaseCount, totalSold: total, followcount }
    } catch (error) {
        console.log({ message: error.message })
    }




}
exports.has24HoursPassed = (lastDate) => {
    // Calculate the current date and time
    const currentDate = new Date();
    const lastDate1 = new Date(lastDate)
    // Calculate the difference in milliseconds between the current date and the last date
    const timeDiff = currentDate - lastDate1;

    // Convert milliseconds to hours
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));

    // Check if 24 hours have passed
    return hoursDiff >= 24;
}