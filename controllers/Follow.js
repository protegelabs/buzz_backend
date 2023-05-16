const uniqid = require('uniqid');
const { Follow } = require('../models/models');
exports.createFollow = async (req, res) => {
    const { host, user_id } = req.body
    try {
        const fav = await Follow.create({ id: uniqid(), host, follower:user_id })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.getFollows = async (req, res) => {
    const { user_id } = req.body
    try {
        const fav = await Follow.findAll({ where: { follower:user_id } })
        res.status(200).json({ fav })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}
exports.getHostFollow= async(req,res)=>{
     const{host }= req.body
     try{
        const fav = await Follow.findAll({ where: { host } })
        res.status(200).json({ fav,followcount:fav.length })
     }catch(err){
         res.status(400).json({message:err.message})
     }
}

exports.unFollow= async(req,res)=>{
     const{user_id,host }= req.body
     try{
        const fav = await Follow.destroy({ where: { host,follower:user_id } })
        res.status(200).json({ fav})
     }catch(err){
         res.status(400).json({message:err.message})
     }
}