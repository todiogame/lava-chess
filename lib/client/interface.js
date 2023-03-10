const { Point, Hex, Layout } = require("../Hex")
const drawing = require("./drawing")
const utils = require("../gameUtils")
const c = require("../const")
const aoes = require("../aoe")
const s = require("../spells")
const Network = require("../Network")
const Anim = require("./Anim")
const turnOrder = require("../turnOrder")
const logic = require("../gameLogic")

let modeClic = ""
let spellID = 0;

function onMouseClicGame(hexagon, og) {
    // console.log("onMouseClicGame")
    og.map.map(h => h.hoverMove = h.hoverSpell = false)
    let hPtClick = hexagon;
    let hPtClickRound = (hPtClick.round())
    let found = og.map.find(b => hPtClickRound.distance(b) == 0)

    if (TEAM == og.currentPlayer.entity.team) {
        if (found) {
            // console.log("onMouseClicGame ", !!found, modeClic)
            let direction = findClicDirection(found, hPtClick)
            //if mode move, move
            if (modeClic == "MOVE" && logic.canMove(og.currentPlayer.entity, found, og.currentPlayer.movePoint, og)) {
                og.currentPlayer.loseMovePoint() //use PM
                Network.clientSendGameAction("MOVE", found)
                logic.moveEntity(og.currentPlayer.entity, found, og)
            } else if (modeClic == "MOVE") { //clic to check out an entity
                og.entities.forEach(e => e.selected = false);
                let entHover = utils.findEntityOnCell(found, og);
                if (entHover) entHover.selected = true;
            }
            if (modeClic == "SPELL") {
                console.log("try to cast spell", og.currentPlayer.spells[spellID])
                if (logic.canCast(og, og.currentPlayer.entity, og.currentPlayer.spells[spellID], found)) {
                    Network.clientSendGameAction("SPELL", found, spellID, direction)
                    logic.castSpell(og, og.currentPlayer.entity, og.currentPlayer.spells[spellID], found, direction)
                } else {
                    //cancel spellcast
                    og.entities.forEach(e => e.selected = false);
                }
            }
            if (modeClic == "RISE_LAVA" && utils.canRiseLava(found, og)) {
                Network.clientSendGameAction("LAVA", found, spellID)
                logic.castSpell(og, og.currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found)
                turnOrder.passTurn(og)
            } else if (modeClic == "RISE_LAVA") { //clic to check out an entity
                og.entities.forEach(e => e.selected = false);
                let entHover = utils.findEntityOnCell(found, og);
                if (entHover) entHover.selected = true;
            }
        } else {
            og.entities.forEach(e => e.selected = false);
        }
        modeClic = "MOVE"

    } else {
        //not your turn !
        // modeClic = ""
        og.entities.forEach(e => e.selected = false);
        if (found) {
            let entHover = utils.findEntityOnCell(found, og);
            if (entHover) entHover.selected = true;
        }
    }
    cleanRangeAndHover(og)
}

function onMouseClicHUD(x, y, og) {

    let usersNextPLayer = utils.findNextPlayer(og, TEAM);
    if (!usersNextPLayer) usersNextPLayer = og.PLAYERS.find(p => p.entity.team == TEAM);

    let btnX = buttonSpell1.w_offset;
    let btnY = buttonSpell1.h_offset - buttonSpell1.height;
    if (x > btnX && x < btnX + buttonSpell1.width && y > btnY && y < btnY + buttonSpell1.height) {
        // console.log("clickMove ")
        clickMove(usersNextPLayer, og)
        return true;
    }
    for (let i = 0; i < usersNextPLayer.spells.length; i++) {
        btnX = buttonSpell1.w_offset + (i + 1) * (buttonSpell1.width + 10);
        if (x > btnX && x < btnX + buttonSpell1.width && y > btnY && y < btnY + buttonSpell1.height) {
            // console.log("clickspell ", i)
            clickSpell(usersNextPLayer, i, og)
            return true;
        }
    }
    btnX = c.CANVAS.WIDTH * 7 / 10
    if (x > btnX && x < btnX + buttonSpell1.width && y > btnY && y < btnY + buttonSpell1.height) {
        // console.log("click rise lava / pass ")
        clickPassTurnOrRiseLava(usersNextPLayer, og)
        return true;
    }
    return false
}

