const express = require('express');
const app = express();
const config = require('./config');
const router = require('./lib/server/routes')
const Game = require('./lib/server/Game');
const Network = require('./lib/Network');
const c = require("./lib/const")

const cors = require('cors');

app.use(express.urlencoded({ extended: true }));
// Enable CORS for all routes (important for Vercel/Northflank split)
app.use(cors());

// Start the web server
app.use(express.static('public'));
app.use(express.json());
app.use('/', router);

const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${config.PORT}`);
});


// Start the game server
const WebSocket = require('ws');
// Mount WebSocket on the SAME HTTP server instance (single port)
const wss = new WebSocket.Server({ server });

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
    // games.push(new Game(clientA, clientB, c.GAME_MODE.QUICK, onGameEnd));
    games.push(new Game(clientA, clientB, c.GAME_MODE.DRAFT, onGameEnd));
  }

  ws.on("close", () => {
    console.log("Client disconnected");
    if (clientsLookingForGame.includes(ws)) clientsLookingForGame.splice(clientsLookingForGame.indexOf(ws), 1);
    else if (ws.game && !ws.game.finished) Network.handleClientRagequit(ws)
  });

  ws.onerror = function () {
    console.log("Some Error occurred");
  }

  ws.on("message", (message) => {
    Network.handleMessageFromClient(ws, message);
  });

  function onGameEnd(game) {
    console.log("ongameend")
    if (game.clientA) game.clientA.close()
    if (game.clientB) game.clientB.close()
    // When the game is finished, find its index in the games array and remove it
    const gameIndex = games.indexOf(game);
    if (gameIndex !== -1) {
      games.splice(gameIndex, 1);
    }
  }
});