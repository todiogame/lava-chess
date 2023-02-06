const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const logic = require("./lib/client/gameLogic")
const Network = require("./lib/Network")
const config = require('./config.js');
const hud = require("./lib/client/hud")

var isAnimed = false;
var socket;
function connect() {
    if(socket) socket.close();
    socket = new WebSocket(`ws://${config.EXTERNAL_IP_ADDRESS}:${config.WEBSOCKET_PORT}`);
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
            // goGame();
        }
        if (received.type == "idCurrentPlayer") {
            idCurrentPlayer = received.data;
            goGame();
        }
        if (received.type == "ACTION") {
            logic.playAction(received.data)
        }
    };
}

function recreatePlayers(data) {
    return data.map(p => {
        let en = new Entity(p.entity.name, p.entity.team, p.entity.auras, p.entity.types, p.entity.pos, p.entity.maxHP)
        return new Playable(en, p.spells)
    })
}


function goGame() {
    console.log("START GAME")
    entities = [];
    projectiles = [];
    map = logic.initMap(c.CONSTANTS.MAP_RADIUS);
    currentPlayer = PLAYERS[idCurrentPlayer]


    PLAYERS.forEach(p => {
        entities.push(p.entity)
    })

    hud.switchToGameMode();

    logic.listenToMouse()
    if (!isAnimed) {
        isAnimed = true;
        Anim.mainLoop()
    }
}

document.getElementById("quick-match").addEventListener('click', quickMatch)
function quickMatch() {
    document.getElementById("quick-match").classList.add("disabled");
    document.getElementById("quick-match").setAttribute("disabled", true);
    document.getElementById("looking").style.display = "block";
    document.getElementById("cancel-match").style.display = "block";
    connect()
}

document.getElementById("cancel-match").addEventListener('click', cancelMatch)
function cancelMatch() {
    if(socket) socket.close();
    document.getElementById("quick-match").classList.remove("disabled");
    document.getElementById("quick-match").removeAttribute("disabled");
    document.getElementById("looking").style.display = "none";
    document.getElementById("cancel-match").style.display = "none";

}