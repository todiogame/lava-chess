const c = require("../const");
const { Hex } = require("../Hex");
const Entity = require("../Entity")
const utils = require("../gameUtils")
const drawing = require("./drawing")
const Network = require("../Network");
const Playable = require("../Playable");

function onMouseHoverDraft(e) {
    entities.forEach(e => e.hovered = false)

    let hPtHover = drawing.findHexFromEvent(e.pageX, e.pageY);
    let hPtHoverRound = (hPtHover.round());

    let found = map.find(b => hPtHoverRound.equals(b));
    if (found) {
        let entHover = utils.findEntityOnCell(found);
        if(entHover) entHover.hovered = true;
        //todo affiche les infos en hud
    }
}

function onMouseClicDraft(event) {
    console.log(currentTeam);

    if (TEAM == currentTeam) {
        console.log("mon tour !");
        let hPtClick = drawing.findHexFromEvent(event.pageX, event.pageY);
        let hPtClickRound = (hPtClick.round());


        let found = map.find(b => hPtClickRound.distance(b) == 0);
        if (found) {
            console.log(utils.isSpawn(found, TEAM));
            let ent = utils.findEntityOnCell(found);
            if (entities.find(e => e.selected) && utils.isSpawn(found, TEAM) && utils.isFree(found) && found.floor) {
                let selectedEnt = entities.find(e => (e.selected));
                Network.clientSendPickBan("PICK", found, selectedEnt.name);
                passTurnPick(selectedEnt, found.copy());
                selectedEnt.selected = false;
            }
            // ban on verra plus tard
            // if (utils.isBanArea(found) && utils.isFree(found)) {
            // }
            else if (ent && !utils.isSpawn(found, "ANY") ) {
                entities.forEach(e => e.selected = false);
                ent.selected = true;
            } else {
                entities.forEach(e => e.selected = false);
            }
        }

    } else {
        console.log("not your turn !");
    }
}

function passTurnPick(entity, cell) {
    console.log("picked ", entity.name)
    entity.pos = cell;
    entity.team = currentTeam;
    currentTeam = (currentTeam == c.CONSTANTS.TEAM_RED) ? c.CONSTANTS.TEAM_BLUE : c.CONSTANTS.TEAM_RED;
    console.log("now " + currentTeam + "'s turn")
    //when draft is finished, server should take over and initiate the game
}

function playAction(action) {
    if (action) {
        console.log("pickphase play action ", action)
        let found;
        if (action.cell) found = map.find(b => b.equals(action.cell));
        if (found) {
            //action is MOVE, SPELL, or LAVA
            // if (action.kind == "BAN") {
            // }
            // else
            if (action.kind == "PICK") {
                passTurnPick(utils.findEntityByName(action.entityName), found.copy());
            }
        }

    }
}


function initPickPhase() {
    let q, r;
    for (let i = 0; i < c.GAMEDATA.CHARACTERS.length; i++) {
        if (i < 6) {
            q = i - 2
            r = -1
        } else if (i < 13) {
            q = i - 9 + (i < 12 ? 1 : 0)
            r = 0
        } else if (i < 19) {
            q = i - 16
            r = 1
        } else {
            q = i - 23
            r = 2
        }
        // c.GAMEDATA.CHARACTERS[i]
        console.log(q, r)
        let newEntity =(new Entity(c.GAMEDATA.CHARACTERS[i].name,
            undefined,
            [], [],
            new Hex(q, r), 1))
        //give spells to these entities to display in hud when hovered
        newEntity.spellsDisplay = c.GAMEDATA.CHARACTERS[i].spells
        entities.push(newEntity)
    }
}
module.exports = {
    initPickPhase, onMouseClicDraft, onMouseHoverDraft, playAction
};