function clickPassTurnOrRiseLava(player, og) {
    if (og.currentPlayer.isSummoned && og.currentPlayer.entity.team == TEAM)
        clickPassTurn(player, og)
    else
        clickRiseLava(player, og)
}

function onMouseHoverGame(hexagon, og) {
    og.entities.forEach(e => e.hovered = false);
    let hPtHover = hexagon;
    let hPtHoverRound = (hPtHover.round())
    let found = og.map.find(b => hPtHoverRound.distance(b) == 0)
    if (found) {
        let entHover = utils.findEntityOnCell(found, og);
        if (entHover) entHover.hovered = true;
    }
    if (og.currentPlayer.entity.team == TEAM) {
        og.map.map(b => b.hoverMove = b.hoverSpell = false)
        if (!modeClic) modeClic = "MOVE";

        if (found) {

            //show move indicator
            if (modeClic == "MOVE" && logic.canMove(og.currentPlayer.entity, found, og.currentPlayer.movePoint, og)) {
                found.hoverMove = true
            }

            //show spell aoe indicator
            else if (modeClic == "SPELL") {
                if (logic.canCast(og, og.currentPlayer.entity, og.currentPlayer.spells[spellID], found)) {
                    var arrayHighlight = aoes.makeAOEFromCell(og, found, og.currentPlayer.spells[spellID].aoe,
                        og.currentPlayer.entity.pos, findClicDirection(found, hPtHover), og.currentPlayer.spells[spellID].aoeSize)
                    og.map.map(h => {
                        arrayHighlight.forEach(element => {
                            if (h.distance(element) == 0)
                                h.hoverSpell = true
                        })
                    })
                }
            } else if (modeClic == "RISE_LAVA") {
                if (utils.canRiseLava(found, og))
                    found.hoverSpell = true
            }
        }
    }
}
function showCastRange(player, og) {
    cleanRangeAndHover(og)
    if (modeClic == "MOVE")
        og.map.map(h => {
            if (logic.canMove(player.entity, h, player.movePoint, og))
                h.rangeMove = true;
        })
    if (modeClic == "SPELL") {
        displayAllHP = true
        og.map.map(h => {
            if (logic.canCast(og, player.entity, player.spells[spellID], h))
                h.hit = true;
            else if (!logic.outOfRange(player.entity, player.spells[spellID], h))
                h.rangeSpell = true;
        })
    }
    else if (modeClic == "RISE_LAVA") {
        // any cell that is next to lava and doesnt contain an entity
        og.map.map(found => {
            if (utils.canRiseLava(found, og)) found.hit = true;
        })
    }
}
function cleanRangeAndHover(og) {
    displayAllHP = false
    og.map.map(h => h.hoverMove = h.hoverSpell = h.rangeMove = h.rangeSpell = h.hit = false)
}

function clickSpell(player, id, og) {
    if (og.currentPlayer.spells && og.currentPlayer.spells[id]) {
        if (og.currentPlayer.spells[id].currentCD > 0 || og.currentPlayer.spells[id].passive || (og.currentPlayer.entity.auras.length && og.currentPlayer.entity.auras.some(a => a.name == "silence"))) {
            cleanRangeAndHover(og);
        } else {
            modeClic = "SPELL"
            spellID = id
            showCastRange(player, og);
        }
    }
}

function clickMove(player, og) {
    if (og.currentPlayer.movePoint) modeClic = "MOVE"
    showCastRange(player, og);
}


function clickRiseLava(player, og) {
    modeClic = "RISE_LAVA"
    showCastRange(player, og);
}

function clickPassTurn(player, og) {
    Network.clientSendGameAction("PASS",)
    turnOrder.passTurn(og);
}
function findClicDirection(cell, exactPtH) {
    if (cell && exactPtH) {
        var arrayDistances = []
        Hex.directions.forEach(d => arrayDistances.push(d.distance(exactPtH.subtract(cell))))
        return Hex.directions[arrayDistances.indexOf(Math.min(...arrayDistances))]
    }
}



module.exports = {
    onMouseHoverGame, onMouseClicGame, onMouseClicHUD, clickSpell, clickPassTurnOrRiseLava, clickMove
};