const express = require('express');
const app = express();

const Game = require('./lib/Game')

// Serve the public directory
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'))
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});



const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8081 })


wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};
const clients = []
const games = []

wss.on('connection', function connection(ws, req) {
  ws.id = wss.getUniqueID();
  clients.push(ws);

//show all clients
  wss.clients.forEach(function each(client) {
    console.log('Client.ID: ' + client.id);
  });
  console.log('_________________');

  if (clients.length % 2 === 0) {
    const clientA = clients[clients.length - 2];
    const clientB = clients[clients.length - 1];

    clientA.other = clientB;
    clientB.other = clientA;
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
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);
    handleMessage(ws, data);
  });

});

function handleMessage(ws, data){
}

