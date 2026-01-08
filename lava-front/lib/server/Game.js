const config = require("../../config");
const c = require("../const.js");
const Network = require("../Network.js");

const { Hex } = require("../Hex");
const Entity = require("../Entity");
const Playable = require("../Playable");
const utils = require("../gameUtils");
const turnOrder = require("../turnOrder");
const logic = require("../gameLogic");
const OngoingGame = require("../OngoingGame");
const Elo = require("./Elo");
const Database = require("./Database");

module.exports = class Game {
  constructor(clientA, clientB, gameMode, onGameEnd, gameId) {
    if (gameId) this.id = gameId;
    else this.id = Network.getUniqueID();
    this.onGameEnd = onGameEnd;
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
    if (clientB.userInfo)
      Network.sendToClient(clientA, "INFO", {
        userInfo: this.clientB.userInfo,
      });
    if (clientA.userInfo)
      Network.sendToClient(clientB, "INFO", {
        userInfo: this.clientA.userInfo,
      });
    Network.sendToClient(clientA, "TEAM", this.clientA.team);
    Network.sendToClient(clientB, "TEAM", this.clientB.team);

    if (gameMode == c.GAME_MODE.DRAFT) {
      Network.broadcast(this, "GAME_MODE", c.GAME_MODE.DRAFT);
      this.og = new OngoingGame(true)
    }
    else if (gameMode == c.GAME_MODE.QUICK) {
      let players = this.initPlayersRandom(c.CONSTANTS.NB_PAWNS);
      this.og = new OngoingGame(false, players)
      console.log("GAME STARTS");
      Network.broadcast(this, "PLAYERS", this.og.PLAYERS);
    }

    //now the clients have all they need to start the game, lets just wait to hear from them
  }



  handleAction(client, action) {
    if (action) {
      console.log("play action ", action.kind)
      let found;
      if (action.cell) found = this.og.map.find(b => b.equals(action.cell));
      if (found) {
        //action is MOVE, SPELL, or LAVA
        if (action.kind == "MOVE") {
          this.og.currentPlayer.loseMovePoint(); //use PM
          logic.moveEntity(this.og.currentPlayer.entity, found, this.og)
        }
        else if (action.kind == "SPELL") {
          logic.castSpell(this.og, this.og.currentPlayer.entity, this.og.currentPlayer.spells[action.spellID], found, action.direction, this);

        }
        else if (action.kind == "LAVA") {
          logic.castSpell(this.og, this.og.currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found, undefined, this)
          turnOrder.passTurn(this.og, this);
        }
      }
      else if (action.kind == "PASS") {
        turnOrder.passTurn(this.og, this);
      }

      let winner = utils.checkWinCondition(this.og, this)
      if (winner) this.handleEndGame(winner);
    }
  }


  handlePickBanData(client, action) {
    if (action.kind == "PICK") {
      //todo checker les datas

      this.og.PLAYERS.push(
        new Playable(
          new Entity(
            action.entityId,
            utils.findCharacterFromId(action.entityId).name,
            client.team,
            [],
            [c.TYPES.PLAYER, c.TYPES.VULNERABLE],
            action.cell,
            c.CONSTANTS.MAX_HP_PLAYER,
          ),
          utils.findCharacterFromId(action.entityId).spells,
        ),
      );
      //alternate teams
      this.og.currentTeamPicking =
        this.og.currentTeamPicking == c.CONSTANTS.TEAM_RED
          ? c.CONSTANTS.TEAM_BLUE
          : c.CONSTANTS.TEAM_RED;

      if (this.og.PLAYERS.length >= c.CONSTANTS.NB_PAWNS) {
        //manage random picks
        this.og.PLAYERS = this.og.PLAYERS.map((p) => {
          console.log(p.id)
          //pick any except the random character of course
          if (p.entity.id === "random") {
            const randomChar =
              c.GAMEDATA.CHARACTERS[
              Math.floor(Math.random() * (c.GAMEDATA.CHARACTERS.length - 1))
              ];
            p = new Playable(
              new Entity(
                randomChar.id,
                randomChar.name,
                p.entity.team,
                [],
                [c.TYPES.PLAYER, c.TYPES.VULNERABLE],
                p.entity.pos,
                c.CONSTANTS.MAX_HP_PLAYER,
              ),
              randomChar.spells,
            )
          }
          return p;
        });

        console.log("GAME STARTS");
        this.og.isPickPhase = false;
        this.og.setPLAYERS(this.og.PLAYERS)
        Network.broadcast(this, "PLAYERS", this.og.PLAYERS);
        turnOrder.beginTurn(this.og, this)
      }
    } else if (action.kind == "BAN") {
      this.ban_list.push(action.entityId);
    }
  }

  initPlayersRandom(nbPions) {
    let STARTER = [2, 1];
    //randomize characters
    let charactersIds = [];
    if (config.TEST) charactersIds.push(...STARTER);
    while (charactersIds.length < nbPions) {
      let randomInt = Math.floor(Math.random() * c.GAMEDATA.CHARACTERS.length);
      if (!charactersIds.includes(randomInt)) {
        charactersIds.push(randomInt);
      }
    }
    let players = [];
    //randomize positions
    // let arrPos = [new Hex(0, -3, 3), new Hex(0, 3, -3), new Hex(3, -3, 0), new Hex(-3, 3, 0)];
    let arrPos = [];
    let newPos;
    for (let i = 0; i < nbPions; i++) {
      while (!newPos || arrPos.some((a) => a.equals(newPos))) {
        let r = (i % 2 ? 1 : -1) * (Math.floor(Math.random() * 2) + 3);
        let q = (i % 2 ? -1 : 1) * Math.floor(Math.random() * 5); //missing one cell but osef
        newPos = new Hex(q, r);
      }
      arrPos.push(newPos);

      players.push(
        new Playable(
          new Entity(
            c.GAMEDATA.CHARACTERS[charactersIds[i]].id,
            c.GAMEDATA.CHARACTERS[charactersIds[i]].name,
            i % 2 ? c.CONSTANTS.TEAM_BLUE : c.CONSTANTS.TEAM_RED,
            [],
            [c.TYPES.PLAYER, c.TYPES.VULNERABLE],
            newPos,
            c.CONSTANTS.MAX_HP_PLAYER,
          ),
          c.GAMEDATA.CHARACTERS[charactersIds[i]].spells,
        ),
      );
    }
    return players;
  }

  handleEndGame(winner) { //winner is team color
    console.log("GAME ENDS")
    if (this.og.turnTimer.timeoutId) clearTimeout(this.og.turnTimer.timeoutId);
    this.finished = true;
    this.winner = winner;

    const isClientAWinner = (this.clientA.team == winner);
    var resElo = Elo.updateEloRatings(this.clientA.userInfo.elo, this.clientB.userInfo.elo, isClientAWinner)

    //update elo in DB for authenticated accounts
    if(this.clientA.userInfo.userId){
      Database.updateUserElo(this.clientA.userInfo.userId, resElo.playerA) 
    }
    if(this.clientB.userInfo.userId){
      Database.updateUserElo(this.clientB.userInfo.userId, resElo.playerB)
    }
    //todo save the game data in db
    
    Network.sendToClient(this.clientA, "ELO", resElo.playerA);
    Network.sendToClient(this.clientB, "ELO", resElo.playerB);
    Network.broadcast(this, "END_GAME", winner)
    this.onGameEnd(this)
  }
};
