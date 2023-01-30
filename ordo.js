function ordonanceur() {
    initMap()
    // pickPerso()
    // placePerso()
    initGame();
}

function initMap() {

    for (let q = -N; q <= N; q++) {
        let r1 = Math.max(-N, -q - N);
        let r2 = Math.min(N, -q + N);
        for (let r = r1; r <= r2; r++) {
            map.push(new Hex(q, r, -q - r));
        }
    }

    //add lava
    map.map(h => {
        if (h.len() <= N - 1) h.floor = true;
    })
    //prepare aoe arrays
    map.map(h => h.aoe = []);

}

function initGame() {

    lava.onload = () => {
        drawMap();
    }
    PLAYERS.forEach(p => {
        p.entity.image.onload = () => {
            drawEntities();
        }
    })

    //   requestAnimationFrame(Anim.mainLoop);
}
function playTurn() {
    console.log('beginTurn ', currentPlayer.name);
    beginTurn(currentPlayer)
    // drawMap()
}


function beginTurn(player) {
    triggerAOE(player);
    tickDownBuffs(player)
    killExpiredSummons(player);
    refreshAuras() //to remove expired auras
    // if (player.team == "PLAYER")
    modeClic = "MOVE"
}
function endTurn(player) {
    console.log("endturn, refill points for " + player.name)
    player.movePoint = 1;
    player.riseLavaPoint = 1;
    reduceCD(player);
}

function triggerAOE(player) {
    map.forEach(h => {
        h.aoe = h.aoe.filter(spellEffect => {
            if (spellEffect.source == player) { // on fait peter les glyphes du joueur dont c'est le tour
                spellEffect.delay -= 1;
                if (spellEffect.delay == 0) { //ils expirent
                    resolveSpell(h, spellEffect, spellEffect.source.entity);
                    if (!spellEffect.permanent) {
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
        return (aura.ttl > 0)
    })
}


function killExpiredSummons(player) {
    entities = entities.filter(e => {
        if (e.owner == player) {
            e.ttl--
            if (e.ttl == 0) {
                // if (e.onDeath) e.onDeath(); //can we do this ?? yes
                return false
            }
        }
        return true;
    })
}

function reduceCD(player) {
    console.log(player)
    player.spells.forEach(s => { if (s.currentCD > 0) s.currentCD-- })
}

function endGame() { }

function passTurn() {
    endTurn(currentPlayer);
    console.log("pass turn")
    idCurrentPlayer++
    if (idCurrentPlayer >= PLAYERS.length) idCurrentPlayer = 0;
    currentPlayer = PLAYERS[idCurrentPlayer]
    playTurn(currentPlayer)
}

function checkWinCondition() { //appelee a la mort d'un joueur
    //check if only players left are on the same team, they won 
    //todo
    if (PLAYERS.length == 1) {
        console.log(PLAYERS[0].name + " WON THE GAME !")
    }
    if (PLAYERS.length <= 0) {
        console.log("EVERYBODY IS DEAD")
    }
}