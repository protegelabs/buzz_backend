const { Story, Friend, User, Blocked } = require('../models/models');
const { Op } = require('sequelize');
const uniqid = require('uniqid');
const { getFriends } = require('../utils/getFriends')
const moment = require('moment');
const { filterBlockedUsers } = require('../utils/blocked')



exports.getFriendStories = async (req, res) => {
  const { id } = req.query
  try {
    const twentyFourHoursAgo = moment().subtract(24, 'hours');
    const storylist = []
    const friendIdList = []
    const [friendRecieved, friendSent] = await getFriends(id);

    const t = friendRecieved.map(async ({ friend_id }) => {

      const [user, friendStory] = await Promise.all([
        await User.findByPk(friend_id, {
          attributes: ['username', 'name', 'profile_pic', 'id']
        }),
        await Story.findAll({
          where: {
            user_id: friend_id,
            createdAt: {
              [Op.gte]: twentyFourHoursAgo.toDate(),
            },
          },
        })
      ])

      if (friendStory.length > 0) {
        storylist.push({ user, friendStory })
        return friendStory
      } else {
        return null
      }


    })

    const b = friendSent.map(async ({ user_id }) => {

      const [user, friendStory] = await Promise.all([
        await User.findByPk(user_id, {
          attributes: ['username', 'name', 'profile_pic', 'id']
        }),
        await Story.findAll({
          where: {
            user_id: user_id,
            createdAt: {
              [Op.gte]: twentyFourHoursAgo.toDate(),
            },
          },
        })
      ])

      if (friendStory.length > 0) {
        storylist.push({ user, friendStory })
        return friendStory
      } else {
        return null
      }
    })
    await Promise.all([...t, ...b])
    res.send(storylist)

  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.uploadstories = async (req, res) => {
  try {
    const id = uniqid()
    const story = await Story.create({
      id, ...req.body
    })

    res.send(story)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteStory = async (req, res) => {
  const { id, user_id } = req.body

  try {
    const story = await Story.findOne({ where: { id } })
    console.log(story)
    if (story) {
      story.destroy()
      await story.save()
      return res.send("done")

    } else {
      return res.send({ message: "story not found" })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.getUserStories = async (req, res) => {
  const { user_id } = req.body;
  try {
    const twentyFourHoursAgo = moment().subtract(24, 'hours');

    const userstory = await Story.findAll({
      where: {
        user_id: user_id,
        createdAt: {
          [Op.gte]: twentyFourHoursAgo.toDate(),
        },
      },
    });

    res.send(userstory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
