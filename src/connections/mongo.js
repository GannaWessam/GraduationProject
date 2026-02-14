const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/app_logs";

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI); 
    console.log("✅ MongoDB connected for logging");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
};

module.exports = connectMongo;