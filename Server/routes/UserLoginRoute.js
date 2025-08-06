const express= require("express");
const route = express.Router();
const adminController= require("../controllers/RegisterController");

route.post("/create", adminController.Registration)
route.post("/login", adminController.Login)

// route.post("/createuser", adminController.createUser)






module.exports=route;