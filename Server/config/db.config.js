const mongoose = require('mongoose');

const dbConnect = async () => {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log("✅ MongoDB Connected"))
      .catch(err => console.error("❌ Error connecting to MongoDB:", err));
};

module.exports = dbConnect;