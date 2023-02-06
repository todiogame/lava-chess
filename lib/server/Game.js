const config = require("../../config")
const c = require('../const.js');
const Network = require('../Network.js')

const { Hex } = require("../Hex")
const Entity = require("../Entity")
const Playable = require("../Playable")

const RED = "red"
const BLUE = "cyan"

const TEST = config.TEST;
const STARTER = [9,10];

const MAX_HP_PLAYER = 4;

var PLAYERS;

module.exports = class Game {
    constructor(clientA, clientB, gameId) {
        if (gameId) this.id = gameId; else this.id = Network.getUniqueID();
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


        PLAYERS = []
        //randomize positions
        // let arrPos = [new Hex(0, -3, 3), new Hex(0, 3, -3), new Hex(3, -3, 0), new Hex(-3, 3, 0)];
        let arrPos = [];
        let newPos;
        for (let i = 0; i < nbPions; i++) {
            while (!newPos || arrPos.some(a => a.equals(newPos))) {
                let r = (i % 2 ? 1 : -1) * (Math.floor(Math.random() * 2) + 3);
                let q = (i % 2 ? -1 : 1) * (Math.floor(Math.random() * 5)) //missing one cell but osef
                newPos = new Hex(q, r)
            }
            arrPos.push(newPos)

            PLAYERS.push(new Playable(new Entity(c.GAMEDATA.CHARACTERS[charactersIds[i]].name,
                i % 2 ? BLUE : RED,
                [], [],
                newPos, MAX_HP_PLAYER),
                c.GAMEDATA.CHARACTERS[charactersIds[i]].spells))
        }
        return PLAYERS;
    }
}