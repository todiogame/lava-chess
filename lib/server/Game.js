const config = require("../../config")
const c = require('../const.js');
const Network = require('../Network.js')

const { Hex } = require("../Hex")
const Entity = require("../Entity")
const Playable = require("../Playable")
const utils = require("../gameUtils")


const TEST = config.TEST;
const STARTER = [9, 8, 10, 4];

const MAX_HP_PLAYER = 4;

var PLAYERS;

module.exports = class Game {
    constructor(clientA, clientB, gameId) {
        if (gameId) this.id = gameId; else this.id = Network.getUniqueID();
        clientA.gameId = this.id;
        clientA.game = this;
        clientB.game = this;
        clientA.other = clientB;
        clientB.other = clientA;
        this.clientA = clientA;
        this.clientB = clientB;
        let cointoss = Math.floor(Math.random() * 2);
        this.clientA.team = cointoss ? c.CONSTANTS.TEAM_RED : c.CONSTANTS.TEAM_BLUE;
        this.clientB.team = cointoss ? c.CONSTANTS.TEAM_BLUE : c.CONSTANTS.TEAM_RED;
        Network.sendToClient(clientA, "TEAM", this.clientA.team)
        Network.sendToClient(clientB, "TEAM", this.clientB.team)
        // console.log("GAME STARTS")
        // this.PLAYERS = this.initPlayers(c.CONSTANTS.NB_PAWNS);
        this.PLAYERS = []
        // Network.broadcast(this, "PLAYERS", this.PLAYERS)

        this.idCurrentPlayer = 0;
        if (Math.floor(Math.random() * 2)) {
            this.starting_team = c.CONSTANTS.TEAM_RED
        } else this.starting_team = c.CONSTANTS.TEAM_BLUE
        this.currentTeam = this.starting_team;
        Network.broadcast(this, "starting_team", this.starting_team)
        // Network.broadcast(this, "idCurrentPlayer", this.idCurrentPlayer)

        //now the clients have all they need to start the game, lets just wait to hear from them
    }


    handlePickBanData(client, action) {
        if (action.kind == "PICK") {
            //todo checker les datas
            this.PLAYERS.push(new Playable(new Entity(action.entityName,
                client.team,
                [], [],
                action.cell, MAX_HP_PLAYER),
                (utils.findCharacterFromName(action.entityName)).spells))
            //alternate teams
            this.currentTeam = (this.currentTeam == c.CONSTANTS.TEAM_RED) ? c.CONSTANTS.TEAM_BLUE : c.CONSTANTS.TEAM_RED;

            if (this.PLAYERS.length >= c.CONSTANTS.NB_PAWNS) {
                console.log("GAME STARTS")
                Network.broadcast(this, "PLAYERS", this.PLAYERS)
            }
        }
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