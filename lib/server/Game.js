const config = require("../../config");
const c = require("../const.js");
const Network = require("../Network.js");

const { Hex } = require("../Hex");
const Entity = require("../Entity");
const Playable = require("../Playable");
const utils = require("../gameUtils");

module.exports = class Game {
  constructor(clientA, clientB, gameMode, gameId) {
    if (gameId) this.id = gameId;
    else this.id = Network.getUniqueID();
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
    if (clientB.nickname)
      Network.sendToClient(clientA, "INFO", {
        nickname: this.clientB.nickname,
      });
    if (clientA.nickname)
      Network.sendToClient(clientB, "INFO", {
        nickname: this.clientA.nickname,
      });
    Network.sendToClient(clientA, "TEAM", this.clientA.team);
    Network.sendToClient(clientB, "TEAM", this.clientB.team);

    this.ban_list = [];
    this.PLAYERS = [];
    if (Math.floor(Math.random() * 2)) {
      this.starting_team = c.CONSTANTS.TEAM_RED;
    } else this.starting_team = c.CONSTANTS.TEAM_BLUE;
    this.currentTeam = this.starting_team;
    Network.broadcast(this, "starting_team", this.starting_team);
    if ( gameMode== c.GAME_MODE.DRAFT)
    Network.broadcast(this, "GAME_MODE", c.GAME_MODE.DRAFT);
    else if ( gameMode== c.GAME_MODE.QUICK){
      this.PLAYERS = this.initPlayersRandom(c.CONSTANTS.NB_PAWNS);
      console.log("GAME STARTS");
      Network.broadcast(this, "PLAYERS", this.PLAYERS);
    }

    //now the clients have all they need to start the game, lets just wait to hear from them
  }

  handlePickBanData(client, action) {
    if (action.kind == "PICK") {
      //todo checker les datas

      this.PLAYERS.push(
        new Playable(
          new Entity(
            action.entityName,
            client.team,
            [],
            [c.TYPES.PLAYER, c.TYPES.VULNERABLE],
            action.cell,
            c.CONSTANTS.MAX_HP_PLAYER,
          ),
          utils.findCharacterFromName(action.entityName).spells,
        ),
      );
      //alternate teams
      this.currentTeam =
        this.currentTeam == c.CONSTANTS.TEAM_RED
          ? c.CONSTANTS.TEAM_BLUE
          : c.CONSTANTS.TEAM_RED;

      if (this.PLAYERS.length >= c.CONSTANTS.NB_PAWNS) {
        //manage random picks
        this.PLAYERS = this.PLAYERS.map((p) => {
          //pick any except the random character of course
          if (p.name === "Random") {
            const randomChar =
              c.GAMEDATA.CHARACTERS[
                Math.floor(Math.random() * (c.GAMEDATA.CHARACTERS.length - 1))
              ];
            const newChar = p;
            newChar.name = randomChar.name;
            newChar.entity.name = randomChar.name;
            newChar.spells = utils.findCharacterFromName(
              randomChar.name,
            ).spells;
            newChar.entity.spells = utils.findCharacterFromName(
              randomChar.name,
            ).spells;
            return newChar;
          } else return p;
        });

        console.log("GAME STARTS");
        Network.broadcast(this, "PLAYERS", this.PLAYERS);
      }
    } else if (action.kind == "BAN") {
      this.ban_list.push(action.entityName);
    }
  }



  initPlayersRandom(nbPions) {
    let STARTER = [6]
    //randomize characters
    let charactersIds = [];
    if (config.TEST) charactersIds.push(...STARTER);
    while (charactersIds.length < nbPions) {
        let randomInt = Math.floor(Math.random() * c.GAMEDATA.CHARACTERS.length);
        if (!charactersIds.includes(randomInt)) {
            charactersIds.push(randomInt);
        }
    }
    let players = []
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

        players.push(new Playable(new Entity(c.GAMEDATA.CHARACTERS[charactersIds[i]].name,
            i % 2 ? c.CONSTANTS.TEAM_BLUE : c.CONSTANTS.TEAM_RED,
            [], [c.TYPES.PLAYER, c.TYPES.VULNERABLE],
            newPos, c.CONSTANTS.MAX_HP_PLAYER),
            c.GAMEDATA.CHARACTERS[charactersIds[i]].spells))
    }
    return players;
}
};
