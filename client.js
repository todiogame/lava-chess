const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const logic = require("./lib/client/gameLogic")
const Network = require("./lib/Network")
const config = require('./config.js');
const hud = require("./lib/client/hud")
const pickPhase = require("./lib/client/pickPhase")
const turnOrder = require("./lib/turnOrder")

var isAnimed = false;
var socket;

function connect() {

    initGlobals();

    if (socket) socket.close();
    socket = new WebSocket(`ws://${config.EXTERNAL_IP_ADDRESS}:${config.WEBSOCKET_PORT}`);
    socket.onopen = function (event) {
        console.log("Connected to server");
        Network.clientSocket = socket;
        console.log("Network.clientSocket", Network.clientSocket)
    };

    socket.onclose = function (event) {
        console.log("Disconnected from server");
        cancelMatch()
    };

    socket.onerror = function (error) {
        console.log("Error: " + error);
        cancelMatch()
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
        if (received.type == "starting_team") {
            goPickBan(received.data)
        }
        if (received.type == "PICKBAN") {
            pickPhase.playAction(received.data)
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

function goPickBan(startingTeam) {
    currentPlayer = 0;

    map = logic.initMap(c.CONSTANTS.MAP_RADIUS);


    isPickPhase = true;
    currentTeam = startingTeam;

    hud.switchToGameMode();


    pickPhase.initPickPhase();
    listenToMouse()

    if (!isAnimed) {
        isAnimed = true;
        Anim.mainLoop()
    }
}

function goGame() {
    console.log("START GAME")
    isPickPhase = false;
    
    entities = [];
    PLAYERS.forEach(p => {
        entities.push(p.entity)
    })
    // map = logic.initMap(c.CONSTANTS.MAP_RADIUS);
    idCurrentPlayer = 0;
    currentPlayer = PLAYERS[idCurrentPlayer]
    
    turnOrder.beginTurn(currentPlayer)
    // hud.switchToGameMode();

    //stop listenToMouse from pickphase
    // logic.listenToMouse()

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
    if (socket) socket.close();
    document.getElementById("quick-match").classList.remove("disabled");
    document.getElementById("quick-match").removeAttribute("disabled");
    document.getElementById("looking").style.display = "none";
    document.getElementById("cancel-match").style.display = "none";

}


function initGlobals() {
    currentPlayer = 0;
    projectiles = [];
    entities = [];
}



function listenToMouse() {
    console.log("listenToMouse logic")
    // modeClic = (TEAM == currentPlayer.entity.team) ? "MOVE" : ""; //todo regler modeclic

    // canvas.onmousemove = function (e) {
    canvas.addEventListener('mouseover', function (event) {
        // console.log("hover")
        if (!isPickPhase) logic.onMouseHoverGame(event)
    }, false)

    canvas.addEventListener('click', function (event) {
        console.log("click, current isPickPhase " + isPickPhase)

        if (isPickPhase) pickPhase.onMouseClicDraft(event)
        else logic.onMouseClicGame(event)
    }, false);

}