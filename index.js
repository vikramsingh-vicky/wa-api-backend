// create a basic node js with express app
const express = require('express'); 
const http = require('http');
const {Server} = require('socket.io'); // import socket.io
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');

// define the port
const port = 3001; 
const wwebVersion = '2.2412.54';

// create a new express app
const app = express(); 

// create a new server
const server = http.createServer(app);
const io = new Server(server,{
    cors : {
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
    }
});

app.use(cors())

// use the body parser middleware
app.use(express.json())

// create a route for the app
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/v1/auth', require('./Routes/api/wa'))
app.use('/api/v1/captcha', require('./Routes/general/captcha'))
app.use('/api/v1/chkusername', require('./Routes/auth/chkuser'))
app.use('/api/v1/chkemail', require('./Routes/auth/chemail'))
app.use('/api/v1/signup', require('./Routes/auth/register'))
app.use('/api/v1/login', require('./Routes/auth/login'))
app.use('/api/v1/fetchUser', require('./Routes/auth/fetchuser'))
app.use('/api/v1/rePass', require('./Routes/auth/rePass'))

server.listen(port, () => {
    console.log("Listening on *:",port)
});

const allSessionsObject = {};

const createWhatsappSession = (id, socket) => {
    try {
        const client = new Client({
            puppeteer: {
                headless: true,
            },
            authStrategy: new LocalAuth({
                clientId: id,
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
            },
        });

        client.on('qr', (qr) => {
            console.log('QR RECEIVED', qr);
            socket.emit("qr", {
                qr,
            })
        });

        client.on("authenticated", (allSessionsObject) => {
            console.log("User Authenticated", allSessionsObject)
        });
        client.on('auth_failure', msg => {
            console.error('Authentication failure', msg);
        });
    
        client.on('ready', () => {
            console.log('Client is ready!');
            allSessionsObject[id] = client;
            socket.emit("ready",{
                id,
                message: "Client is ready"
            })
        });

        client.initialize();
    } catch (error) {
        console.error("Error initializing WhatsApp client:", error);
        // You might emit an error event or handle the error in some other way
    }
}
io.on('connection', (socket) => {
    console.log("a user connected",socket.id);
    socket.on("disconnect", () =>{
        console.log("user disconnected");
    });
    socket.on('connected', (data) =>{
        console.log("Connected to the server", data);
        socket.emit("Hello", "Hello from server");
    });
    socket.on('createSession', (data) => {
        console.log(data);
        const {id} = data;
        createWhatsappSession(id,socket)
    });
    socket.on('getAllChats', async (data) => {
        console.log("getAllChats", data);
        const {id} = data;
        const client = allSessionsObject[id];
        const allChats = await client.getChats();
        socket.emit('allChats',{
            allChats,
        });
    })
});





