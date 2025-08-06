const AdminModel = require("../models/AdminModel");
// const bcrypt = require('bcryptjs');

const adminLogin = async(req,res)=>{
    const {userid, password} =req.body;
    console.log(req.body);
    
    try {
     const all = await AdminModel.find()
     console.log(all);
     const Admin = await AdminModel.findOne({userid})
     console.log(Admin);
     
      res.send(Admin)
     if(!Admin){
        res.status(400).send({msg:"Invalid user id"});
     }
     if(Admin.password != password){
        res.status(400).send({msg:"password is incorrect"})
     }
    //  res.send(200).send(Admin)
     console.log(Admin);
    //  res.send("ok")
     
    } catch (error) {
        console.log(error)
    }
  
     
  }
module.exports = {
    adminLogin
};