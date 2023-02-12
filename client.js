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
var isListening = false;
var me = {};
var enemy = {};
hoverInfo = {};
displayAllHP = false;
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
    //alert("Disconnected from server");
    if (socket) {socket.close();
    cancelMatch();}
  };

  socket.onerror = function (error) {
    console.log("Error: " + error);
    if (socket) {socket.close();
      cancelMatch();}
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
      currentTeam = received.data;
    }

    if (received.type == "GAME_MODE") {
      if (received.data == c.GAME_MODE.DRAFT) goPickBan();
      // else if (received.data == c.GAME_MODE.QUICK)
      // goGame();
    }
    if (received.type == "PICKBAN") {
      pickPhase.playAction(received.data);
    }
    if (received.type == "ACTION") {
      logic.playAction(received.data);
    }
    if (received.type == "RAGEQUIT") {
      utils.endGame(true, "RAGEQUIT");
      if (socket) socket.close();
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

function goPickBan() {
  currentPlayer = 0;

  map = logic.initMap(c.CONSTANTS.MAP_RADIUS, "pickban");

  isPickPhase = true;
  pickOrBanIndex = 0; // c.CONSTANTS.PICK_BAN_ORDER[0]

  // hud.displayProfiles(me, enemy);
  pickPhase.initPickPhase();

  hud.switchToGameMode();
  if (!isListening) listenToInputs();
  if (!isAnimed) {
    isAnimed = true;
    Anim.mainLoop();
  }
}

function goGame() {
  console.log("START GAME");
  isPickPhase = false;
  hud.switchToGameMode();
  if (!isListening) listenToInputs();
  if (!isAnimed) {
    isAnimed = true;
    Anim.mainLoop();
  }

  entities = [];
  PLAYERS.forEach((p) => {
    entities.push(p.entity);
  });
  PLAYERS = drawing.loadImages(PLAYERS);
  //reinit map
  map = logic.initMap(c.CONSTANTS.MAP_RADIUS);
  idCurrentPlayer = 0;
  currentPlayer = PLAYERS[idCurrentPlayer];

  turnOrder.beginTurn(currentPlayer);
}
function addEventListeners() {
  const nameInput = document.getElementById("nickname");
  // Get the stored name from localStorage
  const storedName = localStorage.getItem("name");
  // Set the stored name as the value of the name input field
  if (storedName) {
    nameInput.value = storedName;
    document.getElementById("name").value = storedName;
  }
  // When the name input changes
  nameInput.addEventListener("input", function () {
    // Store the name in localStorage
    localStorage.setItem("name", nameInput.value);
  });

  document.getElementById("quick-match").addEventListener("click", quickMatch);
  document
    .getElementById("cancel-match")
    .addEventListener("click", cancelMatch);
}

function initGlobals() {
  map = [];
  currentPlayer = 0;
  projectiles = [];
  entities = [];
  particles = [];
  turnTimer = {};
}

function listenToInputs() {
  isListening = true;
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
        console.log("hit hud!", hitHUD);
        if (!hitHUD) logic.onMouseClicGame(mouseEventToHexCoord(event));
      }
    },
    false,
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "1" || event.key === "Q") {
      logic.clickSpell(0);
    } else if (event.key === "2" || event.key === "W") {
      logic.clickSpell(1);
    } else if (event.key === "3" || event.key === "E") {
      logic.clickSpell(2);
    } else if (event.key === "4" || event.key === "R") {
      logic.clickPassTurnOrRiseLava();
    } else if (event.key === "`" || event.key === "M") {
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
  const { x, y } = mouseEventToXY(event);
  let hPtClick = mouseEventToHexCoord(event);
  let hPtClickRound = hPtClick.round();
  hoverInfo.cell = hPtClickRound;
  let found = map.find((b) => hPtClickRound.distance(b) == 0);
  if (found) {
    hoverInfo.aoe = found.aoe;
    let ent = utils.findEntityOnCell(found);
    if (ent) {
      hoverInfo.entity = ent;
    } else hoverInfo.entity = null;
  } else {
    hoverInfo.aoe = null;
    hoverInfo.entity = null;
  }

  hoverInfo.element = undefined;
  if (currentPlayer) {
    let btnX = buttonSpell.w_offset - buttonSpell.width - 10;
    let btnY = buttonSpell.h_offset - buttonSpell.height;
    // console.log("X: " + x, btnX, btnX + buttonSpell.width)
    // console.log("Y: " + y, btnY, btnY + buttonSpell.height)
    if (
      x > btnX &&
      x < btnX + buttonSpell.width &&
      y > btnY &&
      y < btnY + buttonSpell.height
    ) {
      hoverInfo.element = c.GAMEDATA.MOVE_SPELL;
    }
    for (let i = 0; i < currentPlayer.spells.length; i++) {
      btnX = buttonSpell.w_offset + i * (buttonSpell.width + 10);
      if (
        x > btnX &&
        x < btnX + buttonSpell.width &&
        y > btnY &&
        y < btnY + buttonSpell.height
      ) {
        hoverInfo.element = currentPlayer.spells[i];
      }
    }
    btnX = (c.CANVAS.WIDTH * 7) / 10;
    if (
      x > btnX &&
      x < btnX + buttonSpell.width &&
      y > btnY &&
      y < btnY + buttonSpell.height
    ) {
      if (currentPlayer.isSummoned) hoverInfo.element = c.GAMEDATA.PASS_SPELL;
      else hoverInfo.element = c.GAMEDATA.LAVA_SPELL;
    }
  }
  // c.CANVAS.WIDTH - 330, 10, 150, 150
  if (
    Math.pow(x - (c.CANVAS.WIDTH - 330 + 75), 2) + Math.pow(y - (10 + 75), 2) <
    Math.pow(75, 2)
  ) {
    hoverInfo.help = true;
    PLAYERS.forEach(
      (p, i) =>
        (p.entity.currentOrder =
          (i - idCurrentPlayer + PLAYERS.length) % PLAYERS.length),
    );
  } else {
    hoverInfo.help = false;
  }
}

function quickMatch() {
  document.getElementById("quick-match").classList.add("disabled");
  document.getElementById("quick-match").setAttribute("disabled", true);
  document.getElementById("looking").style.display = "block";
  document.getElementById("cancel-match").style.display = "block";
  me.nickname = document.getElementById("nickname").value;
  //if (socket) socket.close();
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
  borderWidth: 5,
};
