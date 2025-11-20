const mongoose=require('mongoose');

const bookingSchema=new mongoose.Schema({
   name:{type:String, required:true},
   phone_no:{type:String, required:true,unique:true},
   department: { type: String, required: true },
   time: { type: String,required: true},
   date: { type: Date ,required: true}

});


module.exports=mongoose.model('Booking',bookingSchema,'Bookings');