const { Story, Friend } = require('../models/models');
const { Op } = require('sequelize');
const uniqid = require('uniqid');
const { getFriends } = require('../utils/getFriends')



exports.getFriendStories = async (req, res) => {
  const { id } = req.body
  try {

    const storylist = []
    const [friendRecieved, friendSent] = await getFriends(id)

    const t = friendRecieved.map(async ({ friend_id }) => {

      const friendStory = await Story.findAll({
        where: { user_id: friend_id },
      })
      if (friendStory.length > 0) {
        storylist.push(friendStory)
        //  console.log(friendStory)
        return friendStory
      } else {
        return null
      }


    })

    const b = friendSent.map(async ({ user_id }) => {
      const friendStory = await Story.findAll({
        where: { user_id: user_id },
      })

      if (friendStory.length > 0) {
        storylist.push(friendStory)
        //  console.log(friendStory)
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
    if (story){
      story.destroy()
      await story.save()
      return res.send(story)

    }else{
      return res.send({message:"story not found"})
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
exports.getUserStories = async (req, res) => {
  const { user_id } = req.body
  try {
    const userstory = await Story.findAll({
      where: {
        user_id: user_id
      }
    })
    res.send(userstory)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
