const express = require("express");
const router = express.Router();
const client = require("")

const http = require('http');
const {Server} = require('socket.io'); // import socket.io
const cors = require('cors');

router.post("/", (req,res) =>{
    const key = req.headers.key;

})

module.exports = router;