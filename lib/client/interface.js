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

function onMouseClicGame(hexagon) {
    console.log("onMouseClicGame")
    map.map(h => h.hoverMove = h.hoverSpell = false)

    if (TEAM == currentPlayer.entity.team) {
        let hPtClick = hexagon;
        let hPtClickRound = (hPtClick.round())


        let found = map.find(b => hPtClickRound.distance(b) == 0)
        if (found) {
            console.log("onMouseClicGame ", !!found, modeClic)

            let direction = findClicDirection(found, hPtClick)
            //if mode move, move
            if (modeClic == "MOVE" && logic.canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
                currentPlayer.loseMovePoint() //use PM
                Network.clientSendGameAction("MOVE", found)
                logic.moveEntity(currentPlayer.entity, found)
            }
            if (modeClic == "SPELL") {
                console.log("try to cast spell",currentPlayer.spells[spellID])
                if (logic.canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
                    Network.clientSendGameAction("SPELL", found, spellID, direction)
                    logic.castSpell(currentPlayer.entity, currentPlayer.spells[spellID], found, direction)
                } else {
                    //cancel spellcast
                }
            }
            if (modeClic == "RISE_LAVA" && utils.canRiseLava(found)) {
                Network.clientSendGameAction("LAVA", found, spellID)
                logic.castSpell(currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found)
                turnOrder.passTurn()
            }
        }
        modeClic = "MOVE"

    } else {
        //not your turn !
        modeClic = ""
    }
    cleanRangeAndHover()
}

function onMouseClicHUD(x, y) {
    let btnX = buttonSpell.w_offset - (buttonSpell.width) - 10;
    let btnY = buttonSpell.h_offset - buttonSpell.height;
    if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
        console.log("clickMove ")
        clickMove()
        return true;
    }
    for (let i = 0; i < currentPlayer.spells.length; i++) {
        btnX = buttonSpell.w_offset + i * (buttonSpell.width + 10);
        if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
            console.log("clickspell ", i)
            clickSpell(i)
            return true;
        }
    }
    btnX = c.CANVAS.WIDTH * 7 / 10
    if (x > btnX && x < btnX + buttonSpell.width && y > btnY && y < btnY + buttonSpell.height) {
        console.log("click rise lava / pass ")
        clickPassTurnOrRiseLava()
        return true;
    }
    return false
}

function clickPassTurnOrRiseLava() {
    if (currentPlayer.isSummoned && currentPlayer.entity.team == TEAM )
        clickPassTurn()
    else
        clickRiseLava()
}

function onMouseHoverGame(hexagon) {
    if (currentPlayer.entity.team == TEAM) {
        map.map(b => b.hoverMove = b.hoverSpell = false)
        if (!modeClic) modeClic = "MOVE";
        let hPtHover = hexagon;
        let hPtHoverRound = (hPtHover.round())

        let found = map.find(b => hPtHoverRound.distance(b) == 0)
        if (found) {

            //show move indicator
            if (modeClic == "MOVE" && logic.canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
                found.hoverMove = true
            }

            //show spell aoe indicator
            else if (modeClic == "SPELL") {
                if (logic.canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
                    var arrayHighlight = aoes.makeAOEFromCell(found, currentPlayer.spells[spellID].aoe,
                        currentPlayer.entity.pos, findClicDirection(found, hPtHover), currentPlayer.spells[spellID].aoeSize)
                    map.map(h => {
                        arrayHighlight.forEach(element => {
                            if (h.distance(element) == 0)
                                h.hoverSpell = true
                        })
                    })
                }
            } else if (modeClic == "RISE_LAVA") {
                if (utils.canRiseLava(found))
                    found.hoverSpell = true
            }
        }
    }
}
function showCastRange() {
    cleanRangeAndHover()
    if (modeClic == "MOVE")
        map.map(h => {
            if (logic.canMove(currentPlayer.entity, h, currentPlayer.movePoint))
                h.rangeMove = true;
        })
    if (modeClic == "SPELL") {
        displayAllHP = true
        map.map(h => {
            if (logic.canCast(currentPlayer.entity, currentPlayer.spells[spellID], h))
                h.hit = true;
            else if (!logic.outOfRange(currentPlayer.entity, currentPlayer.spells[spellID], h))
                h.rangeSpell = true;
        })
    }
    else if (modeClic == "RISE_LAVA") {
        // any cell that is next to lava and doesnt contain an entity
        map.map(found => {
            if (utils.canRiseLava(found)) found.hit = true;
        })
    }
}
function cleanRangeAndHover() {
    displayAllHP = false
    map.map(h => h.hoverMove = h.hoverSpell = h.rangeMove = h.rangeSpell = h.hit = false)
}

function clickSpell(id) {
    if (currentPlayer.spells && currentPlayer.spells[id]) {
        if (currentPlayer.spells[id].currentCD > 0 || currentPlayer.spells[id].passive || (currentPlayer.entity.auras.length && currentPlayer.entity.auras.some(a => a.name == "silence"))) {
            cleanRangeAndHover();
        } else {
            modeClic = "SPELL"
            spellID = id
            showCastRange();
        }
    }
}

function clickMove() {
    if (currentPlayer.movePoint) modeClic = "MOVE"
    showCastRange();
}


function clickRiseLava() {
    modeClic = "RISE_LAVA"
    showCastRange();
}

function clickPassTurn() {
    Network.clientSendGameAction("PASS",)
    turnOrder.passTurn();
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