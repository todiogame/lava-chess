const { Point, Hex, Layout } = require("./Hex")
const utils = require("./gameUtils")
const c = require("./const")
const aoes = require("./aoe")
const s = require("./spells")
const Anim = require("./client/Anim")
const turnOrder = require("./turnOrder")


function initMap(N, isForPickBan) {
    map = []
    // console.log("init map size ", N)

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
        //special for pick/ban map
        if (isForPickBan && utils.isBanArea(h)) {
            h.floor = false;
            h.aoe.push({ name: "Pit of Ban", glyph: 1, glyphIcon: "banIcon", color: "GLYPH_BAN" })
        }
    })
    return map;
}


function moveEntity(entity, cell) {
    if (typeof window != 'undefined' && window.document)
        Anim.move(entity, cell);
    //spells onmove (pour le gazeur)
    var onMoveSpells = utils.findPlayerFromEntity(entity).spells.filter(s => s.onMove)
    if (onMoveSpells.length) onMoveSpells.forEach(s => castSpell(entity, s, cell));
    //then actually move
    entity.pos = cell;
    turnOrder.refreshAuras();
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
    if (utils.findPlayerFromEntity(caster).dead) {
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
            if (Hex.directions.some(d => !(utils.findMapCell(d.add(targetCell))?.floor))) typesCell.add(c.TYPES.CLOSE_TO_LAVA)
            let entity = entities.find(e => e.pos.distance(targetCell) == 0)
            if (!entity) typesCell.add(c.TYPES.EMPTY)
            else {
                typesCell.add(c.TYPES.ENTITY)
                entity.types.forEach(item => typesCell.add(item))
            }
        }
        //at this point we have 
        isAffected = spell.canTarget?.every(typesSpell => typesCell.has(typesSpell));
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
    initMap, playAction, canMove, canCast, castSpell, moveEntity, outOfRange
};