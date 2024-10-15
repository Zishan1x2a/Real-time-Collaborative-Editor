// server/server.js

const express = require('express');
const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const wss = new WebSocket.Server({ noServer: true });

let users = {}; // In-memory user store (for demo purposes)
let players = []; // Active players for matchmaking

app.use(express.json());
app.use(express.static('client'));

// Authentication endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };
    res.status(201).send('User registered');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username }, 'secret_key');
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('New connection');

    ws.on('message', (message) => {
        // Handle incoming messages (game updates, etc.)
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Connection closed');
    });
});

// Create WebSocket server with HTTP server
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
