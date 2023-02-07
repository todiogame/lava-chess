const c = require("../const");
const { Hex } = require("../Hex");
const Entity = require("../Entity")
const utils = require("../gameUtils")
const drawing = require("./drawing")
const Network = require("../Network");
const Playable = require("../Playable");


var modePick = "ENTITY"

// function listenToMouse() {

//     canvas.onmousemove = function (e) {
//         // console.log("hover")
//         map.map(b => b.hoverMove = b.hoverSpell = false)

//         let hPtHover = drawing.findHexFromEvent(e.pageX, e.pageY)
//         let hPtHoverRound = (hPtHover.round());

//         let found = map.find(b => hPtHoverRound.distance(b) == 0);
//         if (found) {
//             //todo slightly surbrillance et affiche les infos en hud
//         }
//     }

//     canvas.addEventListener('click', function (event) {
//         modePick = onMouseClicDraft(event);
//     }, false);

// }

function onMouseClicDraft( event) {
    console.log(currentTeam);
    console.log(modePick);

    if (TEAM == currentTeam) {
        console.log("mon tour !");
        let hPtClick = drawing.findHexFromEvent(event.pageX, event.pageY);
        let hPtClickRound = (hPtClick.round());


        let found = map.find(b => hPtClickRound.distance(b) == 0);
        if (found) {
            if (modePick == "CELL") {
                console.log(found);
                if (utils.isSpawn(found, "ANY") && utils.isFree(found) && found.floor) {
                    let ent = entities.find(e => (e.selected));
                    ent.selected = false;
                    Network.clientSendPickBan("PICK", found, ent.name);
                    passTurnPick(ent, found.copy());
                }
                //todo ban on verra plus tard
                // if (utils.isBanArea(found) && utils.isFree(found)) {
                //     let ent = entities.find(e => (e.selected))
                //     ent.pos = found.copy();
                //     ent.selected = false;
                //     Network.clientSendPickBan("BAN", found, ent.name)
                //     passTurnPick()
                // }
                modePick = "ENTITY";
                entities.forEach(e => e.selected = false);
            } else {
                let ent = utils.findEntityOnCell(found);
                if (ent) {
                    entities.forEach(e => e.selected = false);
                    ent.selected = true;
                    modePick = "CELL";
                }
            }

        } else {
            modePick = "ENTITY";
            entities.forEach(e => e.selected = false);
        }

    } else {
        console.log("not your turn !");
    }
    return modePick;
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
        entities.push(new Entity(c.GAMEDATA.CHARACTERS[i].name,
            undefined,
            [], [],
            new Hex(q, r), 1))
    }
}
module.exports = {
    initPickPhase, onMouseClicDraft, playAction
};