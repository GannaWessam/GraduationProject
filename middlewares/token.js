const jwt = require('jsonwebtoken');
require("dotenv").config();

function generateToken(email,name,id,role){

    const tokenData = {email,name,id,role}; // ضيف لو محتاج حاجه
    const token = jwt.sign(tokenData, process.env.SecretKey, { expiresIn: "1h" });
    return token;
}

function validateToken(req,res,next){

    const header = req.headers["authorization"];
    if(!header)
        return res.status(400).json({msg: "there is no auth header"})

    const token = header.split(" ")[1];
    if (!token) 
        return res.status(401).json({ msg: "No token provided" });

    jwt.verify(token, process.env.SecretKey, (err, tokenData) =>{
            if(err) 
                return res.status(403).json({ msg: "Invalid token" }); // test
            req.userData = tokenData; //ageb mnha elly ana 3ayzah lama a7tag
            next();
    });    
}


module.exports = {generateToken, validateToken};