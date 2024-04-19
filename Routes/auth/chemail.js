const express = require("express")
const router = express.Router()
const db = require("../../config/db");


router.post("/", (req,res)=>{
    const values = [
        req.body.email
    ]
    // console.log(req)
    const sql = "SELECT * FROM users WHERE `email` = ? ";
    db.query(sql, [req.body.email], (err,result)=>{
        if(err) return res.json({Message: "Error in Server"})
        // console.log(result)
        if(result.length > 0){
            // console.log(result)
            return res.json({message: "Email already registered"})

        } else{
            return res.json({message: "Good to go."})
        }
    });   
});

module.exports = router