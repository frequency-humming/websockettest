var express = require("express");
const expressWs = require('express-ws');
const cors = require('cors');

const app = express();
app.use(cors());

expressWs(app);

const clientsByEndpoint = {
    '/records': [],
    '/performance': []
};

app.ws('/records', (ws, req) => {

    console.log('Client connected to records');
    const origin = req.headers.origin;
    if (!isAllowedOrigin(origin)) {
        ws.close();
        console.log(`Connection from disallowed origin: ${origin}`);
        return;
    }
    clientsByEndpoint['/records'].push(ws);
    ws.send('Welcome to the records WebSocket');
    
    ws.on('message', (message) => {
        console.log('Received message in records channel', message);
        // Broadcast the message to all connected clients on this channel
        channelMessage('/records', message, ws);
    });

    webSocketListeners(ws, '/records');
});

app.ws('/performance', (ws, req) => {

    console.log('Client connected to performance');
    const origin = req.headers.origin;
    if (!isAllowedOrigin(origin)) {
        ws.close();
        console.log(`Connection from disallowed origin: ${origin}`);
        return;
    }
    clientsByEndpoint['/performance'].push(ws);
    ws.send('Welcome to the performance WebSocket');
    ws.on('message', (message) => {
        console.log('Received message in performance channel', message);
        // Broadcast the message to all connected clients on this channel
        channelMessage('/performance', message, ws);
    });

    webSocketListeners(ws, '/performance');
});

function webSocketListeners(ws, endpoint) {

    ws.isAlive = true;
    ws.on('pong', () => {
        console.log('on pong');
        ws.isAlive = true;
    });
    ws.on('error', (error) => {
        console.error('WebSocket Error:', error);
    });
    ws.on('close', () => {
        clientsByEndpoint[endpoint] = clientsByEndpoint[endpoint].filter(client => client !== ws);
    });
}

const intervalId = setInterval(() => {
    // Check each channel's clients and ping them
    Object.keys(clientsByEndpoint).forEach(endpoint => {
        clientsByEndpoint[endpoint].forEach(ws => {
            console.log(`sending ping to ${endpoint}`);
            if (!ws.isAlive) return ws.terminate();
            ws.isAlive = false;
            ws.ping(null, false, true);
        });
    });
    const memoryUsage = process.memoryUsage();
    console.log('Memory Usage:', memoryUsage);
}, 45000);

function channelMessage(endpoint, data, originatingWs) {

    console.log(`Number of connected clients on ${endpoint}: ${clientsByEndpoint[endpoint].length}`);
    const message = JSON.stringify({ data });
    // Broadcast only to clients on the same endpoint
    clientsByEndpoint[endpoint].forEach(client => {
        if (client !== originatingWs && client.readyState === 1) {
            client.send(message);
        }
    });
}

function isAllowedOrigin(origin) {
    let env = process.env.Origins;
    let allowedOrigins = env.split(',');
    return allowedOrigins.includes(origin);
}

process.on('exit', () => {
    clearInterval(intervalId);
});

process.on('SIGINT', () => {
    clearInterval(intervalId);
    process.exit(0);
});

process.on('SIGTERM', () => {
    clearInterval(intervalId);
    process.exit(0);
});

app.listen(8888, function () {
    console.log("listening on port 8888");
});