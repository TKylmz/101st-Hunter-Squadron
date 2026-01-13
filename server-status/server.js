// 101st Hunter Squadron - Automatic Status Server
// Run with: node server.js

var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = 5050;

// Path to DCS Saved Games
var DCS_SAVED_GAMES = 'C:/Users/onurk/Saved Games/DCS.dcs_serverrelease';
var STATUS_FILE = path.join(DCS_SAVED_GAMES, 'status.json');

// Fallback if file doesn't exist
var OFFLINE_STATUS = JSON.stringify({
    online: false,
    serverName: "101st Hunter Squadron",
    mission: "Server Offline",
    map: "--",
    players: 0,
    maxPlayers: 32,
    missionTime: "--:--",
    playerList: []
});

var server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Always read fresh from file
    try {
        var data = fs.readFileSync(STATUS_FILE, 'utf8');
        console.log('Read status.json:', data.substring(0, 100));
        res.writeHead(200);
        res.end(data);
    } catch (err) {
        console.log('Error reading file:', err.message);
        res.writeHead(200);
        res.end(OFFLINE_STATUS);
    }
});

server.listen(PORT, '0.0.0.0', function () {
    console.log('');
    console.log('==================================================');
    console.log('  101st Hunter Squadron - Status Server');
    console.log('==================================================');
    console.log('  Port: ' + PORT);
    console.log('  File: ' + STATUS_FILE);
    console.log('==================================================');

    // Test read on startup
    try {
        var test = fs.readFileSync(STATUS_FILE, 'utf8');
        console.log('  File found! Content preview:');
        console.log('  ' + test.substring(0, 80) + '...');
    } catch (e) {
        console.log('  WARNING: File not found yet');
    }
    console.log('==================================================');
});
