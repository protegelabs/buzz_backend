const session = require('express-session');
const { Event, Review, User, Purchase, EventCategory, Ticket } = require('../models/models')
const { Op, where } = require('sequelize')
const uniqid = require('uniqid')
const { sequelize } = require('../config/sequelize')
const Url = require('url');



exports.getEventTickets = async (req, res) => {
    const { event_id } = req.body
    try {
        const ticket = await Ticket.findAll({ where: { event_id } })

        return res.status(200).json(ticket)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

exports.updateTicket= async(req,res)=>{
     const{ id,info}= req.body
     try{
         await Ticket.update({...info},{where:{id}})

            return res.status(200).json("success")
     }catch(err){
         res.status(400).json({message:err.message})
     }
}

exports.updateManyTickets= async(req,res)=>{
     const{ ticketarray }= req.body
     try{
         await Promise.all( 
            ticketarray.map(async(ticket)=>{
              return  await Ticket.update({...ticket.info},{where:{id:ticket.id}})
            })
        )
        return res.status(200).json("success")
     }catch(err){
         res.status(400).json({message:err.message})
     }
}

exports.deleteTicket= async(req,res)=>{
    const{ id }= req.body
    try{
        await Ticket.destroy({where:{id}})
        return res.status(200).json("success")
    }catch(err){
        res.status(400).json({message:err.message})
    }
}

exports.deleteManyTickets= async(req,res)=>{
    const{ ticketarray }= req.body
    try{
        await Promise.all( 
            ticketarray.map(async(ticket)=>{
              return  await Ticket.destroy({where:{id:ticket}})
            })
        )
        return res.status(200).json("success")
    }catch(err){
        res.status(400).json({message:err.message})
    }
}







