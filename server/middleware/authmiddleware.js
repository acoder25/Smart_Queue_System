const jwt=require('jsonwebtoken');

function authmiddleware(req,res,next){
   
   const authHeader=req.headers['authentication'];

   if(!authheader){
       return res.status(401).json({message:'No Token'});
   }
   const token=authHeader.split(' ')[1];

   try{
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      req.user=decoded;
      next();

   }
   catch(err){
      return res.status(403).json({message:'Invalid token'});
   }

}
module.exports=authmiddleware;