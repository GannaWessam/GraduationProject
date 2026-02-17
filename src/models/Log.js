const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  userAgent: { type: String, required: false },
  user: {
    _id: { type: String, required: false }, 
    email: { type: String, required: false }, 
    name: { type: String, required: false },  
  },
  type: { type: String, enum: ["modification","read","edit","delete"], required: true },
  level: { type: String, enum: ["success","error"], required: true },
  affectedUser: {
    _id: { type: String, required: false },  
    email: { type: String, required: false },
    name: { type: String, required: false },
  },
  affectedThing: {
    _id: { type: String, required: false },  
    name: { type: String, required: false },
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);