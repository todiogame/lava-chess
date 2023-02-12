const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const logic = require("./lib/client/gameLogic");
const Network = require("./lib/Network");
const config = require("./config.js");
const hud = require("./lib/client/hud");
const pickPhase = require("./lib/client/pickPhase");
const turnOrder = require("./lib/turnOrder");
const utils = require("./lib/gameUtils");
const drawing = require("./lib/client/drawing");

var isAnimed = false;
var me = {};
var enemy = {};
hoverInfo = {};
var socket;
addEventListeners();

function connect() {
  initGlobals();

  if (socket) socket.close();
  socket = new WebSocket(
    `ws://${config.EXTERNAL_IP_ADDRESS}:${config.WEBSOCKET_PORT}`,
  );
  socket.onopen = function (event) {
    console.log("Connected to server");
    Network.clientSocket = socket;
    if (me.nickname) Network.clientSendInfo({ nickname: me.nickname });
  };

  socket.onclose = function (event) {
    console.log("Disconnected from server");
    alert("Disconnected from server");
    cancelMatch();
  };

  socket.onerror = function (error) {
    console.log("Error: " + error);
    cancelMatch();
  };

  socket.onmessage = function (event) {
    // console.log(event)
    const received = Network.decode(event.data);
    // console.log("received")
    // console.log(received)
    if (received.type == "INFO") {
      if (received.data.nickname) enemy.nickname = received.data.nickname;
      // hud.displayProfiles(me, enemy);
    }

    if (received.type == "TEAM") {
      TEAM = received.data;
      console.log("we are team ", TEAM);
    }

    if (received.type == "PLAYERS") {
      PLAYERS = recreatePlayers(received.data);
      goGame();
    }
    if (received.type == "starting_team") {
      goPickBan(received.data);
    }
    if (received.type == "PICKBAN") {
      pickPhase.playAction(received.data);
    }
    if (received.type == "ACTION") {
      logic.playAction(received.data);
    }
    if (received.type == "RAGEQUIT") {
      utils.win(TEAM, "OPPONENT RAGEQUIT");
    }
  };
}

function recreatePlayers(data) {
  console.log("recreatePlayers", data);
  return data.map((p) => {
    let en = new Entity(
      p.entity.name,
      p.entity.team,
      p.entity.auras,
      p.entity.types,
      p.entity.pos,
      p.entity.maxHP,
    );
    return new Playable(en, p.spells);
  });
}

function goPickBan(startingTeam) {
  currentPlayer = 0;

  map = logic.initMap(c.CONSTANTS.MAP_RADIUS, "pickban");

  isPickPhase = true;
  currentTeam = startingTeam;
  pickOrBanIndex = 0; // c.CONSTANTS.PICK_BAN_ORDER[0]

  // hud.displayProfiles(me, enemy);
  hud.switchToGameMode();

  pickPhase.initPickPhase();
  listenToInputs();

  if (!isAnimed) {
    isAnimed = true;
    Anim.mainLoop();
  }
}

function goGame() {
  console.log("START GAME");
  isPickPhase = false;

  entities = [];
  PLAYERS.forEach((p) => {
    entities.push(p.entity);
  });
  PLAYERS = drawing.loadImages(PLAYERS)
  //reinit map
  map = logic.initMap(c.CONSTANTS.MAP_RADIUS);
  idCurrentPlayer = 0;
  currentPlayer = PLAYERS[idCurrentPlayer];

  turnOrder.beginTurn(currentPlayer);
}
function addEventListeners() {
  document.getElementById("quick-match").addEventListener("click", quickMatch);
  document
    .getElementById("cancel-match")
    .addEventListener("click", cancelMatch);
  // window.addEventListener("resize", drawing.resizeCanvas);
}

function initGlobals() {
  currentPlayer = 0;
  projectiles = [];
  entities = [];
  particles = [];
  turnTimer = {};
}

