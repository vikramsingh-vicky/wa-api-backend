const express = require("express")
const router = express.Router()

const fontP = '../../assets/fonts/WorkSans-Regular.ttf';
var svgCaptcha = require('svg-captcha');

// Generate a captcha with a specified length
router.get("/", (req,res)=>{
    
    var captcha = svgCaptcha.create({
        size: 6, // Captcha length
        ignoreChars: '0oO1lI', // Characters to exclude (to avoid confusion)
        noise: 0, // Number of noise lines
        color: 'white', // Use color
        background: 'rgba(0, 0, 0, 0.466);', // Background color
        width: 200,
        height: 50,
        fontPath: fontP
    });
    // req.session.captcha = captcha.text;
    console.log(captcha.text)
    res.type('svg');
    res.status(200).send(captcha);
});

module.exports = router;
