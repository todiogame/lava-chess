const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const ordo = require("./lib/ordo");
const logic = require("./lib/gameLogic")

var socket;

function connect() {
    socket = new WebSocket("ws://localhost:8081");

    socket.onopen = function (event) {
        console.log("Connected to server");
    };

    socket.onclose = function (event) {
        console.log("Disconnected from server");
    };

    socket.onerror = function (error) {
        console.log("Error: " + error);
    };

    socket.onmessage = function (event) {
        const { type, data } = JSON.parse(event.data);

        if (type == "PLAYERS") {
            PLAYERS = recreatePlayers(data)
            goGame();
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
    console.log("recieved all, go game")
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