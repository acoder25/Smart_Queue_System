//import dependcies
const express=require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

//config

dotenv.config();
const app=express();
app.use(express.json());

app.use(cors({
    origin:"http://localhost:5000",
    credentials:true
})); 


const PORT=process.env.port||5000;

//basic api
app.get("/",(req,res)=>{
    res.send("API is running");

});
//start server
app.listen(PORT,()=>{
   console.log(`Server is listening on the PORT ${PORT}`);
});

