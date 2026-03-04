const express = require("express");
const { generateToken, validateToken } = require("./src/middlewares/token.js");
require('./src/connections/syncDB.js');
const cors = require("cors");
const errorHandler = require("./src/middlewares/errorHandler.js"); 
const routes = require("./src/routes.js");
const syncDB = require("./src/connections/syncDB.js")

const connectMongo = require("./src/connections/mongo.js");
connectMongo();
require("./src/models/User.js");
require("./src/models/Student.js");

// Initialize WebSocket service for chat
require("./src/Services/WebSocket.js");

// Initialize background services
const backgroundServices = require("./src/background");

const rateLimit = require("express-rate-limit");

backgroundServices.loadServices();
backgroundServices.startAll();

const auditContext = require("./src/middlewares/auditContext");
const app = express();
const port = 3000;

app.use(
  cors({
    origin: ["http://localhost:5173","http://192.168.1.10:5173","http://193.227.34.48","http://192.168.159.1:5173","http://10.51.126.244:5173","https://lms4.capu.edu.eg"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, 
  })
);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 150,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json()); 
app.use("/uploads", express.static("uploads"));

app.use(auditContext); 


app.use(routes)
app.post("/login", generateToken);

app.get("/dashboard", validateToken, (req, res) => {
  res.json({ msg: `Welcome, role: ${req.userData.role}` });
});


app.use(errorHandler);

// your log model

app.listen(port,"0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
