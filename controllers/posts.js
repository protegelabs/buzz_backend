const session = require('express-session');
const { Post } = require('../models/models')
const { Op, where } = require('sequelize')
const uniqid = require('uniqid')



module.exports.getAllPosts = async (req, res) => {
    const post = await Post.findAll();
    return res.send(post)
}

module.exports.getHostPosts = async (req, res) => {
    const host = req.session.user_id || req.body.id;
    console.log(req.session)
    try {
        const post = await Post.findAll({ where: { host } });
        return res.send(post)
    } catch (error) {
        return res.send('sorry an error occured')
    }

}

module.exports.getPost = async (req, res) => {
    const id = req.query.post_id || req.body.post_id;
    console.log(id);
    try {
        const post = await Post.findOne({ where: { id } });
        return res.send(post)
    } catch (error) {
        return res.send('sorry an error occured')
    }

}

module.exports.createPost = async (req, res) => {
    const { content, pic1, pic2, pic3, pic4 } = req.body
    const host = req.session.user_id || req.body.user_id
    const id = uniqid();
    try {
        const newPost = await Post.create({ id, host_id, content, pic1, pic2, pic3, pic4 })
        return res.send(newPost)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


module.exports.editPost = async (req, res) => {
    const { host_id, content, pic1, pic2, pic3, pic4 } = req.body
    const id = req.body.post_id || req.params.post_id;
    try {
        const newPost = await Post.update({ host_id, content, pic1, pic2, pic3, pic4 }, {
            where: { id }
        });
        return res.send(newPost)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

