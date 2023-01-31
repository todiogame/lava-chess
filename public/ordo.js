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

    // Create our image
    lava = new Image();
    lava.src = './lavasmall.png'

    charactersIds = [];
    while (charactersIds.length < 4) {
        let randomInt = Math.floor(Math.random() * characters.length);
        if (!charactersIds.includes(randomInt)) {
            charactersIds.push(randomInt);
        }
    }


    player1 = new Player(characters[charactersIds[0]], "red", {
        pos: new Hex(0, -3, 3),
    })
    player2 = new Player(characters[charactersIds[1]], "blue", {
        pos: new Hex(0, 3, -3),
    })
    player3 = new Player(characters[charactersIds[3]], "red", {
        pos: new Hex(3, -3, 0),
    })
    player4 = new Player(characters[charactersIds[2]], "blue", {
        pos: new Hex(-3, 3, 0),
    })

    PLAYERS = [
        player1,
        player2,
        player3,
        player4
    ];
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
    // if (player.team == "PLAYER")
    modeClic = "MOVE"
}
function endTurn(player) {
    console.log("endturn, refill points for " + player.name)
    player.movePoint = 1;
    reduceCD(player);
}

function triggerAOE(player) {
    map.forEach(h => {
        h.aoe = h.aoe.filter(spellEffect => {
            if (spellEffect.source == player) { // on fait peter les glyphes du joueur dont c'est le tour
                spellEffect.delay -= 1;
                if (spellEffect.delay <= 0) { //ils expirent
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