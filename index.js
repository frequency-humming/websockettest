var express = require("express");
const http = require('http');
const cors = require('cors'); 
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Create a WebSocket server by passing the Express server instance.
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send a welcome message to the client
    ws.send('Welcome to the WebSocket server!');

    // Example: Emit a message to all clients every 10 seconds
    setInterval(() => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('This is a message sent every 100 seconds.');
            }
        });
    }, 100000);
    
    // Listen for messages from the client
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });
    ws.on('records', (message) => {
        console.log('in the message channel '+message);
    })
    ws.on('performance', (message) => {
        console.log('in the performance channel '+message);
    })
});

server.listen(8888, function() {
    console.log("listening on port 8888");
});
