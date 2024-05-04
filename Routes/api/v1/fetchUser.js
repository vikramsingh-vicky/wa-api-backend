const express = require("express")
const router = express.Router()
const db = require("../../../config/db");

var fetchuser = require("../../../middleWare/fetchuser");

router.post("/",fetchuser, async (req,res)=>{
  
    userId = req.user;
    console.log(userId)
    const sql = `SELECT uuid, insID, name, username, email, mobile, avatar, mem_type, created_at FROM users WHERE uuid ="${userId}"`;
    db.query(sql, async (err, results) => {
        if (err) throw error;
        // console.log(results)
        return res.json({
            message: "User fetched successfully", 
            result: results[0]
        })
    })     
})

module.exports = router