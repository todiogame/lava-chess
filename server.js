const express = require('express');
const app = express();
const config = require('./config');
const router = require('./lib/server/routes')
const bodyParser = require("body-parser");
const Game = require('./lib/server/Game');
const Network = require('./lib/Network');

// Start the web server
app.use(express.static('public'));
app.use(express.json());
app.use('/', router);

app.listen(config.PORT, config.INTERNAL_IP_ADDRESS, () => {
  console.log(`Server running at http://${config.INTERNAL_IP_ADDRESS}:${config.PORT}`);
});


// Start the game server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ host: config.INTERNAL_IP_ADDRESS, port: config.WEBSOCKET_PORT });

const clientsLookingForGame = [];
const games = [];

wss.on('connection', function connection(ws, req) {
  ws.id = Network.getUniqueID();
  clientsLookingForGame.push(ws);

  wss.clients.forEach(function each(client) {
    console.log('Client.ID: ' + client.id);
  });
  console.log('_________________');

  if (clientsLookingForGame.length % 2 === 0) {
    const clientA = clientsLookingForGame.shift();
    const clientB = clientsLookingForGame.shift();
    games.push(new Game(clientA, clientB));
  }

  ws.on("close", () => {
    console.log("Client disconnected");
    if (clientsLookingForGame.includes(ws)) clientsLookingForGame.splice(clientsLookingForGame.indexOf(ws), 1);
    else if (ws.game) Network.handleClientRagequit(ws)
  });

  ws.onerror = function () {
    console.log("Some Error occurred");
  }

  ws.on("message", (message) => {
    Network.handleMessageFromClient(ws, message);
  });
});