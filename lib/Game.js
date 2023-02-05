const c = require('./const.js');
const Network = require('./Network.js')

const {Hex} = require("./Hex")
const Entity = require("./Entity")
const Playable = require("./Playable")

const RED = "red"
const BLUE = "cyan"

const TEST = false;
const STARTER = [];

var PLAYERS;

module.exports = class Game {
    constructor(clientA, clientB) {
        this.id = Network.getUniqueID();
        clientA.gameId = this.id;
        clientB.gameId = this.id;
        clientA.other = clientB;
        clientB.other = clientA;
        this.clientA = clientA;
        this.clientB = clientB;
        let cointoss = Math.floor(Math.random() * 2);
        this.clientA.team = cointoss ? RED : BLUE;
        this.clientB.team = cointoss ? BLUE : RED;
        Network.sendToClient(clientA, "TEAM", this.clientA.team)
        Network.sendToClient(clientB, "TEAM", this.clientB.team)
        console.log("GAME STARTS")
        this.PLAYERS = this.initPlayers(c.CONSTANTS.NB_PAWNS);
        Network.broadcast(this, "PLAYERS", this.PLAYERS)

        this.idCurrentPlayer = 0;
        if (Math.floor(Math.random() * 2)) {
            this.idCurrentPlayer = 1;
        }
        Network.broadcast(this, "idCurrentPlayer", this.idCurrentPlayer)

        //now the clients have all they need to start the game, lets just wait to hear from them
    }




    initPlayers(nbPions) {

        //randomize characters
        let charactersIds = [];
        if (TEST) charactersIds.push(...STARTER);
        while (charactersIds.length < nbPions) {
            let randomInt = Math.floor(Math.random() * c.GAMEDATA.CHARACTERS.length);
            if (!charactersIds.includes(randomInt)) {
                charactersIds.push(randomInt);
            }
        }

        const TEAM_A_COLOR = "red"
        const TEAM_B_COLOR = "cyan"
        const MAX_HP_PLAYER = 4;

        PLAYERS = []
        //randomize positions
        let arrPos = [new Hex(0, -3, 3), new Hex(0, 3, -3), new Hex(3, -3, 0), new Hex(-3, 3, 0)];
        for (let i = 0; i < nbPions; i++) {
            PLAYERS.push(new Playable(new Entity(c.GAMEDATA.CHARACTERS[charactersIds[i]].name,
                i % 2 ? TEAM_B_COLOR : TEAM_A_COLOR,
                [], [],
                arrPos[i], MAX_HP_PLAYER),
                c.GAMEDATA.CHARACTERS[charactersIds[i]].spells))
        }
        return PLAYERS;
    }
}