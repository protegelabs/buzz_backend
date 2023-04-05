const { Friends } = require('../models/models')

const getFriends = async (id) => {
    try {
        const friendRecieved = await Friends.findAll({
            where: {
                [Op.and]: [
                    { user_id: id },
                    { status: 'accepted' }
                ]
            },
            attributes: ['friend_id']
        });
        const friendSent = await Friends.findAll({
            where: {
                [Op.and]: [
                    { frined_id: id },
                    { status: 'accepted' }
                ]
            },
            attributes:['user_id']
        });

       return Promise.all([friendRecieved,friendSent])


    } catch (err) {
        console.log({ message: err.message })
    }
}