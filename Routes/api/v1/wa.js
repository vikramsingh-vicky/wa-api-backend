const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../../../config/db");

const hashPassword = async (req, res, next) => {
    try {
        req.hashedPassword = await bcrypt.hash(req.body.password,10);
        next();
    } catch (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

router.post("/", hashPassword, async (req,res)=>{
    const values = [
        req.body.username,
        req.hashedPassword,
    ]
    console.log(req.body)
    const sql = "SELECT * FROM users WHERE (`username` = ? or `email` = ?) and `password` = ?";
    db.query(sql, [req.body.username, req.body.username, req.body.password], (err,result)=>{
        if(err) return res.json({Message: "Error in Server"})
        console.log(result)
        if(result.length > 0){
            console.log(result)
            return res.json({message: "Login Successful",result})

        } else{
            return res.json({message: "Login Failed: ",err})
        }
    }); 
    
});

module.exports = router