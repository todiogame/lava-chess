function ordonanceur() {
    initGame();
    initMap()
    // pickPerso()
    // placePerso()
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

    modeClic = "MOVE"; //MOVE or SPELL
    spellID = 0; //0 to 3
    //map
    N = 5;
    map = [];

    charactersIds = [];
    while (charactersIds.length < 4) {
        let randomInt = Math.floor(Math.random() * characters.length);
        if (!charactersIds.includes(randomInt)) {
            charactersIds.push(randomInt);
        }
    }

    const TEAM_A_COLOR = "red"
    const TEAM_B_COLOR = "cyan"
    PLAYERS = []
    let arrPos = [new Hex(0, -3, 3), new Hex(0, 3, -3), new Hex(3, -3, 0), new Hex(-3, 3, 0)];
    for (let i = 0; i < 4; i++) {
        PLAYERS.push(new Playable(new Entity(characters[charactersIds[i]].name,
            i % 2 ? TEAM_B_COLOR : TEAM_A_COLOR,
            [], [],
            arrPos[i]),
            characters[charactersIds[i]].spells))
    }

    idCurrentPlayer = 0; //start with player1
    currentPlayer = PLAYERS[idCurrentPlayer]

    entities = [];
    PLAYERS.forEach(p => entities.push(p.entity))


    // lava.onload = () => {
    //     drawMap();
    // }
    // PLAYERS.forEach(p => {
    //     p.entity.image.onload = () => {
    //         drawEntities();
    //     }
    // })

    //   requestAnimationFrame(Anim.mainLoop);
}
function playTurn() {
    if (currentPlayer.dead) {
        triggerAOE(currentPlayer);
        passTurn()
    } else {

        console.log('beginTurn ', currentPlayer.name);
        beginTurn(currentPlayer)
        // drawMap()
    }
}


function beginTurn(player) {
    triggerAOE(player);
    tickDownBuffs(player)
    killExpiredSummons(player);
    refreshAuras() //to remove expired auras
    // if (player.team == "PLAYABLE")
    modeClic = "MOVE"
}
function endTurn(player) {
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
                        resolveSpell(h, spellEffect, spellEffect.source.entity);
                        if (!(spellEffect.permanent)) {
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
                // if (e.onDeath) e.onDeath(); //can we do this ?? yes
                return false
            }
        }
        return true;
    })
}

function reduceCD(player) {
    player.spells.forEach(s => { if (s.currentCD > 0) s.currentCD-- })
}

function endGame() { }

function passTurn() {
    endTurn(currentPlayer);
    console.log("pass turn")
    if (PLAYERS.length) {
        idCurrentPlayer++
        if (idCurrentPlayer >= PLAYERS.length) idCurrentPlayer = 0;
        currentPlayer = PLAYERS[idCurrentPlayer]
        playTurn(currentPlayer)
    }
}

function checkWinCondition() { //appelee a la mort d'un joueur
    //check if only players left are on the same team, they won 
    //todo
    let listAlive = PLAYERS.filter(p => !p.dead);

    if (listAlive.length == 1) {
        console.log(listAlive[0].name + " WON THE GAME !")
        alert(listAlive[0].name + " WON THE GAME !")
        ordonanceur();
    }
    if (listAlive.length <= 0) {
        console.log("EVERYBODY IS DEAD")
        alert("EVERYBODY IS DEAD")
        ordonanceur();
    }
}