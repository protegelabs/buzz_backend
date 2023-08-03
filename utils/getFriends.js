const { Friend, Event, EventCategory, Purchase, Follow, Blocked } = require('../models/models')
const { Op } = require('sequelize')

exports.getFriends = async (id) => {
    try {
        const blockedFriends = await Blocked.findAll({
            where: {
              user: id
            }
        })
      
        const blockedFriendsList = blockedFriends.map(({ blocked_user }) => (blocked_user))
      
        const friendRecieved = await Friend.findAll({
            where: {
                [Op.and]: [
                    { user_id: id },
                    { status: 'accepted' },
                    {
                        friend_id: {
                            [Op.notIn]: blockedFriendsList,
                        }
                    }
                ]
            },
            attributes: ['friend_id']
        });
        const friendSent = await Friend.findAll({
            where: {
                [Op.and]: [
                    { friend_id: id },
                    { status: 'accepted' },
                    {
                        user_id: {
                            [Op.notIn]: blockedFriendsList,
                        }
                    }

                ]
            },
            attributes: ['user_id']
        });
        return await Promise.all([friendRecieved, friendSent])


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

        const category = await Promise.all(
            event.map(async ({ id }) => {
            const t = await EventCategory.findOne({
                where: {
                    event_id: id
                }
            })
            return t
        }))

        if(category.length === 0) return [event, category]

        
        /*
        const categoriesCount = {
            Music: category.filter((category) => category?.Music === 1).length,
            Art: category.filter((category) => category.Art && category?.Art === 1).length,
            Workshop: category.filter((category) => category?.Workshop=== 1).length,
            Movies: category.filter((category) => category?.Movies === 1).length,
            Food: category.filter((category) => category?.Food === 1).length,
            Tech: category.filter((category) => category?.Tech === 1).length,
            Sports: category.filter((category) => category?.Sports === 1).length
        }*/

        console.log(category)
        return [event, category,]
    } catch (error) {
        console.log({ message: error.message })

    }

}

exports.getPurchaseFollow = async (host_id) => {
    /**get the events
     * loop through and count for te tickets each event sold
     * find total ticket sold
     */
    const arr = []
    try {
        const firstDayOfMonth = 1;
        const today = new Date().getDate()
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const [
            purchaseCountForCurrMonth, 
            purchaseCountForPrevMonth,
            followersThisMonth,
            followersLastMonth,

            followcount,
            purchaseCount,
            soldToday
        ] = await Promise.all([
            await Purchase.count(
                { 
                    where: { 
                        [Op.and]: [
                            { host_id: host_id },
                            { 
                                host_id: {
                                    [Op.not]: null
                                } 
                            }
                        ],
                        createdAt: {
                            [Op.gte]: new Date(currentYear, currentMonth, firstDayOfMonth)
                        }                         
                    } 
                }
            ),
            await Purchase.count(
                { 
                    where: { 
                        [Op.and]: [
                            { host_id: host_id },
                            { 
                                host_id: {
                                    [Op.not]: null
                                } 
                            }
                        ],
                        createdAt: {
                            [Op.lt]: new Date(currentYear, currentMonth, firstDayOfMonth),
                            [Op.gte]: new Date(currentYear, currentMonth-1, firstDayOfMonth)
                        }                         
                    } 
                }
            ),
            await Follow.count({
                where: { 
                    host: host_id,
                    createdAt: {
                        [Op.gte]: new Date(currentYear, currentMonth, firstDayOfMonth).setHours(0, 0, 0, 0)
                    }
                }
            }),
            await Follow.count({
                where: { 
                    host: host_id,
                    createdAt: {
                        [Op.lt]: new Date(currentYear, currentMonth, firstDayOfMonth).setHours(0, 0, 0, 0),
                        [Op.gte]: new Date(currentYear, currentMonth-1, firstDayOfMonth)
                    }
                }
            }),
            await Follow.count({ where: { host: host_id } }),
            await Purchase.count({ 
                where: { 
                    [Op.and]: [
                        { host_id: host_id },
                        { 
                            host_id: {
                                [Op.not]: null
                            } 
                        }
                    ]
                }
            }),
            await Purchase.count({ 
                where: { 
                    host_id,  
                    createdAt: {
                        [Op.gt]: new Date().setHours(0, 0, 0, 0),
                        [Op.lte]: new Date()
                    }
                }
            })
        ])

        const ticketSalesChange = purchaseCountForCurrMonth/(purchaseCountForPrevMonth || 1);

        console.log(purchaseCountForPrevMonth, "last monnth")
        console.log(purchaseCountForCurrMonth, "this month")

        const followersChange = (followersThisMonth ?? 0) / (followersLastMonth || 1);

        const total = arr.reduce((a, b) => a + b, 0)
        // console.log(purchaseCount)
        return { 
            purchase_count_per_event: purchaseCount ?? 0, 

            total_sold: total ?? 0, 
            total_sold_difference: (ticketSalesChange > 3 ? 3 : ticketSalesChange) ?? 0,

            follow_count: followcount ?? 0,
            followers_difference: (followersChange > 3 ? 3 : followersChange) ?? 0,

            sold_today: soldToday ?? 0
        }
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