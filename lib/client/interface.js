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

    if (TEAM == og.currentPlayer.entity.team) {
        let hPtClick = hexagon;
        let hPtClickRound = (hPtClick.round())


        let found = og.map.find(b => hPtClickRound.distance(b) == 0)
        if (found) {
            // console.log("onMouseClicGame ", !!found, modeClic)

            let direction = findClicDirection(found, hPtClick)
            //if mode move, move
            if (modeClic == "MOVE" && logic.canMove(og.currentPlayer.entity, found, og.currentPlayer.movePoint, og)) {
                og.currentPlayer.loseMovePoint() //use PM
                Network.clientSendGameAction("MOVE", found)
                logic.moveEntity(og.currentPlayer.entity, found, og)
            }
            if (modeClic == "SPELL") {
                console.log("try to cast spell", og.currentPlayer.spells[spellID])
                if (logic.canCast(og, og.currentPlayer.entity, og.currentPlayer.spells[spellID], found)) {
                    Network.clientSendGameAction("SPELL", found, spellID, direction)
                    logic.castSpell(og,og.currentPlayer.entity, og.currentPlayer.spells[spellID], found, direction)
                } else {
                    //cancel spellcast
                }
            }
            if (modeClic == "RISE_LAVA" && utils.canRiseLava(found,og)) {
                Network.clientSendGameAction("LAVA", found, spellID)
                logic.castSpell(og,og.currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found)
                turnOrder.passTurn(og)
            }
        }
        modeClic = "MOVE"

    } else {
        //not your turn !
        modeClic = ""
    }
    cleanRangeAndHover(og)
}

function onMouseClicHUD(x, y, og) {
    let btnX = buttonSpell.w_offset - (buttonSpell.width) - 10;
    let btnY = buttonSpell.h_offset - buttonSpell.height;
    if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
        // console.log("clickMove ")
        clickMove(og)
        return true;
    }
    for (let i = 0; i < og.currentPlayer.spells.length; i++) {
        btnX = buttonSpell.w_offset + i * (buttonSpell.width + 10);
        if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
            // console.log("clickspell ", i)
            clickSpell(i, og)
            return true;
        }
    }
    btnX = c.CANVAS.WIDTH * 7 / 10
    if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
        // console.log("click rise lava / pass ")
        clickPassTurnOrRiseLava(og)
        return true;
    }
    return false
}

function clickPassTurnOrRiseLava(og) {
    if (og.currentPlayer.isSummoned && og.currentPlayer.entity.team == TEAM)
        clickPassTurn(og)
    else
        clickRiseLava(og)
}

function onMouseHoverGame(hexagon, og) {
    if (og.currentPlayer.entity.team == TEAM) {
        og.map.map(b => b.hoverMove = b.hoverSpell = false)
        if (!modeClic) modeClic = "MOVE";
        let hPtHover = hexagon;
        let hPtHoverRound = (hPtHover.round())

        let found = og.map.find(b => hPtHoverRound.distance(b) == 0)
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
function showCastRange(og) {
    cleanRangeAndHover(og)
    if (modeClic == "MOVE")
        og.map.map(h => {
            if (logic.canMove(og.currentPlayer.entity, h, og.currentPlayer.movePoint, og))
                h.rangeMove = true;
        })
    if (modeClic == "SPELL") {
        displayAllHP = true
        og.map.map(h => {
            if (logic.canCast(og, og.currentPlayer.entity, og.currentPlayer.spells[spellID], h))
                h.hit = true;
            else if (!logic.outOfRange(og.currentPlayer.entity, og.currentPlayer.spells[spellID], h))
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

function clickSpell(id, og) {
    if (og.currentPlayer.spells && og.currentPlayer.spells[id]) {
        if (og.currentPlayer.spells[id].currentCD > 0 || og.currentPlayer.spells[id].passive || (og.currentPlayer.entity.auras.length && og.currentPlayer.entity.auras.some(a => a.name == "silence"))) {
            cleanRangeAndHover(og);
        } else {
            modeClic = "SPELL"
            spellID = id
            showCastRange(og);
        }
    }
}

function clickMove(og) {
    if (og.currentPlayer.movePoint) modeClic = "MOVE"
    showCastRange(og);
}


function clickRiseLava(og) {
    modeClic = "RISE_LAVA"
    showCastRange(og);
}

function clickPassTurn(og) {
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