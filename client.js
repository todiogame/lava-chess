const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const logic = require("./lib/gameLogic");
const Network = require("./lib/Network");
const config = require("./config.js");
const hud = require("./lib/client/hud");
const pickPhase = require("./lib/client/pickPhase");
const turnOrder = require("./lib/turnOrder");
const utils = require("./lib/gameUtils");
const drawing = require("./lib/client/drawing");
const interface = require("./lib/client/interface");
const OngoingGame = require("./lib/OngoingGame")
const data = require("./lib/client/data")

var me = {};
var enemy = {};
hoverInfo = {};
displayAllHP = false;
var socket;
var ongoingGame;
storedData = data.retrieve();
storedData.updateHTML();
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
    if (socket) {
      socket.close();
      cancelMatch();
    }
  };

  socket.onerror = function (error) {
    console.log("Error: " + error);
    alert("Disconnected from server");
    if (socket) {
      socket.close();
      cancelMatch();
    }
  };

  socket.onmessage = function (event) {
    // console.log(event)
    const received = Network.decode(event.data);
    console.log("received "+received.type)
    // console.log(received.type)
    if (received.type == "INFO") {
      if (received.data.nickname) enemy.nickname = received.data.nickname;
      // hud.displayProfiles(me, enemy);
    }

    if (received.type == "TEAM") {
      TEAM = received.data;
      console.log("we are team ", TEAM);
    }

    if (received.type == "PLAYERS") {
      let players = recreatePlayers(received.data);
      // goGame(players);
      startGameAfterDraft(ongoingGame, players);
    }
    if (received.type == "GAME_MODE") {
      if (received.data == c.GAME_MODE.DRAFT) goGamePickBan();
      // else if (received.data == c.GAME_MODE.QUICK)
      // goGame();
    }
    if (received.type == "PICKBAN") {
      pickPhase.playAction(received.data, ongoingGame);
    }
    if (received.type == "ACTION") {
      // console.log("received "+received.data)
      logic.playAction(received.data, ongoingGame);
    }
    if (received.type == "RAGEQUIT") {
      utils.endGame(true, "RAGEQUIT");
      if (socket) socket.close();
    }
    if (received.type == "END_GAME") {
      console.log("received endgame")
      utils.waitAnimationThenDisplayEndScreen(TEAM == received.data, ongoingGame); // wait before calling endGame so we can see the animations
      canvas.removeEventListener('click', canvasEventListener)
      og.isListening = false
      if (socket) socket.close();
    }
  };
}

