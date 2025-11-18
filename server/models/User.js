const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
   name:{type:String, required:true },
   phone:{type:String, required:true , unique:true},
   password: { type: String, required: true },
   system: { type: String, default: 'Hospital Queue Predictor System' },
   createdAt: { type: Date, default: Date.now }

});


module.exports=mongoose.model('User',userSchema,'Users_info');