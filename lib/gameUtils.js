const c = require("./const");
const { Hex } = require("./Hex");
const hud = require("./client/hud");
const Network = require("./Network");
const data = require("./client/data")

//HELPERS
function findMapCell(cell, og) {
  return og.map.find((h) => h.distance(cell) == 0);
}

function findEntityOnCell(cell, og) {
  if (cell) return og.entities.find((e) => e.pos && cell.equals(e.pos));
}
function findPlayerFromEntity(entity, og) {
  if (entity) return og.PLAYERS.find((p) => p.entity == entity);
}
function isEntityAlive(entity, og) {
  if (entity) return og.entities.find((e) => e == entity);
}

function isFree(cellToCheck, og) {
  //cell contains no entity
  // find cell in map
  let cell = og.map.find((h) => h.distance(cellToCheck) == 0);
  if (!cell) return true;
  var res = true;
  og.entities.forEach((e) => {
    if (e.pos.distance(cell) == 0) {
      res = false;
    }
  });
  return res;
}

function isFreeFromPlayers(cellToCheck, og) {
  //cell contains no entity
  // find cell in map
  let cell = og.map.find((h) => h.distance(cellToCheck) == 0);
  if (!cell) return true;
  var res = true;
  og.entities.forEach((e) => {
    if (e.types.includes(c.TYPES.PLAYER) && e.pos.distance(cell) == 0) {
      res = false;
    }
  });
  return res;
}

function canRiseLava(cell, og) {
  // autorise seulement si la case est a cote de 3 cases de lave
  var res = false;
  if (isFreeFromPlayers(cell, og) && cell.floor) {
    let lavaCells = 0;
    og.map.forEach((h) => {
      if (
        Hex.directions.find(
          (d) => h.distance(d.add(cell)) == 0 && h && !h.floor,
        )
      ) {
        lavaCells++;
      }
    });
    res = lavaCells >= 3;
  }
  return res;
}
function checkWinCondition(og, game) {
  let res = false;
  console.log("checkWinCondition");
  //appelee a la mort d'un joueur
  let listAlive = og.PLAYERS.filter((p) => !p.dead);
  if (listAlive.length > 0) {
    let winner = checkSameTeam(listAlive);
    if (winner) {
      console.log("arretez tout ya un winner")
      //someone won
      res = winner;
    }
  } else if (!listAlive.length) {
    console.log("tout le monde est mort")
    res = null
  } else
    console.log("tout va bien poursuivez")

  return res;
}
function waitAnimationThenDisplayEndScreen(isMeWinner, og) {
  setTimeout(() => {
    og.gameHasEnded = true;
    endGame(isMeWinner);
  }, 1500);
}

function checkSameTeam(listAlive) {
  let firstTeam = listAlive[0].entity.team;
  for (let i = 1; i < listAlive.length; i++) {
    if (listAlive[i].entity.team !== firstTeam) {
      return false;
    }
  }
  return firstTeam;
}

function isSpawn(cell, team) {
  if (team == c.CONSTANTS.TEAM_RED) return cell.r <= -3;
  if (team == c.CONSTANTS.TEAM_BLUE) return cell.r >= 3;
  if (team == "ANY") return cell.r <= -3 || cell.r >= 3;
}
function isBanArea(cell) {
  return cell.q == 0 && cell.r == 0;
}

function findEntityById(id, og) {
  return og.entities.find((e) => e.id == id);
}

function findCharacterFromId(id) {
  return c.GAMEDATA.CHARACTERS.find((e) => e.id == id);
}

function findNextPlayer(og, team){
  const subArr = og.PLAYERS.slice(og.idCurrentPlayer);
  let usersNextPLayer = subArr.find(p => !p.dead && p.entity.team == team);
  if (!usersNextPLayer) usersNextPLayer = og.PLAYERS.find(p => !p.dead && p.entity.team == team);
  return usersNextPLayer;
}

function endGame(win, reason) {
  let xp = 100
  if (win) {
    xp = 1000
    document.getElementById("game-result").innerText = "VICTORY";
  } else {
    document.getElementById("game-result").innerText = "DEFEAT";
  }
  document.getElementById("game-result").style = "display:flex;";
  hud.switchToEndGame();
  storedData.addExperience(xp)
  data.save(storedData)

  // hud.displayGauge(1, 1.75)
}

module.exports = {
  findMapCell,
  findEntityOnCell,
  findPlayerFromEntity,
  isEntityAlive,
  isFree,
  isFreeFromPlayers,
  canRiseLava,
  checkWinCondition,
  checkSameTeam,
  endGame,
  waitAnimationThenDisplayEndScreen,
  isSpawn,
  isBanArea,
  findEntityById,
  findCharacterFromId,
  findNextPlayer,
};
