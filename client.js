const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const logic = require("./lib/client/gameLogic")
const Network = require("./lib/Network")
const config = require('./config.js');

var isAnimed = false;

function connect() {
    var socket = new WebSocket(`ws://${config.IP_ADDRESS}:${config.WEBSOCKET_PORT}`);
    socket.onopen = function (event) {
        console.log("Connected to server");
        Network.clientSocket = socket;
        console.log("Network.clientSocket", Network.clientSocket)
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
        if (received.type == "TEAM") {
            TEAM = received.data;
            console.log("we are team ", TEAM)
        }

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
    map = logic.initMap(c.CONSTANTS.MAP_RADIUS);

    idCurrentPlayer = 0; //start with player1
    currentPlayer = PLAYERS[idCurrentPlayer]

    entities = [];
    projectiles = [];

    PLAYERS.forEach(p => {
        entities.push(p.entity)
    })
    logic.listenToMouse()
    if (!isAnimed) {
        isAnimed = true;
        Anim.mainLoop()
    }
}
