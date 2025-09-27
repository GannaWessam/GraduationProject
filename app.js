const express = require("express");
const { generateToken, validateToken } = require("./src/middlewares/token.js");

const cors = require("cors");
const errorHandler = require("./src/middlewares/errorHandler.js"); 
const routes = require("./src/routes.js")

require("./src/models/User.js");
require("./src/models/Student.js");

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you use cookies or Authorization headers
  })
);

app.use(express.json()); // parse JSON body
app.use("/src/uploads", express.static("uploads"));

app.use(routes)
app.post("/login", generateToken);

app.get("/dashboard", validateToken, (req, res) => {
  res.json({ msg: `Welcome, role: ${req.userData.role}` });
});


app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
