const {Point, Hex, Layout} = require('./Hex.js');
const c =  require('./const.js');
const Playable = require('./Playable');
const Entity = require('./Entity');
const s = require("./spells")

function ordonanceur() {
    initGame();
    map = initMap(c.RADIUS_MAP)
    // pickPerso()
    // placePerso()
}

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
    // map.map(h => h.aoe = []);

    return map;
}

TEST = false;
STARTER = [8, 7, 6, 5]

function initPlayers(nbPions) {

    //randomize characters
    charactersIds = [];
    if (TEST) charactersIds.push(...STARTER);
    while (charactersIds.length < nbPions) {
        let randomInt = Math.floor(Math.random() * c.CHARACTERS.length);
        if (!charactersIds.includes(randomInt)) {
            charactersIds.push(randomInt);
        }
    }

    const TEAM_A_COLOR = "red"
    const TEAM_B_COLOR = "cyan"
    const MAX_HP_PLAYER = 4;

    PLAYERS = []
    let arrPos = [new Hex(0, -3, 3), new Hex(0, 3, -3), new Hex(3, -3, 0), new Hex(-3, 3, 0)];
    for (let i = 0; i < nbPions; i++) {
        PLAYERS.push(new Playable(new Entity(c.CHARACTERS[charactersIds[i]].name,
            i % 2 ? TEAM_B_COLOR : TEAM_A_COLOR,
            [], [],
            arrPos[i], MAX_HP_PLAYER),
            c.CHARACTERS[charactersIds[i]].spells))
    }
    return PLAYERS;
    // idCurrentPlayer = 0; //start with player1
    // currentPlayer = PLAYERS[idCurrentPlayer]

    // entities = [];
    // PLAYERS.forEach(p => entities.push(p.entity))

}

module.exports = {
    initMap, initPlayers,
};