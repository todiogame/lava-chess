const { Point, Hex, Layout } = require("../Hex")
const drawing = require("./drawing")
const utils = require("../gameUtils")
const c = require("../const")
const aoes = require("../aoe")
const s = require("../spells")
const Network = require("../Network")
const Anim = require("./Anim")
const turnOrder = require("../turnOrder")

let modeClic = ""
let spellID = 0;


function initMap(N) {
    map = []
    console.log("init map size ", N)

    for (let q = -N; q <= N; q++) {
        let r1 = Math.max(-N, -q - N);
        let r2 = Math.min(N, -q + N);
        for (let r = r1; r <= r2; r++) {
            map.push(new Hex(q, r, -q - r));
        }
    }

    map.map(h => {
        //add lava
        if (h.len() <= N - 1) h.floor = true;
        //prepare aoe arrays
        h.aoe = []
        //add random id for tiles
        h.rand4 = Math.floor(Math.random() * 4)
    })
    return map;
}

function onMouseClicGame(event) {
    // console.log("onMouseClicGame")
    map.map(h => h.hoverMove = h.hoverSpell = false)

    if (TEAM == currentPlayer.entity.team) {
        let hPtClick = drawing.findHexFromEvent(event.pageX, event.pageY)
        let hPtClickRound = (hPtClick.round())


        let found = map.find(b => hPtClickRound.distance(b) == 0)
        if (found) {
            let direction = findClicDirection(found, hPtClick)
            //if mode move, move
            if (modeClic == "MOVE" && canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
                currentPlayer.loseMovePoint() //use PM
                Network.clientSendAction("MOVE", found)
                moveEntity(currentPlayer.entity, found)
            }
            if (modeClic == "SPELL") {
                if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
                    Network.clientSendAction("SPELL", found, spellID, direction)
                    castSpell(currentPlayer.entity, currentPlayer.spells[spellID], found, direction)
                } else {
                    //cancel spellcast
                }
            }
            if (modeClic == "RISE_LAVA" && canRiseLava(found)) {
                Network.clientSendAction("LAVA", found, spellID)
                castSpell(currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found)
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

function onMouseHoverGame(e) {

    map.map(b => b.hoverMove = b.hoverSpell = false)
    if (!modeClic && currentPlayer.entity.team == TEAM) modeClic = "MOVE";

    let hPtHover = drawing.findHexFromEvent(e.pageX, e.pageY)
    let hPtHoverRound = (hPtHover.round())

    let found = map.find(b => hPtHoverRound.distance(b) == 0)
    if (found) {

        //show move indicator
        if (modeClic == "MOVE" && canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
            found.hoverMove = true
        }

        //show spell aoe indicator
        else if (modeClic == "SPELL") {
            if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
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
            if (canRiseLava(found))
                found.hoverSpell = true
        }
    }
}

function moveEntity(entity, cell) {
    Anim.move(entity, cell);
    //sprlls onmove a remettre pour le gazeur
    // var onMoveSpells = PLAYERS.find(p => p.entity == entity)?.spells.filter(s => s.onMove)
    // if (onMoveSpells.length) onMoveSpells.forEach(s => castSpell(entity, s, cell));
    entity.pos = cell;
    //reset modeclic
    // modeClic = ""
    turnOrder.refreshAuras();
    //clean map from range and hover indicators
    cleanRangeAndHover()
}

function findClicDirection(cell, exactPtH) {
    if (cell && exactPtH) {
        var arrayDistances = []
        Hex.directions.forEach(d => arrayDistances.push(d.distance(exactPtH.subtract(cell))))
        return Hex.directions[arrayDistances.indexOf(Math.min(...arrayDistances))]
    }
}
function castSpell(caster, spell, cell, direction) {
    if (spell.selfCast) cell = caster.pos;
    console.log("CASTING SPELL " + spell.name + " in pos ", cell.q, cell.r, cell.s)

    if (spell.isAura) {
        var spellEffect = {};
        Object.assign(spellEffect, spell);
        spellEffect.source = currentPlayer;
        spellEffect.direction = direction;
        caster.auras.push(spellEffect)
    } else {
        var arrayAOE = aoes.makeAOEFromCell(cell, spell.aoe, caster.pos, direction, spell.aoeSize)
        // console.log(arrayAOE)
        let alreadyAffected = false
        arrayAOE.forEach(affectedCell => {
            // console.log(alreadyAffected)
            if (!(spell.onlyFirst) || !alreadyAffected) {
                map.map(h => {
                    if (h.distance(affectedCell) == 0) {
                        // instant spell deals their effect instantly
                        if (!spell.glyph) {
                            alreadyAffected = s.resolveSpell(h, spell, caster, direction, cell) ? true : alreadyAffected;
                        }
                        // glyph spells drop a glyph
                        else {
                            var spellEffect = {};
                            Object.assign(spellEffect, spell);
                            spellEffect.source = currentPlayer;
                            spellEffect.direction = direction;
                            if (h.floor && (!spellEffect.permanent || !h.aoe.find(s => s.name == spell.name)))
                                h.aoe.push(spellEffect);
                        }
                    }
                });
            }
        })
    }

    turnOrder.refreshAuras(); //to show new auras
    //spell goes on cooldown
    spell.currentCD = spell.cooldown;
    
    //check if the casting player just killed themselves, if yes they pass their turn...
    if (utils.findPlayerFromEntity(caster).dead){
        turnOrder.passTurn();
    }
}

function canCast(caster, spell, targetCell) {
    //check range
    if (outOfRange(caster, spell, targetCell)) return false;
    //check affects types :
    let isAffected = false;
    if (spell.canTarget?.includes(c.TYPES.ANY)) {
        isAffected = true;
    } else {
        //targetCell is map cell with info
        var typesCell = new Set()
        if (!targetCell.floor) typesCell.add(c.TYPES.LAVA)
        else {
            let entity = entities.find(e => e.pos.distance(targetCell) == 0)
            if (!entity) typesCell.add(c.TYPES.EMPTY)
            else {
                typesCell.add(c.TYPES.ENTITY)
                entity.types.forEach(item => typesCell.add(item))
            }
        }
        //at this point we have 
        spell.canTarget?.forEach(typesSpell => {
            if (typesCell.has(typesSpell)) isAffected = true;
        });
    }
    return isAffected;
    //add other tests : line of sight, blocked case ?
}
function outOfRange(caster, spell, targetCell) {
    // let casterPlayer = utils.findPlayerFromEntity(caster)
    // let rangeSpell = casterPlayer.bonusPO ? casterPlayer.bonusPO + spell.range : spell.range;
    let rangeSpell = spell.range;
    return (caster.pos.distance(targetCell) > rangeSpell)
        || (spell.rangeMin && caster.pos.distance(targetCell) < spell.rangeMin)
        || ((spell.aoe && spell.aoe.includes("straight_line")) && !(targetCell.isSameLine(caster.pos)));
}

function canMove(entity, posCase, max) {
    //en attendant 1 case max
    if (!posCase.floor) return false;
    if (max > 1) max = 1;
    res = (entity?.pos?.distance(posCase) <= max) && utils.isFree(posCase) && posCase.floor; //and other blocked cases
    return res
}
function canRiseLava(cell) {
    // autorise seulement si la case est a cote de 3 cases de lave
    var res = false;
    if (utils.isFree(cell) && cell.floor && !cell.aoe.find(spell => spell.effect == "lava")) {
        let lavaCells = 0;
        map.forEach(h => {
            if (Hex.directions.find(d => h.distance(d.add(cell)) == 0 && h && !h.floor)) {
                lavaCells++;
            }
        });
        res = lavaCells >= 3;
    }
    return res;
}

function showCastRange() {
    cleanRangeAndHover()
    if (modeClic == "MOVE")
        map.map(h => {
            if (canMove(currentPlayer.entity, h, currentPlayer.movePoint))
                h.rangeMove = true;
        })
    if (modeClic == "SPELL")
        map.map(h => {
            if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], h))
                h.hit = true;
            else if (!outOfRange(currentPlayer.entity, currentPlayer.spells[spellID], h))
                h.rangeSpell = true;
        })
    else if (modeClic == "RISE_LAVA") {
        // any cell that is next to lava and doesnt contain an entity
        map.map(found => {
            if (canRiseLava(found)) found.hit = true;
        })
    }
}
function cleanRangeAndHover() {
    map.map(h => h.hoverMove = h.hoverSpell = h.rangeMove = h.rangeSpell = h.hit = false)
}

