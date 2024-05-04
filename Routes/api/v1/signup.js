const express = require("express")
const router = express.Router()
const db = require("../../../config/db");
const { createUserTable } = require('../../../Models/User')
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid'); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


let JWT_SECRET = process.env.JWT_SECRET
router.post("/", [
    body('name','Minimum 3 characters required').isLength({min:3}),
    body('username','Minimum 5 characters required').isLength({min:5}),
    body('email','Enter a valid email').isEmail(),
    body('mobile','Enter a valid mobile number').isMobilePhone(),
    body('password','Minimum 8 characters required').isLength({min:8}),
], async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.json({message: error.array()[0].msg})
    }
    // userid = await uuidv4()
    // console.log(userid)
    try {
        const salt = await bcrypt.genSalt(10);
        
        createUserTable()
        const sql = "INSERT INTO users (`uuid`, `insID`, `name`, `username`, `email`, `mobile`, `password`) VALUES (?)";
        const values = [
            req.userid = await uuidv4(),
            req.insID = await uuidv4(),
            req.body.name,
            req.body.username,
            req.body.email,
            req.body.mobile,
            req.secPass = await bcrypt.hash(req.body.password,salt),
        ]
        db.query(sql, [values], (err,result)=>{
            if(err) {
                return res.json({message: "Unable to get you on board",err})
            }
            console.log(result)
            const jwtData = jwt.sign({
                id: req.userid,
            },JWT_SECRET);
            
            return res.json({message: "Signup Successful",Token:jwtData});
        });
        
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router