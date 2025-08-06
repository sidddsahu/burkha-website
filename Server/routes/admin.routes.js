const express= require("express");
const route = express.Router();
const adminController= require("../controllers/Admin.controller");

route.post("/adminlogin", adminController.adminLogin)
// route.post("/createuser", adminController.createUser)






module.exports=route;