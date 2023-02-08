const config = require("../../config")
const c = require('../const.js');
const Network = require('../Network.js')

const { Hex } = require("../Hex")
const Entity = require("../Entity")
const Playable = require("../Playable")
const utils = require("../gameUtils")


module.exports = class Game {
    constructor(clientA, clientB, gameId) {
        if (gameId) this.id = gameId; else this.id = Network.getUniqueID();
        clientA.gameId = this.id;
        clientB.gameId = this.id;
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

        this.ban_list = []
        this.PLAYERS = []

        if (Math.floor(Math.random() * 2)) {
            this.starting_team = c.CONSTANTS.TEAM_RED
        } else this.starting_team = c.CONSTANTS.TEAM_BLUE
        this.currentTeam = this.starting_team;
        Network.broadcast(this, "starting_team", this.starting_team)

        //now the clients have all they need to start the game, lets just wait to hear from them
    }


    handlePickBanData(client, action) {
        if (action.kind == "PICK") {
            //todo checker les datas
            this.PLAYERS.push(new Playable(new Entity(action.entityName,
                client.team,
                [], [c.TYPES.PLAYER, c.TYPES.VULNERABLE],
                action.cell, c.CONSTANTS.MAX_HP_PLAYER),
                (utils.findCharacterFromName(action.entityName)).spells))
            //alternate teams
            this.currentTeam = (this.currentTeam == c.CONSTANTS.TEAM_RED) ? c.CONSTANTS.TEAM_BLUE : c.CONSTANTS.TEAM_RED;

            if (this.PLAYERS.length >= c.CONSTANTS.NB_PAWNS) {
                console.log("GAME STARTS")
                Network.broadcast(this, "PLAYERS", this.PLAYERS)
            }
        }
        else if (action.kind == "BAN") {
            this.ban_list.push(action.entityName)
        }
    }


}