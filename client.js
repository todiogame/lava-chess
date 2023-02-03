const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const ordo = require ("./lib/ordo");

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

        if (type == "PLAYERS") PLAYERS = goGame(recreatePlayers(data));

    };
}
connect();

function recreatePlayers(data){
    return data.map(p => {
        let en = new Entity(p.entity.name, p.entity.team, p.entity.auras, p.entity.types, p.entity.pos, p.entity.maxHP)
        en.image = new Image();
        en.image.src = en.src;
        return new Playable(en, p.spells) 
    })
}


function goGame( PLAYERS) {
    console.log("recieved all, go game")
    let modeClic = "MOVE"
    let map = ordo.initMap(c.MAP_RADIUS);

    idCurrentPlayer = 0; //start with player1
    currentPlayer = PLAYERS[idCurrentPlayer]

    entities = [];
    PLAYERS.forEach(p => {
        entities.push(p.entity)
    })

    Anim.mainLoop()

}