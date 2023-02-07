const s = require("./spells")
const aoes = require("./aoe")

function reduceCD(player) {
    player.spells.forEach(s => { if (s.currentCD > 0) s.currentCD-- })
}

function passTurn() {
    endTurn(currentPlayer);
    if (PLAYERS.length) {
        idCurrentPlayer++
        if (idCurrentPlayer >= PLAYERS.length) idCurrentPlayer = 0;
        currentPlayer = PLAYERS[idCurrentPlayer]
        beginTurn(currentPlayer)
    }
}

function beginTurn(player) {
    console.log("begin turn ", player.name)
    triggerAOE(player);
    if (player.dead) {
        console.log("as it is " + this.name + " turns but hes dead, he passes")
        passTurn();
    }else currentPlayer.entity.selected = true;
    tickDownBuffs(player)
    killExpiredSummons(player);
    refreshAuras() //to remove expired auras
    modeClic = (TEAM == currentPlayer.entity.team) ? "MOVE" : "";
}
function endTurn(player) {
    currentPlayer.entity.selected = false;
    console.log("endturn, refill points for " + player.name)
    player.movePoint = 1;
    reduceCD(player);
}

function triggerAOE(player) {
    if (!(player.isSummoned))
        map.forEach(h => {
            h.aoe = h.aoe.filter(spellEffect => {
                if (spellEffect.source == player) { // on fait peter les glyphes du joueur dont c'est le tour
                    console.log("triggerAOE from " + player.name)
                    spellEffect.glyph -= 1;
                    if (spellEffect.glyph <= 0) { //ils expirent
                        let hit = s.resolveSpell(h, spellEffect, spellEffect.source.entity);
                        if (!(spellEffect.permanent) || (spellEffect.onlyFirst && hit)) {
                            return false;
                        }
                    }
                }
                return true;
            })
        })
}

function tickDownBuffs(player) {
    player.entity.auras = player.entity.auras.filter(aura => {
        aura.ttl--
        return (aura.permanent || aura.ttl > 0)
    })
}


function killExpiredSummons(player) {
    entities = entities.filter(e => {
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

function refreshAuras() {
    //vide les auras de la map (and remove gas over lava)
    map.forEach(h => h.aoe = h.aoe.filter(aoe => !aoe.isAura && !(!h.floor && aoe.permanent)));
    // boucle sur les entities pour remettre les auras
    entities.forEach(e => {
        if (e.auras?.length) {
            e.auras.forEach(aura => {
                //get aoe from aura
                //calculate destination cells on the map
                let listCells = aoes.makeAOEFromCell(e.pos, aura.aoe, e.pos, aura.direction, aura.aoeSize);
                listCells.forEach(element => {
                    //apply aoe on the map
                    map.forEach(h => {
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
    reduceCD, passTurn, beginTurn, endTurn, triggerAOE, tickDownBuffs, killExpiredSummons, refreshAuras
}