const express=require("express");
const router=express.Router();
const jwt=require('jsonwebtoken');
const Booking = require('../models/Booking');

router.post('/',async(req,res)=>{
    const{name, phone_no,date, time, department}=req.body;
    
    console.log({name, phone_no,date, time, department});
    if (!name || !phone_no || !date || !time || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    try{
      const booking=new Booking({name, phone_no, department,time,date});
      await booking.save();

      return res.status(201).json({ message: 'Booking done' });
       
    }
    catch(err){
      console.log(err);
      return res.status(500).json({message:'Booking failed'})

    }

});
module.exports=router;