function recreatePlayers(data) {
  console.log("recreatePlayers", data);
  return data.map((p) => {
    let en = new Entity(
      p.entity.id,
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

function goGamePickBan() {
  currentPlayer = 0;
  this.og = new OngoingGame(true)
  ongoingGame = og;

  // map = logic.initMap(c.CONSTANTS.MAP_RADIUS, "pickban");

  // og.isPickPhase = true;
  // pickOrBanIndex = 0; // c.CONSTANTS.PICK_BAN_ORDER[0]

  // hud.displayProfiles(me, enemy);
  pickPhase.initPickPhase(og);

  console.log("START DRAFT");
  hud.switchToGameMode();

  // drawing.layout = drawing.makeLayout(og);


  if (!og.isListening) listenToInputs(og);
  if (!og.isAnimed) {
    og.isAnimed = true;
    console.log("start anim")
    Anim.mainLoop(og);
  }
  // startGame(og);

}

function startGameAfterDraft(og, players) {
  console.log("startGame")
  og.setPLAYERS(players)
  og.PLAYERS = drawing.loadImages(og.PLAYERS);
  turnOrder.beginTurn(og);

}


// quick game
function goGame(players) {
  console.log("START GAME");
  og.isPickPhase = false;
  hud.switchToGameMode();
  og = new OngoingGame(false, players)
  og.PLAYERS = drawing.loadImages(og.PLAYERS);
  ongoingGame = og;
  turnOrder.beginTurn(og);
  if (!og.isListening) listenToInputs(og);
  if (!og.isAnimed) {
    og.isAnimed = true;
    console.log("start anim")
    Anim.mainLoop(og);
  }
}


function addEventListeners() {
  const nameInput = document.getElementById("nickname");
  // Set the stored name as the value of the name input field
  if (storedData.username) {
    nameInput.value = storedData.username;
  }
  // When the name input changes
  // Store the name in localStorage
  nameInput.addEventListener("input", function () {
    storedData.username = nameInput.value;
    data.save(storedData)
  });

  document.getElementById("quick-match").addEventListener("click", quickMatch);
  document
    .getElementById("cancel-match")
    .addEventListener("click", cancelMatch);
}

function initGlobals() {
  // map = [];
  // currentPlayer = 0;
  projectiles = [];
  // entities = [];
  particles = [];
}
var canvasEventListener;

function listenToInputs(og) {
  og.isListening = true;
  canvas.onmousemove = function (event) {
    generateTooltipInfo(event, og);
    if (og.isPickPhase) pickPhase.onMouseHoverDraft(mouseEventToHexCoord(event), og);
    if (!og.isPickPhase) interface.onMouseHoverGame(mouseEventToHexCoord(event), og);
  };

  canvasEventListener = (event) => {
    const { x, y } = mouseEventToXY(event);
    if (!og.isPickPhase) {
      let hitHUD = interface.onMouseClicHUD(x, y, og);
      // console.log("hit hud!", hitHUD);
      if (!hitHUD)
        interface.onMouseClicGame(mouseEventToHexCoord(event), og);
    } else {
      pickPhase.onMouseClicDraft(mouseEventToHexCoord(event), og);

    }
  }

  canvas.addEventListener(
    "click",
    canvasEventListener,
    false,
  );



  document.addEventListener("keydown", (event) => {
    if (event.key === "1" || event.key === "Q") {
      interface.clickSpell(0, og);
    } else if (event.key === "2" || event.key === "W") {
      interface.clickSpell(1, og);
    } else if (event.key === "3" || event.key === "E") {
      interface.clickSpell(2, og);
    } else if (event.key === "4" || event.key === "R") {
      interface.clickPassTurnOrRiseLava(og);
    } else if (event.key === "`" || event.key === "M") {
      interface.clickMove(og);
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

function generateTooltipInfo(event, og) {
  const { x, y } = mouseEventToXY(event);
  let hPtClick = mouseEventToHexCoord(event);
  let hPtClickRound = hPtClick.round();
  hoverInfo.cell = hPtClickRound;
  let found = og.map.find((b) => hPtClickRound.distance(b) == 0);
  if (found) {
    hoverInfo.aoe = found.aoe;
    let ent = utils.findEntityOnCell(found, og);
    if (ent) {
      hoverInfo.entity = ent;
    } else hoverInfo.entity = null;
  } else {
    hoverInfo.aoe = null;
    hoverInfo.entity = null;
  }

  hoverInfo.element = undefined;
  if (og.currentPlayer) {
    let usersNextPLayer = utils.findNextPlayer(og, TEAM);
    if (!usersNextPLayer) usersNextPLayer = og.PLAYERS.find(p => p.entity.team == TEAM);
    if (usersNextPLayer) makeHoverInfoSpell(buttonSpell1, usersNextPLayer, true) //bottom row

    let selectedEntity = og.entities.find(e => e.selected)
    let foundSelectedPlayer = utils.findPlayerFromEntity(selectedEntity, og);
    let selectedPlayer = foundSelectedPlayer ? foundSelectedPlayer : og.currentPlayer;
    if (selectedPlayer && (selectedPlayer != og.currentPlayer || selectedPlayer.entity.team != TEAM)) makeHoverInfoSpell(buttonSpell2, selectedPlayer, false) //top left
  }
  // c.CANVAS.WIDTH - 330, 10, 150, 150
  if (
    Math.pow(x - (c.CANVAS.WIDTH - 330 + 75), 2) + Math.pow(y - (10 + 75), 2) <
    Math.pow(75, 2)
  ) {
    hoverInfo.help = true;
    let playingPlayers = og.PLAYERS.filter(p => !p.dead)
    playingPlayers.forEach(
      (p, i) =>
      (p.entity.currentOrder =
        (i - playingPlayers.indexOf(og.currentPlayer) + playingPlayers.length) % playingPlayers.length),
    );
  } else {
    hoverInfo.help = false;
  }

  function makeHoverInfoSpell(buttonSpell, player, bottomRow) {
    let btnX = buttonSpell.w_offset;
    let btnY = buttonSpell.h_offset - buttonSpell.height;
    // console.log("X: " + x, btnX, btnX + buttonSpell.width)
    // console.log("Y: " + y, btnY, btnY + buttonSpell.height)
    if (x > btnX &&
      x < btnX + buttonSpell.width &&
      y > btnY &&
      y < btnY + buttonSpell.height) {
      hoverInfo.element = c.GAMEDATA.MOVE_SPELL;
    }
    for (let i = 0; i < player.spells.length; i++) {
      btnX = buttonSpell.w_offset + (i + 1) * (buttonSpell.width + 10);
      if (x > btnX &&
        x < btnX + buttonSpell.width &&
        y > btnY &&
        y < btnY + buttonSpell.height) {
        hoverInfo.element = player.spells[i];
      }
    }
    if (bottomRow) {
      btnX = (c.CANVAS.WIDTH * 7) / 10;
      if (x > btnX &&
        x < btnX + buttonSpell.width &&
        y > btnY &&
        y < btnY + buttonSpell.height) {
        if (player.isSummoned)
          hoverInfo.element = c.GAMEDATA.PASS_SPELL;
        else
          hoverInfo.element = c.GAMEDATA.LAVA_SPELL;
      }
    }
  }
}

function quickMatch() {
  document.getElementById("quick-match").classList.add("disabled");
  document.getElementById("quick-match").setAttribute("disabled", true);
  document.getElementById("looking").style.display = "block";
  document.getElementById("cancel-match").style.display = "block";
  document.getElementById("game-result").style = "display:flex;";
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
buttonSpell1 = {
  width: 100,
  height: 100,
  w_offset: c.CANVAS.WIDTH / 10 - 110,
  h_offset: c.CANVAS.HEIGHT - 30,
  borderColor: "yellow",
  borderColorEnemyTurn: "grey",
  borderWidth: 5,
};
buttonSpell2 = {
  width: 50,
  height: 50,
  w_offset: c.CANVAS.WIDTH / 10 - 105,
  h_offset: 350,
  borderColor: "yellow",
  borderColorEnemyTurn: "grey",
  borderWidth: 5,
};