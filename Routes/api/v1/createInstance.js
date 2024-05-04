const express = require("express")
const router = express.Router()
const db = require("../../../config/db");
const {createInstanceTable} = require("../../../Models/Instances");

router.post("/", (req,res) => {
    try {
        createInstanceTable();
        const sql1 = `SELECT * FROM instances WHERE uuid = "${req.body.uuid}"`;
        db.query(sql1, async (err, results) => {
            if (err) throw error;
            if(results.length > 0 && results.length <5){
                const sql = `INSERT INTO instances (uuid, insid) VALUES ("${req.body.uuid}","${req.body.insID}")`;
                db.query(sql, async (err, results) => {
                    if (err) throw err;
                    return res.json({
                        message: "Instance Created",
                        result: results
                    })
                })
            }else if(results.length === 0){
                const sql = `INSERT INTO instances (uuid, insid) VALUES ("${req.body.uuid}","${req.body.insID}")`;
                db.query(sql, async (err, results) => {
                    if (err) throw err;
                    return res.json({
                        message: "Instance Created",
                        result: results
                    })
                })
            }else{
                return res.json({message: "Instance Limit Reached"})
            }
        })
    } catch (error) {
        console.log(error)
    }
})


module.exports = router