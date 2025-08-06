const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var subcategorySchema = new mongoose.Schema({
    name: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Catgeory"
    }
});

//Export the model
module.exports = mongoose.model('Subcategory', subcategorySchema);