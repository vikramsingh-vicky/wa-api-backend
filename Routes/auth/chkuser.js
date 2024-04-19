const express = require("express")
const router = express.Router()
const db = require("../../config/db");


router.post("/", (req,res)=>{
    const values = [
        req.body.username
    ]
    // console.log(req)
    const sql = "SELECT * FROM users WHERE `username` = ? ";
    db.query(sql, [req.body.username], (err,result)=>{
        if(err) return res.json({Message: "Error in Server"})
        // console.log(result)
        if(result.length > 0){
            // console.log(result)
            return res.json({message: "Username already taken."})

        } else{
            return res.json({message: "Username is available."})
        }
    });   
});

module.exports = router