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
    // Listen for messages from the client
    ws.on('message', (message) => {
        console.log('Received message');
        let record;
        try{
            record = JSON.parse(message);
        }catch(error){
            console.log('error parsing');
            return;
        }      
        if(record.channel === 'records'){
            console.log('in the records channel '+record);
            channelMessage('records',record);
        }else if(record.channel === 'performance'){
            console.log('in the performance channel');
            channelMessage('performance',record);
        }else{
            console.log('unknown channel :(');
        }
    });
    
});

function channelMessage(channel, data){
    const message = JSON.stringify({channel, data});
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

server.listen(8888, function() {
    console.log("listening on port 8888");
});
