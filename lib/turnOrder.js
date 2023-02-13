const s = require("./spells")
const aoes = require("./aoe")
const c = require("./const")
const utils = require("./gameUtils")
if (typeof window != "undefined" && window.document) {
    audio = require("./client/audio");
}

function reduceCD(player) {
    player.spells.forEach(s => { if (s.currentCD > 0) s.currentCD-- })
}

function passTurn(og, game) {
    // turnTimer = og.turnTimer;
    // if (turnTimer.timeoutId) clearTimeout(turnTimer.timeoutId);
    endTurn(og.currentPlayer);
    let listAlive = og.PLAYERS.filter((p) => !p.dead);
    if (listAlive.length > 1) {
        og.idCurrentPlayer++
        if (og.idCurrentPlayer >= og.PLAYERS.length) og.idCurrentPlayer = 0;
        og.currentPlayer = og.PLAYERS[og.idCurrentPlayer]
        beginTurn(og, game
            // , turnTimer
        )
    }
}

function beginTurn(og, game) {
    let player = og.currentPlayer;
    if (typeof window != "undefined" && window.document)
        if (player.entity.team == TEAM) audio.playTicSound();
    console.log("begin turn ", player.name)
    triggerAOE(og);
    utils.checkWinCondition(og, game)
    if (player.dead) {
        console.log("as it is " + this.name + " turns but hes dead, he passes")
        passTurn(og);
    } else {
        player.entity.selected = true;
        tickDownBuffs(og)
        killExpiredSummons(og);
        refreshAuras(og) //to remove expired auras
        //start timer
        // startTurnTimer(turnTimer, timeExpired);
    }
}
// function startTurnTimer(turnTimer, callback) {
//     turnTimer.turnStartTime = Date.now();
//     turnTimer.timeoutId = setTimeout(callback, c.CONSTANTS.TIME_TURN_MS);
// }
// function timeExpired() {
// rise lava randomly
// console.log("Time expired !")
// if (!currentPlayer.isSummoned) {
//     console.log("rising lava random!")
//     let possibleCells = map.filter(h => utils.canRiseLava(h));
//     let cellToRiseLava = possibleCells[Math.floor(Math.random() * possibleCells.length)]
//     Network.clientSendGameAction("LAVA", cellToRiseLava, 0)
//     s.resolveSpell(og, cellToRiseLava, c.GAMEDATA.LAVA_SPELL, currentPlayer.entity)
// }
// //then end turn
// passTurn()
// }

function endTurn(player) {
    player.entity.selected = false;
    console.log("endturn, refill points for " + player.name)
    player.movePoint = player.startingMovePoint;
    reduceCD(player);
}
function triggerAOE(og) {
    let player = og.currentPlayer;
    if (!(player.isSummoned))
        og.map.forEach(h => {
            h.aoe = h.aoe.filter(spellEffect => {
                if (spellEffect.source == player) { // on fait peter les glyphes du joueur dont c'est le tour
                    console.log("triggerAOE from " + player.name)
                    spellEffect.glyph -= 1;
                    console.log(spellEffect)
                    if (spellEffect.glyph <= 0) { //ils expirent
                        let hit = s.resolveSpell(og, h, spellEffect, spellEffect.source.entity);
                        if (!(spellEffect.permanent) || (spellEffect.onlyFirst && hit)) {
                            return false;
                        }
                    }
                }
                return true;
            })
        })
}

function tickDownBuffs(og) {
    let player = og.currentPlayer;
    player.entity.auras = player.entity.auras.filter(aura => {
        aura.ttl--
        return (aura.permanent || aura.ttl > 0)
    })
    //remove armor
    og.entities.forEach(e => {
        if (e.armor && e.armorSource == player.entity) {
            console.log(e.name + "'s armor buff expires!")
            e.armor = 0;
        }
    })
}


function killExpiredSummons(og) {
    let player = og.currentPlayer;
    og.entities = og.entities.filter(e => {
        // console.log("check expire"+e.name)
        // console.log(e)
        if (e.owner == player) {
            e.ttl--
            if (e.ttl == 0) {
                if (e.onDeath) e.onDeath();
                return false
            }
        }
        return true;
    })
}

function refreshAuras(og) {
    //vide les auras de la map (and remove gas over lava)
    og.map.forEach(h => h.aoe = h.aoe.filter(aoe => !aoe.isAura && !(!h.floor && aoe.permanent)));
    // boucle sur les entities pour remettre les auras
    og.entities.forEach(e => {
        if (e.auras?.length) {
            e.auras.forEach(aura => {
                //get aoe from aura
                //calculate destination cells on the map
                let listCells = aoes.makeAOEFromCell(og, e.pos, aura.aoe, e.pos, aura.direction, aura.aoeSize);
                listCells.forEach(element => {
                    //apply aoe on the map
                    og.map.forEach(h => {
                        if (h.distance(element) == 0) {
                            //copy aura and push on all cells
                            var spellEffect = {};
                            Object.assign(spellEffect, aura);
                            h.aoe.push(spellEffect);
                        }
                    });
                })
            })
        }
    })
}

module.exports = {
    reduceCD, passTurn, beginTurn, endTurn, triggerAOE, tickDownBuffs, killExpiredSummons, refreshAuras,
    // startTurnTimer,
}