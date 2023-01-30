import { WebSocketServer } from 'ws';
import { aaa } from "./lib/testlib.js";

const server = new WebSocketServer({ port: 8080 });

const clients = [];
server.on("connection", (ws) => {
  console.log("Client connected"+aaa);
  clients.push(ws);

  if (clients.length % 2 === 0) {
    const clientA = clients[clients.length - 2];
    const clientB = clients[clients.length - 1];

    clientA.other = clientB;
    clientB.other = clientA;

    startGame(clientA, clientB);
  }

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    handleMessage(ws, message);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.splice(clients.indexOf(ws), 1);
  });
});

function startGame(clientA, clientB) {
  const target = Math.floor(Math.random() * 100) + 1;
  clientA.isTurn = true;
  clientB.isTurn = false;
  clientA.target = target;
  clientB.target = target;
  clientA.send("Your turn. Guess a number between 1 and 100.");
}

function handleMessage(ws, message) {
  if (!ws.isTurn) {
    ws.send("It's not your turn.");
    return;
  }

  const guess = parseInt(message);
  if (isNaN(guess)) {
    ws.send("Invalid input. Please enter a number.");
    return;
  }

  if (guess === ws.target) {
    ws.send("You won!");
    ws.other.send("You lost.");
  } else if (guess < ws.target) {
    ws.send("Too low. Guess again.");
    ws.isTurn = false;
    ws.other.isTurn = true;
    ws.other.send("Your turn. Guess a number between 1 and 100.");
  } else {
    ws.send("Too high. Guess again.");
    ws.isTurn = false;
    ws.other.isTurn = true;
    ws.other.send("Your turn. Guess a number between 1 and 100.");
  }
}
