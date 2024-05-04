const express = require("express")
const router = express.Router()
const db = require("../../../config/db");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../../../middleWare/fetchuser");
const { v4: uuidv4 } = require('uuid'); 
const { createInstanceTable } = require("../../../Models/Instances");

let JWT_SECRET = process.env.JWT_SECRET

router.post("/", [
        body('username','Minimum 5 characters required').isLength({min:5}),
        body('password','Minimum 5 characters required').isLength({min:5}),
    
    ], async (req,res)=>{
        const error = validationResult(req);
        let userId = '';
        if(!error.isEmpty()){
            return res.json({message: "Try login with correct credentials."})
        }
        
        try {
            const sql1 = "SELECT * FROM users WHERE (`username` = ? or `email` = ?)";
            db.query(sql1, [req.body.username, req.body.username], async (err,result)=>{
                if(err) return res.json({message: "Try login with correct credentials."});
                if(result.length > 0){
                    // console.log(result)
                    const passwordMatch = await bcrypt.compare(req.body.password, result[0].password);
                    if(!passwordMatch) return res.json({message: "Try login with correct credentials."});
                    const jwtToken = jwt.sign({
                        id: result[0].uuid,
                        insID: result[0].insID,
                    }, JWT_SECRET,{expiresIn:500}); 
                    return res.json({message: "Login Successful",Token:jwtToken})
        
                } else{
                    return res.json({message: "Try login with correct credentials."});
                }
            });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
)


module.exports = router