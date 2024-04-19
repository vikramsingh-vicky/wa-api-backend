const express = require("express")
const router = express.Router()

var svgCaptcha = require('svg-captcha');

// Generate a captcha with a specified length
router.get("/", (req,res)=>{
    
    var captcha = svgCaptcha.create({
        size: 6, // Captcha length
        ignoreChars: '0o1i', // Characters to exclude (to avoid confusion)
        noise: 5, // Number of noise lines
        color: true, // Use color
        background: 'black', // Background color
        width: 200,
        height: 50
    });
    // req.session.captcha = captcha.text;
    console.log(captcha.text)
    res.type('svg');
    res.status(200).send(captcha);
    
});

module.exports = router;
