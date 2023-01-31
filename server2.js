const express = require('express');
const path = require('path');

const app = express();

// Serve the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/privacy.html');
});



const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8081 })

wss.on('connection', function connection(ws) {
  console.log('Client connected')

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.onerror = function () {
    console.log("Some Error occurred");
  }

  ws.on("message", (msg) => {
    var buf = Buffer.from(msg);
    console.log(buf.toString());
    const interval = setTimeout(() => {
      ws.send('hello ' + msg)
    }, 1000)
  });

});