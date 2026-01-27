const express = require("express");
const { generateToken, validateToken } = require("./src/middlewares/token.js");
require('./src/connections/syncDB.js');
const cors = require("cors");
const errorHandler = require("./src/middlewares/errorHandler.js"); 
const routes = require("./src/routes.js");
const syncDB = require("./src/connections/syncDB.js")


require("./src/models/User.js");
require("./src/models/Student.js");

// Initialize WebSocket service for chat
require("./src/Services/WebSocket.js");

// Initialize background services
const closeExpiredEventsService = require("./src/background/closeExpiredEvents.js");
closeExpiredEventsService.init();

const app = express();
const port = 3000;

app.use(
  cors({
    origin: ["http://localhost:5173","http://192.168.1.11:5173","http://193.227.34.48"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you use cookies or Authorization headers
  })
);

app.use(express.json()); // parse JSON body
app.use("/uploads", express.static("uploads"));

app.use(routes)
app.post("/login", generateToken);

app.get("/dashboard", validateToken, (req, res) => {
  res.json({ msg: `Welcome, role: ${req.userData.role}` });
});


app.use(errorHandler);

app.listen(port,"0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});