function listenToInputs() {
  canvas.onmousemove = function (event) {
    generateTooltipInfo(event);
    pickPhase.onMouseHoverDraft(mouseEventToHexCoord(event));
    if (!isPickPhase) logic.onMouseHoverGame(mouseEventToHexCoord(event));
  };
  canvas.addEventListener(
    "click",
    function (event) {
      if (isPickPhase) pickPhase.onMouseClicDraft(mouseEventToHexCoord(event));
      else {
        const { x, y } = mouseEventToXY(event);
        let hitHUD = logic.onMouseClicHUD(x, y);
        console.log("hit hud!", hitHUD)
        if (!hitHUD) logic.onMouseClicGame(mouseEventToHexCoord(event));
      }
    },
    false,
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "1") {
      logic.clickSpell(0);
    } else if (event.key === "2") {
      logic.clickSpell(1);
    } else if (event.key === "3") {
      logic.clickSpell(2);
    } else if (event.key === "4") {
      logic.clickPassTurnOrRiseLava();
    } else if (event.key === "`") {
      logic.clickMove();
    }
  });
}

function mouseEventToHexCoord(e) {
  const { x, y } = mouseEventToXY(e);
  return drawing.findHexFromEvent(x, y);
}

function mouseEventToXY(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / c.CANVAS.WIDTH;
  const scaleY = canvas.height / c.CANVAS.HEIGHT;
  const x = (e.clientX - rect.left) / scaleX;
  const y = (e.clientY - rect.top) / scaleY;
  return { x, y };
}

function generateTooltipInfo(event) {
  let hPtClick = mouseEventToHexCoord(event)
  let hPtClickRound = hPtClick.round();
  hoverInfo.cell = hPtClickRound;
  let found = map.find((b) => hPtClickRound.distance(b) == 0);
  if (found) {
    console.log("hover map")
    hoverInfo.aoe = found.aoe;
    let ent = utils.findEntityOnCell(found);
    if (ent) {
      hoverInfo.entity = ent;
    } else hoverInfo.entity = null;
  } else {
    console.log("hover not map ")
    hoverInfo.aoe = null;
    hoverInfo.entity = null;
  }
  hoverInfo.element = undefined;
  if (currentPlayer) {
    const { x, y } = mouseEventToXY(event);
    let btnX = buttonSpell.w_offset - (buttonSpell.width) - 10;
    let btnY = buttonSpell.h_offset - buttonSpell.height;
    // console.log("X: " + x, btnX, btnX + buttonSpell.width)
    // console.log("Y: " + y, btnY, btnY + buttonSpell.height)
    if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
      hoverInfo.element = c.GAMEDATA.MOVE_SPELL
    }
    for (let i = 0; i < currentPlayer.spells.length; i++) {
      btnX = buttonSpell.w_offset + i * (buttonSpell.width + 10);
      if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
        hoverInfo.element = currentPlayer.spells[i]
      }
    }
    btnX = c.CANVAS.WIDTH * 7 / 10
    if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
      if (currentPlayer.isSummoned)
        hoverInfo.element = c.GAMEDATA.PASS_SPELL
      else
        hoverInfo.element = c.GAMEDATA.LAVA_SPELL
    }
  }
}

function quickMatch() {
  document.getElementById("quick-match").classList.add("disabled");
  document.getElementById("quick-match").setAttribute("disabled", true);
  document.getElementById("looking").style.display = "block";
  document.getElementById("cancel-match").style.display = "block";
  me.nickname = document.getElementById("nickname").value;
  connect();
}
function cancelMatch() {
  if (socket) socket.close();
  document.getElementById("quick-match").classList.remove("disabled");
  document.getElementById("quick-match").removeAttribute("disabled");
  document.getElementById("looking").style.display = "none";
  document.getElementById("cancel-match").style.display = "none";
}
// Define the buttonSpell properties
buttonSpell = {
  width: 100,
  height: 100,
  w_offset: c.CANVAS.WIDTH / 10,
  h_offset: c.CANVAS.HEIGHT - 30,
  borderColor: "yellow",
  borderWidth: 5
};