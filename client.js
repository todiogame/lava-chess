const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const ordo = require("./lib/ordo");
const logic = require("./lib/gameLogic")
const Network = require("./lib/Network")

function connect() {
    var socket = new WebSocket("ws://localhost:8081");

    socket.onopen = function (event) {
        console.log("Connected to server");
        Network.clientSocket = socket;
        console.log("Network.clientSocket",Network.clientSocket)
    };

    socket.onclose = function (event) {
        console.log("Disconnected from server");
    };

    socket.onerror = function (error) {
        console.log("Error: " + error);
    };

    socket.onmessage = function (event) {
        // console.log(event)
        const received = Network.decode(event.data);
        // console.log("received")
        // console.log(received)

        if (received.type == "PLAYERS") {
            PLAYERS = recreatePlayers(received.data)
            goGame();
        }
        if (received.type == "ACTION") {
            logic.playAction(received.data)
        }
    };
}
connect();

function recreatePlayers(data) {
    return data.map(p => {
        let en = new Entity(p.entity.name, p.entity.team, p.entity.auras, p.entity.types, p.entity.pos, p.entity.maxHP)
        return new Playable(en, p.spells)
    })
}


function goGame() {
    // console.log("recieved all, go game")
    CLIENT_SIDE = true;
    map = ordo.initMap(c.CONSTANTS.MAP_RADIUS);

    idCurrentPlayer = 0; //start with player1
    currentPlayer = PLAYERS[idCurrentPlayer]

    entities = [];
    PLAYERS.forEach(p => {
        entities.push(p.entity)
    })
    logic.listenToMouse()
    Anim.mainLoop()

}
