const express = require("express")
const router = express.Router()
const db = require("../../../config/db");
const {createInstanceTable} = require("../../../Models/Instances");

router.post("/", (req,res) => {
    // console.log(req.body)
    if(!req.body.insID){
        return res.json({message: "Unable to get the instance ID"})
    }else{
        const sql = `SELECT * FROM instances WHERE uuid = ?`;
        db.query(sql,[req.body.uuid], async (err, results) => {
            if (err) throw error;
            if(results.length > 0){
                // console.log(results)
                return res.json({
                    message: "Instance Found",
                    result: results
                })
            } else{
                return res.json({message: "Instance not found"})
            }
        })

    }
})

module.exports = router