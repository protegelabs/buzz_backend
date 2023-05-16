const { Friend, Event, EventCategory, Purchase,Follow } = require('../models/models')
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
    const categoriesCount = {
        party: 0,
        convention: 0,
        trade: 0,
        seminar: 0,
        meeting: 0,
        business: 0,
        wedding: 0,
        corporation: 0,
        exhibition: 0,
        festival: 0,
        fair: 0,
        parade: 0,
        food_festival: 0,
    }


    try {
        const event = await Event.findAll({
            where: {
                host_id: id
            },
            attributes: ['id']
        })
        
        const categories = await Promise.all(event.map(async ({ id }) => {
            const t = await EventCategory.findOne({
                where: {
                    event_id: id
                }
            })
            return t
        }))


        categories.forEach(element => {
            for (const minicat in element.dataValues) {
                for (const cat in categoriesCount) {
                    if (cat === minicat) {
                        categoriesCount[cat] = categoriesCount[cat] + element.dataValues[minicat]
                    }
                }
            }
        })
        return [event,categories,categoriesCount]
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
                return {[id]:ticket}
            })
        )
        const followcount = await Follow.count({where:{host:id}})
     
        const total = arr.reduce((a, b) => a + b, 0)
        // console.log(purchaseCount)
        return {purchaseCount,totalSold:total,followcount}
    } catch (error) {
        console.log({ message: error.message })
    }
  



}