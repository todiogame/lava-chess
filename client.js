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
const utils = require("./lib/gameUtils");
const drawing = require("./lib/client/drawing");

var isAnimed = false;
var me = {}
var enemy = {}
addEventListeners();

function connect() {
    var socket;

    initGlobals();

    if (socket) socket.close();
    socket = new WebSocket(`ws://${config.EXTERNAL_IP_ADDRESS}:${config.WEBSOCKET_PORT}`);
    socket.onopen = function (event) {
        console.log("Connected to server");
        Network.clientSocket = socket;
        if(me.nickname) Network.clientSendInfo({ "nickname": me.nickname })
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
        if (received.type == "INFO") {
            if(received.data.nickname) enemy.nickname = received.data.nickname;
            hud.displayProfiles(me, enemy);
        }
        
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
        if (received.type == "RAGEQUIT") {
            utils.win(TEAM, "OPPONENT RAGEQUIT")
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

    map = logic.initMap(c.CONSTANTS.MAP_RADIUS, "pickban");


    isPickPhase = true;
    currentTeam = startingTeam;
    pickOrBanIndex = 0; // c.CONSTANTS.PICK_BAN_ORDER[0]

    hud.displayProfiles(me, enemy);
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
    //reinit map
    map = logic.initMap(c.CONSTANTS.MAP_RADIUS);
    idCurrentPlayer = 0;
    currentPlayer = PLAYERS[idCurrentPlayer]

    turnOrder.beginTurn(currentPlayer)
}
function addEventListeners() {
    document.getElementById("quick-match").addEventListener('click', quickMatch)
    function quickMatch() {
        document.getElementById("quick-match").classList.add("disabled");
        document.getElementById("quick-match").setAttribute("disabled", true);
        document.getElementById("looking").style.display = "block";
        document.getElementById("cancel-match").style.display = "block";
        me.nickname = document.getElementById("nickname").value;
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

    window.addEventListener("resize", drawing.resizeCanvas);

}

function initGlobals() {
    currentPlayer = 0;
    projectiles = [];
    entities = [];
}



function listenToMouse() {
   

    canvas.onmousemove = function (event) {
        if (isPickPhase) pickPhase.onMouseHoverDraft(mouseEventToHexCoord(event))
        else logic.onMouseHoverGame(mouseEventToHexCoord(event))
    }

    canvas.addEventListener('click', function (event) {
        if (isPickPhase) pickPhase.onMouseClicDraft(mouseEventToHexCoord(event))
        else logic.onMouseClicGame(mouseEventToHexCoord(event))
    }, false);

}

function mouseEventToHexCoord(e){
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / 700;
    const scaleY = canvas.height / 600;
    const x = (e.clientX - rect.left) / scaleX;
    const y = (e.clientY - rect.top) / scaleY;

    // console.log("from "+e.pageX+" "+e.pageY+" to "+x+" "+y)

    return drawing.findHexFromEvent(x,y)
    
}