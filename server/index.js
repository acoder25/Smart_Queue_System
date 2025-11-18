//import dependcies
const express=require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDb,getDb}=require('./config/db')
const auth= require('./routes/auth');

//config

dotenv.config();
const app=express();
app.use(express.json());

//enable cross origin request from frontend
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
})); 

const PORT=process.env.port||5000;
//db connection

const MONGO_URI=process.env.MONGO_URI
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server and Mongoose connected');
    });
  })
  .catch((err) => {
    console.error('Mongoose connection error:', err);
  });

//basic api
app.get("/",(req,res)=>{
    res.send("API is running");

});
app.use('/api/auth', auth);




