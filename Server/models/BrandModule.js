const mongoose= require("mongoose");
const BlogSchema = new mongoose.Schema({
        images: [
        {
            type: String
        }
      
    ],
    Brandname : {
        type:String
    }
})

module.exports = mongoose.model("Brand", BlogSchema);