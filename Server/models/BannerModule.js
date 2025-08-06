const mongoose= require("mongoose");
const BannerSchema = new mongoose.Schema({
        images: [
        {
            type: String
        }
      
    ],
      URL : {
            type: String
        }

})

module.exports = mongoose.model("Banner", BannerSchema);