const express=require("express");
const router=express.Router();
const {body, validationResult}=require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');  // Mongoose model
const jwt=require('jsonwebtoken');

router.post('/register',
    [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('phone').trim().isLength({ min: 7 }).withMessage('Phone invalid'),
    body('password').isLength({ min: 6 }).withMessage('Password too short'),
    body('system').optional().isString()
   ],
   async (req,res)=>{
      const errors=validationResult(req);

      if(!errors.isEmpty()){
          return res.status(422).json({ message: errors.array()[0].msg });
      }
      const {name,phone,password,system}=req.body;
      try{
        const existing = await User.findOne({ phone });
        if(existing){
           return res.status(409).json({message:'phone number already exists'});
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = new User({ name, phone, password: hash, system });
        await user.save();

        return res.status(201).json({ message: 'User created' });

      }
      catch(err){
        console.log(err);
        return res.status(500).json({message:'Server error'})

      }
   }

);
router.post('/login',
   [
      body('phone').trim().isLength({ min: 7 }).withMessage('Phone invalid'),
      body('password').isLength({ min: 6 }).withMessage('Password too short'),
   ],
   async (req,res)=>{
      const errors=validationResult(req);

      if(!errors.isEmpty()){
           return res.status(422).json({message: errors.array()[0].msg} );
      }
      const {phone,password}=req.body;
      try{
         const user= await User.findOne({ phone });
         if(!user){
            return res.status(401).json({message:'This phone no does not exist'});
         }
         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
            return res.status(401).json({ message: 'Invalid phone or password' });
         }
         const payload={id: user._id,name:user.name,phone:user.phone};
         const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1d'})
         return res.status(200).json({ message: 'Login successful',token,user:payload });

      }
      catch(err){
         console.log(err);
        return res.status(500).json({message:'Server error'})
      }

   }
);
module.exports= router;

