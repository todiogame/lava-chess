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