const { Blocked } = require('../models/models')

exports.filterOutBlockedHosts = async (user_id, events) => {
    const blockedArray = await Blocked.findAll({ where: { user: user_id }, attributes: ["blocked_user"] })
    
    const blockedUserIds = blockedArray.map(user => user.blocked_user);
    console.log(user_id, blockedUserIds)
    const eventsWithoutBlocked = events.filter(({ host_id }) => { return !blockedUserIds.includes(host_id) })
    return eventsWithoutBlocked
}

exports.filterBlockedUsers = async (user_id, stories) => {
    const blockedArray = await Blocked.findAll({ where: { user: user_id }, attributes: ["blocked_user"] })
    const blockedUserIds = blockedArray.map(user => user.blocked_user);
    console.log(user_id, blockedUserIds)
    const storiesWithoutBlocked = stories.filter(({ user_id }) => { return !blockedUserIds.includes(user_id) })
    return storiesWithoutBlocked
}