function clickSpell(id) {
    modeClic = "SPELL"
    spellID = id
    showCastRange();
}

function clickSpell0() { clickSpell(0) }
function clickSpell1() { clickSpell(1) }
function clickSpell2() { clickSpell(2) }


function clickMove() {
    if (currentPlayer.movePoint) modeClic = "MOVE"
    showCastRange();
}


function clickRiseLava() {
    modeClic = "RISE_LAVA"
    showCastRange();
}

function clickPassTurn() {
    Network.clientSendAction("PASS",)
    turnOrder.passTurn();
}

document.getElementById("move").addEventListener('click', clickMove)
document.getElementById("rise-lava").addEventListener('click', clickRiseLava)
document.getElementById("pass-turn").addEventListener('click', clickPassTurn)
document.getElementById("spell-0").addEventListener('click', clickSpell0)
document.getElementById("spell-1").addEventListener('click', clickSpell1)
document.getElementById("spell-2").addEventListener('click', clickSpell2)


function playAction(action) {
    if (action) {
        console.log("play action ", action.kind)
        let found;
        if (action.cell) found = map.find(b => b.equals(action.cell));
        if (found) {
            //action is MOVE, SPELL, or LAVA
            if (action.kind == "MOVE") {
                currentPlayer.loseMovePoint(); //use PM
                moveEntity(currentPlayer.entity, found)
            }
            else if (action.kind == "SPELL") {
                castSpell(currentPlayer.entity, currentPlayer.spells[action.spellID], found, action.direction);

            }
            else if (action.kind == "LAVA") {
                castSpell(currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found,)
                turnOrder.passTurn();
            }
        }
        else if (action.kind == "PASS") {
            turnOrder.passTurn();
        }
    }
}

module.exports = {
    initMap, playAction, onMouseHoverGame, onMouseClicGame
};