const { Story,Friend} = require('../models/models');
const { Op } = require('sequelize');
const uniqid = require('uniqid');
const {getFriends} = require('../utils/getFriends')



exports.getStories= async(req,res)=>{
     const{id}= req.body
     try{
       const [friendRecieved,friendSent] = getFriends(id)
       console.log(friendRecieved)
   
     }catch(err){
         res.status(400).json({message:err.message})
     }
}
