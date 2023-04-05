const { Story,Friend} = require('../models/models');
const { Op } = require('sequelize');
const uniqid = require('uniqid');



exports.getStories= async(req,res)=>{
     const{id}= req.body
     try{
        const friends = await Friend.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { user_id: id },
                            { friend_id: id }
                        ]
                    },
                    { status: 'accepted' }
                ]
            }
        });
   
     }catch(err){
         res.status(400).json({message:err.message})
     }
}
