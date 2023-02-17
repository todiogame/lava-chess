const s = require("./spells")
const aoes = require("./aoe")
const c = require("./const")
const utils = require("./gameUtils")
const { Hex } = require("./Hex")
if (typeof window != "undefined" && window.document) {
    audio = require("./client/audio");
}
const Network = require("./Network")

function reduceCD(player) {
    player.spells.forEach(s => { if (s.currentCD > 0) s.currentCD-- })
}

function passTurn(og, game) {
    if (og.turnTimer.timeoutId) clearTimeout(og.turnTimer.timeoutId);
    endTurn(og.currentPlayer);
    let listAlive = og.PLAYERS.filter((p) => !p.dead);
    if (listAlive.length > 1) {
        og.idCurrentPlayer++
        if (og.idCurrentPlayer >= og.PLAYERS.length) og.idCurrentPlayer = 0;
        og.currentPlayer = og.PLAYERS[og.idCurrentPlayer]
        beginTurn(og, game)
    }
}

function beginTurn(og, game) {
    let player = og.currentPlayer;
    console.log("begin turn ", player.name)
    triggerAOE(og);
    utils.checkWinCondition(og, game)
    if (player.dead) {
        console.log("as it is " + player.name + " turns but hes dead, he passes")
        passTurn(og, game);
    } else {
        if (typeof window != "undefined" && window.document)
            if (player.entity.team == TEAM) audio.playTicSound();
        player.entity.isPlaying = true;
        tickDownBuffs(og)
        killExpiredSummons(og);
        refreshAuras(og) //to remove expired auras
        og.entities.forEach(e => e.selected = false)
        //start timer
        function timeExpiredWrapper(og, game) {
            return function () {
                timeExpired(og, game);
            };
        }

        startTurnTimer(og.turnTimer, timeExpiredWrapper(og, game));
    }
}
function startTurnTimer(turnTimer, callback) {
    console.log("start timer")
    turnTimer.turnStartTime = Date.now();
    turnTimer.timeoutId = setTimeout(callback, c.CONSTANTS.TIME_TURN_MS);
}
function timeExpired(og, game) {
    // rise lava randomly
    console.log("Time expired !")
    if (typeof window == "undefined") {
        if (!og.currentPlayer?.isSummoned) {
            console.log("rising lava random!")
            let possibleCells = og.map.filter(h => utils.canRiseLava(h, og));
            let cellToRiseLava = possibleCells[Math.floor(Math.random() * possibleCells.length)]

            s.resolveSpell(og, cellToRiseLava, c.GAMEDATA.LAVA_SPELL, og.currentPlayer.entity)
            Network.broadcast(game, "ACTION", { "kind": "LAVA", "cell": cellToRiseLava })
        }
        else {
            Network.broadcast(game, "ACTION", { "kind": "PASS" })
        }
        // then end turn
        passTurn(og, game)
    }
}

function endTurn(player) {
    player.entity.isPlaying = false;
    console.log("endturn, refill points for " + player.name)
    player.movePoint = player.startingMovePoint;
    reduceCD(player);
}
function triggerAOE(og) {
    let player = og.currentPlayer;
    if (!(player.isSummoned)) {
        //do a first iteration on the map to detect aoes going forward (lets name it, the breaking wave)
        let aoesGoingForward = []
        og.map.forEach(h => {
            h.aoe.filter(spellEffect => spellEffect.source == player && spellEffect.isGoingForward).forEach(spellEffect =>
                aoesGoingForward.push({
                    pos: h.copy(),
                    spellEffect: spellEffect,
                })
            )
        })

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

        //move forward the concerned AOE (lets name it, the breaking wave)
        aoesGoingForward.forEach(a => {
            a.spellEffect.glyph = 1
            let newMapCell = utils.findMapCell(a.pos.add(a.spellEffect.direction), og)
            if (newMapCell) {
                newMapCell.aoe.push(a.spellEffect)
            }
        })
    }
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