const express = require('express');
const app = express();
const config = require('./config');

const Game = require('./lib/Game');
const Network = require('./lib/Network');

// Serve the public directory
app.use(express.static('public'));

// Start the server
app.listen(config.PORT, config.IP_ADDRESS, () => {
  console.log(`Server running at http://${config.IP_ADDRESS}:${config.PORT}`);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: config.WEBSOCKET_PORT });

const clients = [];
const games = [];

wss.on('connection', function connection(ws, req) {
  ws.id = Network.getUniqueID();
  clients.push(ws);

  wss.clients.forEach(function each(client) {
    console.log('Client.ID: ' + client.id);
  });
  console.log('_________________');

  if (clients.length % 2 === 0) {
    const clientA = clients[clients.length - 2];
    const clientB = clients[clients.length - 1];
    games.push(new Game(clientA, clientB));
  }

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.splice(clients.indexOf(ws), 1);
  });

  ws.onerror = function () {
    console.log("Some Error occurred");
  }

  ws.on("message", (message) => {
    Network.handleMessageFromClient(ws, message);
  });
});