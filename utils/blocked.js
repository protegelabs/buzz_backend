const {Blocked} = require('../models/models')

exports.filterOutBlockedUsers= async (user_id,events)=>{
    const blockedArray = await Blocked.findAll({ where: { user: user_id }, attributes: ["blocked_user"] })
    const blockedUserIds = blockedArray.map(user => user.blocked_user);
    const eventWithoutBlock = events.filter(({ host_id }) => { return !blockedUserIds.includes(host_id) })
    return eventWithoutBlock
}