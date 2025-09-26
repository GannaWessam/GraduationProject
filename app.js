const express = require("express");
const { generateToken, validateToken } = require("./middlewares/token");
const syncDB = require('./connections/syncDB')
const authRoutes = require('./Auth/AuthRoute');
const ProductRoutes = require('./Product/ProductRoute');
const cors =require( "cors");
require('./models/User');
require('./models/Student');

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you use cookies or Authorization headers
  })
);
app.use(express.json()) // parse JSON body
app.use("/uploads",express.static("uploads"))
app.use('/Product', ProductRoutes);
app.use('/api', authRoutes);
app.post("/login", generateToken);


app.get("/dashboard", validateToken, (req, res) => {
  res.json({ msg: `Welcome, role: ${req.userData.role}` });
});


app.listen(port, ()=>{
    console.log(`Server running on http://localhost:${port}`);
})