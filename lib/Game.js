
const ordo = require('./ordo.js');
const c = require('./const.js');
const comm = require('./comm.js')

const RED = "red"
const BLUE = "cyan"

module.exports = class Game {
    constructor(clientA, clientB) {
        this.id = comm.getUniqueID();
        clientA.gameId = this.id;
        clientB.gameId = this.id;
        clientA.other = clientB;
        clientB.other = clientA;
        this.clientA = clientA;
        this.clientB = clientB;
        let cointoss = Math.floor(Math.random() * 2);
        this.clientA.team = cointoss ? RED : BLUE;
        this.clientB.team = cointoss ? BLUE : RED;

        console.log("GAME STARTS")
        this.PLAYERS = ordo.initPlayers(c.CONSTANTS.NB_PAWNS);
        comm.broadcast(this, "PLAYERS", this.PLAYERS)

        this.idCurrentPlayer = 0;
        if (Math.floor(Math.random() * 2)) {
            this.idCurrentPlayer = 1;
        }
        comm.broadcast(this, "idCurrentPlayer", this.idCurrentPlayer)

    }
}