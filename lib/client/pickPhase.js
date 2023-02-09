const c = require("../const");
const { Hex } = require("../Hex");
const Entity = require("../Entity");
const utils = require("../gameUtils");
const drawing = require("./drawing");
const Network = require("../Network");
const Anim = require("./Anim");

function onMouseHoverDraft(hexagon) {
  entities.forEach((e) => (e.hovered = false));

  let hPtHover = hexagon;
  let hPtHoverRound = hPtHover.round();

  let found = map.find((b) => hPtHoverRound.equals(b));
  if (found) {
    let entHover = utils.findEntityOnCell(found);
    if (entHover) entHover.hovered = true;
  }
}

function onMouseClicDraft(hexagon) {
  if (TEAM == currentTeam) {
    let hPtClick = hexagon;
    let hPtClickRound = hPtClick.round();

    let found = map.find((b) => hPtClickRound.distance(b) == 0);
    if (found) {
      let ent = utils.findEntityOnCell(found);
      //pick
      if (
        c.CONSTANTS.PICK_BAN_ORDER[pickOrBanIndex] == "PICK" &&
        entities.find((e) => e.selected) &&
        utils.isSpawn(found, TEAM) &&
        utils.isFree(found) &&
        found.floor
      ) {
        let selectedEnt = entities.find((e) => e.selected);
        Network.clientSendPickBan("PICK", found, selectedEnt.name);
        passTurnPick(selectedEnt, found.copy());
        selectedEnt.selected = false;
      }
      // ban
      if (
        c.CONSTANTS.PICK_BAN_ORDER[pickOrBanIndex] == "BAN" &&
        entities.find((e) => e.selected) &&
        utils.isBanArea(found)
      ) {
        let selectedEnt = entities.find((e) => e.selected);
        Network.clientSendPickBan("BAN", found, selectedEnt.name);
        passTurnBan(selectedEnt, found);
        selectedEnt.selected = false;
      } else if (ent && !utils.isSpawn(found, "ANY")) {
        entities.forEach((e) => (e.selected = false));
        ent.selected = true;
      } else {
        entities.forEach((e) => (e.selected = false));
      }
    }
  } else {
    console.log("not your turn !");
  }
}

function passTurnBan(entity, cell) {
  Anim.lavaParticles(cell);

  console.log("banned ", entity.name);
  entities = entities.filter((e) => e != entity);
  currentTeam =
    currentTeam == c.CONSTANTS.TEAM_RED
      ? c.CONSTANTS.TEAM_BLUE
      : c.CONSTANTS.TEAM_RED;
  pickOrBanIndex++;
  console.log(
    "now " +
      currentTeam +
      "'s turn to " +
      c.CONSTANTS.PICK_BAN_ORDER[pickOrBanIndex],
  );
}

function passTurnPick(entity, cell) {
  console.log("picked ", entity.name);
  entity.pos = cell;
  entity.team = currentTeam;
  currentTeam =
    currentTeam == c.CONSTANTS.TEAM_RED
      ? c.CONSTANTS.TEAM_BLUE
      : c.CONSTANTS.TEAM_RED;
  pickOrBanIndex++;
  if (pickOrBanIndex < c.CONSTANTS.PICK_BAN_ORDER.length)
    console.log(
      "now " +
        currentTeam +
        "'s turn to " +
        c.CONSTANTS.PICK_BAN_ORDER[pickOrBanIndex],
    );
  //when draft is finished, server should take over and initiate the game
}

function playAction(action) {
  if (action) {
    // console.log("pickphase play action ", action)
    let found;
    if (action.cell) found = map.find((b) => b.equals(action.cell));
    if (found) {
      if (action.kind == "PICK") {
        passTurnPick(utils.findEntityByName(action.entityName), found.copy());
      } else if (action.kind == "BAN") {
        passTurnBan(utils.findEntityByName(action.entityName), found.copy());
      }
    }
  }
}

function initPickPhase() {
  let q, r;
  for (let i = 0; i < c.GAMEDATA.CHARACTERS.length; i++) {
    if (i < 6) {
      q = i - 2;
      r = -1;
    } else if (i < 12) {
      q = i - 9 + (i <= 8 ? 0 : 1);
      r = 0;
    } else if (i < 18) {
      q = i - 15;
      r = 1;
    } else {
      q = i - 23;
      r = 2;
    }
    // console.log(q, r)
    let newEntity = new Entity(
      c.GAMEDATA.CHARACTERS[i].name,
      undefined,
      [],
      [],
      new Hex(q, r),
      4,
    );
    //give spells to these entities to display in hud when hovered
    Object.assign(newEntity, c.GAMEDATA.CHARACTERS[i]);
    newEntity.currentHP = 3; //test to delete
    newEntity.spellsDisplay = c.GAMEDATA.CHARACTERS[i].spells;
    entities.push(newEntity);
  }
}
module.exports = {
  initPickPhase,
  onMouseClicDraft,
  onMouseHoverDraft,
  playAction,
};
