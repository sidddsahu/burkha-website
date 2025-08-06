const express = require("express");
const route =express.Router();
const BannerController = require("../controllers/BannerController");


route.post("/create", BannerController.BannerSave);
route.get("/alldisplay", BannerController.getAllBanner);
route.delete("/deleted/:id", BannerController.BannerDelete);











module.exports =route;