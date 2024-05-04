// create a basic node js with express app
require('dotenv').config();
const express = require('express'); 
const http = require('http');
const {Server} = require('socket.io'); // import socket.io
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const db = require("./config/db");
const { createInstanceTable } = require("./Models/Instances");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { title } = require('process');

// define the port 
const port = 3001; 
const wwebVersion = '2.2412.54';

// create a new express app
const app = express(); 

// create a new server
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: (origin, callback) => {
            // Check if the origin is allowed
            // Replace the logic with your actual implementation
            const allowedOrigins = ["http://localhost:3000", "http://react.unrealautomation.com", "http://react.unrealautomation.com:3000", "https://react.unrealautomation.com", "https://react.unrealautomation.com:3000"];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
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

const routes = [
    '/api/v1/wa',
    '/api/v1/captcha',
    '/api/v1/chkusername',
    '/api/v1/chkemail',
    '/api/v1/signup',
    '/api/v1/login',
    '/api/v1/fetchUser',
    '/api/v1/rePass',
    '/api/v1/fetchInstance',
    '/api/v1/createInstance',
];
  
routes.forEach((route) => {
    app.use(route, require(`./Routes${route}`));
});

server.listen(port, () => {
    console.log("Listening on *:",port)
});

const allSessionsObject = {};
function generateApiKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}
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
            // console.log('QR RECEIVED', qr);
            // console.log("id: ", id)
            socket.emit("qr", {
                qr,
                id,
            })
        });
        
        client.on("authenticated", (allSessionsObject) => {
            console.log("User Authenticated", allSessionsObject)

        });
        client.on('auth_failure', msg => {
            console.error('Authentication failure', msg);
        });
    
        client.on('ready', () => {
            const sql1 = "SELECT * FROM instances WHERE insid =?";
            db.query(sql1, [id], async (err,result) => {
                if(err) return console.error(err);
                // console.log(result[0])
                if(result.length > 0 & result[0].api_key === '') {
                    const sql = "UPDATE instances SET authenticated =?, api_key = ? WHERE insid =?";
                    const values = [
                        authenticated=true,
                        api_key=generateApiKey(),
                        id=id,
                    ]
                    db.query(sql,values, (err, results) => {
                        if (err) throw err;
                        // console.log("Instance updated")
                    })
                    console.log('Client is ready!');
                    allSessionsObject[id] = client;
                    socket.emit("ready",{
                        id,
                        message: "Client is ready"
                    })
                }else if(result.length > 0 && result[0].authenticated !== true){
                    const sql = "UPDATE instances SET authenticated =? WHERE insid =?";
                    const values = [
                        authenticated=true,
                        id=id,
                    ]
                    db.query(sql,values, (err, results) => {
                        if (err) throw err;
                        // console.log("Instance updated")
                    })
                    console.log('Client is ready!');
                    allSessionsObject[id] = client;
                    socket.emit("ready",{
                        id,
                        message: "Client is ready"
                    })
                }else{
                    console.log('Client is ready!');
                    allSessionsObject[id] = client;
                    socket.emit("ready",{
                        id,
                        message: "Client is ready"
                    })
                }
            })
        });
        client.on('message_create', message => {
            // console.log(message)
            if (message.body === 'ping') {
                // send back "pong" to the chat the message was sent in
                client.sendMessage(message.from, 'pong');
            }
        });
        
        client.on('logout', async () => {
            // console.log('Client logged out');
            await client.logout(); // Close the client
            delete allSessionsObject[id]; // Remove session from allSessionsObject
            const sql = "UPDATE instances SET authenticated =? WHERE insid =?";
            db.query(sql,[false, id], (err, results) => {
                if (err) throw err;
                console.log("Instance updated")
            })
            // Emit event to inform client about session removal
            socket.emit("sessionRemoved", {
                id,
                title: "Logged Out!",
                message: "Session removed due to logout"
            });
        })

        client.initialize();
    } catch (error) {
        console.error("Error initializing WhatsApp client:", error);
        // You might emit an error event or handle the error in some other way
    }
}
io.on('connection', (socket) => {
    console.log("a user connected",socket.id);
    socket.on("disconnect", () =>{
        console.log("user disconnected", socket.id);
    });
    socket.on('connected', (data) =>{
        console.log("Connected to the server", data);
        socket.emit("Hello", "Hello from server");
    });
    socket.on('createSession', (data) => {
        // console.log(data);
        const {id} = data;
        createWhatsappSession(id,socket)
    });
    socket.on('getAllChats', async (data) => {
        // console.log("getAllChats", data);
        const id = data.insid;
        // console.log(allSessionsObject);
        const client = allSessionsObject[id];
        const allChats = await client.getChats();
        socket.emit('allChats',{
            allChats,
        });
    })
    socket.on('fetchInstance', async (data) => {
        // console.log(data)
        const uuid = data.uuid;
        const sql = "SELECT * FROM instances WHERE uuid =?";
        db.query(sql, [uuid], async (err,result) => {
            if(err) return console.error(err);
            if(result.length > 0){
                socket.emit("instanceFetched", {
                    message: "Instance Found",
                    result: result,
                })
            } else{
                console.log( "No Instance Found")
            }
        })
    })
    socket.on('sendMessage', async (data) => {
        // console.log(data)
        const key = data.key;
        const message = data.message;
        const sql = "SELECT `insid` FROM instances WHERE api_key =?";
        db.query(sql, [key], async (err,result) => {
            if(err) return console.error(err);
            if(result.length > 0){
                const id = result[0].insid;
                const client = allSessionsObject[id];
                const to = message.to + "@c.us";
                console.log("Sending message to " + to);
                const msgResult = await client.sendMessage(to,message.body);
                if(msgResult){
                    socket.emit("testMessageSent", {
                        title: "Message Sent Successfully",
                        message: "Test Message Sent Successfully To " + message.to,
                    })
                } else{
                    socket.emit("testMessageSent", {
                        title: "Unable To Send Message",
                        message: "Unable To Send Message To " + message.to,
                    })
                }
            } else{
                console.log("No Instance Found")
                socket.emit("instanceNotFound", {
                    message: "Instance not found",
                })
            }
        })
    })
    socket.on('logout', async (data) => {
        // console.log(allSessionsObject[data])
        const client = allSessionsObject[data];
        await client.logout(); // Close the client
        delete allSessionsObject[data]; // Remove session from allSessionsObject
        console.log("Client logged out", allSessionsObject[data]);
        const sql = "UPDATE instances SET authenticated =? WHERE insid =?";
        db.query(sql,[false, data], (err, results) => {
            if (err) throw err;
            console.log("Instance updated")
            socket.emit("sessionRemoved", {
                id: data,
                title: "Logged Out!",
                message: "Session removed due to logout"
            });
        })
    })

    socket.on('removeInstance', async (data) => {
        // remove instance from database
        const sql = "DELETE FROM instances WHERE insid = ?";
        db.query(sql, [data], (err, result) => {
          if (err) throw err;
          console.log("Instance removed from database");
          socket.emit("instanceRemoved", {
            title: "Instance Removed",
            message: "Instance removed successfully"
          });
        });
    })
}); 





