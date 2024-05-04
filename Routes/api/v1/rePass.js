const express = require("express")
const router = express.Router()
const db = require("../../../config/db");
const { createUserTable } = require('../../../Models/User')
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid'); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let JWT_SECRET = 'vortex$your_point@to!a-new%world^'


router.post("/", [
    body('password','Minimum 8 characters required').isLength({min:8}),
    body('username','Please enter valid Email ID').isEmail(),
],async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.json({message: error.array()[0].msg})
    }
    console.log(req.body.username)
    try {
        const sql = "SELECT * FROM users WHERE (`email` = ?)";
        db.query(sql, [req.body.username], async (err,result)=>{
            if(err) return res.json({message: "You're not yet registered, please signup first."});
            
            if(result.length > 0){
                const salt = await bcrypt.genSalt(10);
                const sql = "UPDATE users SET password =? WHERE email =?";
                const values = [
                    req.secPass = await bcrypt.hash(req.body.password,salt),
                    req.body.username,
                ]
                db.query(sql, values, (err,result)=>{
                    if(err) return res.json({message: "Unable to reset password, try again."});
                    
                    return res.json({message: "Password reset successful, please login."});
                });
            }else{
                return res.json({message: "You're not yet registered, please signup first."});
            }
        })
    }catch (error) {
        res.send("Internal Server Error");
    }
})

module.exports = router