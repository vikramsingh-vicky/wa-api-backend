// create a basic node js with express app
const express = require('express'); 
const http = require('http');
const {Server} = require('socket.io'); // import socket.io
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');

// define the port
const port = 3001; 
// create a new express app
const app = express(); 

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`app listening at port:${port}`)
});