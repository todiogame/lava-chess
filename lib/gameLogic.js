const { Point, Hex, Layout } = require("./Hex")
const utils = require("./gameUtils")
const c = require("./const")
const aoes = require("./aoe")
const s = require("./spells")
const turnOrder = require("./turnOrder")
if (typeof window != "undefined" && window.document) {
    Anim = require("./client/Anim");
}

function moveEntity(entity, cell, og) {
    if (typeof window != 'undefined' && window.document)
        Anim.move(entity, cell);
    //spells onmove (pour le gazeur)
    var onMoveSpells = utils.findPlayerFromEntity(entity, og).spells.filter(s => s.onMove)
    if (onMoveSpells.length) onMoveSpells.forEach(s => castSpell(og, entity, s, cell));
    //then actually move
    entity.pos = cell;
    turnOrder.refreshAuras(og);
}


function castSpell(og, caster, spell, cell, direction) {
    if (spell.selfCast) cell = caster.pos;
    console.log("CASTING SPELL " + spell.name + " in pos ", cell.q, cell.r, cell.s)
    // if the spell is cleave, the aoe direction is from the character to the cell
    if (spell.aoe == "cleave") direction = (cell.subtract(caster.pos)).normalize();
    console.log(direction)

    if (spell.isAura) {
        var spellEffect = {};
        Object.assign(spellEffect, spell);
        spellEffect.source = og.currentPlayer;
        spellEffect.direction = direction;
        if (spell.aoe == "cleave") spellEffect.aoe = "cleave_aura"
        caster.auras.push(spellEffect)
    } else {
        var arrayAOE = aoes.makeAOEFromCell(og, cell, spell.aoe, caster.pos, direction, spell.aoeSize)
        let alreadyAffected = false
        arrayAOE.forEach(affectedCell => {
            // console.log(alreadyAffected)
            if (!(spell.onlyFirst) || !alreadyAffected) {
                og.map.map(h => {
                    if (h.distance(affectedCell) == 0) {
                        // instant spell deals their effect instantly
                        if (!spell.glyph) {
                            alreadyAffected = s.resolveSpell(og, h, spell, caster, direction, cell) ? true : alreadyAffected;
                        }
                        // glyph spells drop a glyph
                        else {
                            var spellEffect = {};
                            Object.assign(spellEffect, spell);
                            spellEffect.source = og.currentPlayer;
                            spellEffect.direction = direction;
                            if (h.floor && (!spellEffect.permanent || !h.aoe.find(s => s.name == spell.name)))
                                h.aoe.push(spellEffect);
                        }
                    }
                });
            }
        })
    }

    turnOrder.refreshAuras(og); //to show new auras
    //spell goes on cooldown
    spell.currentCD = spell.cooldown;

    //check if the casting player just killed themselves, if yes they pass their turn...
    if (utils.findPlayerFromEntity(caster, og).dead) {
        turnOrder.passTurn(og);
    }
}

function canCast(og, caster, spell, targetCell) {
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
            if (Hex.directions.some(d => !(utils.findMapCell(d.add(targetCell), og)?.floor))) typesCell.add(c.TYPES.CLOSE_TO_LAVA)
            let entity = og.entities.find(e => e.pos.distance(targetCell) == 0)
            if (!entity) typesCell.add(c.TYPES.EMPTY)
            else {
                typesCell.add(c.TYPES.ENTITY)
                entity.types.forEach(item => {
                    if (item != c.TYPES.VULNERABLE || !entity.isEthereal() )
                        typesCell.add(item)
                })
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
    let res = (caster.pos.distance(targetCell) > rangeSpell)
        || (spell.rangeMin && caster.pos.distance(targetCell) < spell.rangeMin)
        || ((spell.aoe && spell.aoe.includes("straight_line")) && !(targetCell.isSameLine(caster.pos)));
    if (spell.specialRange) {
        res = res && !(spell.specialRange == c.TYPES.CLOSE_TO_LAVA &&
            (Hex.directions.some(d => !(utils.findMapCell(d.add(targetCell), og)?.floor)))
        )
    }
    return res;
}

function canMove(entity, posCase, max, og) {
    //en attendant 1 case max
    if (!posCase.floor) return false;
    if (max > 1) max = 1;
    res = (entity?.pos?.distance(posCase) <= max) && utils.isFree(posCase, og) && posCase.floor; //and other blocked cases
    return res
}

function playAction(action, og) {
    console.log("playaction")
    console.log(og)
    if (action) {
        console.log("play action ", action.kind)
        let found;
        if (action.cell) found = og.map.find(b => b.equals(action.cell));
        if (found) {
            //action is MOVE, SPELL, or LAVA
            if (action.kind == "MOVE") {
                og.currentPlayer.loseMovePoint(); //use PM
                moveEntity(og.currentPlayer.entity, found, og)
            }
            else if (action.kind == "SPELL") {
                castSpell(og, og.currentPlayer.entity, og.currentPlayer.spells[action.spellID], found, action.direction);

            }
            else if (action.kind == "LAVA") {
                castSpell(og, og.currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found,)
                turnOrder.passTurn(og);
            }
        }
        else if (action.kind == "PASS") {
            turnOrder.passTurn(og);
        }
    }
}

module.exports = {
    playAction, canMove, canCast, castSpell, moveEntity, outOfRange
};