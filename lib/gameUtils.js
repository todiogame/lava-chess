const c = require("./const");
const { Hex } = require("./Hex");
const hud = require("./client/hud");
const Network = require("./Network");

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

function checkWinCondition(og) {
  // console.log(TEAM);
  //appelee a la mort d'un joueur
  let listAlive = og.PLAYERS.filter((p) => !p.dead);

  if (listAlive.length > 0 && checkSameTeam(listAlive)) {
    setTimeout(() => {
      endGame(listAlive[0].entity.team === TEAM);
    }, 1500); // wait before calling endGame so we can see the animations
  }
}

function checkSameTeam(listAlive) {
  let firstTeam = listAlive[0].entity.team;
  for (let i = 1; i < listAlive.length; i++) {
    if (listAlive[i].entity.team !== firstTeam) {
      return false;
    }
  }
  return true;
}

function isSpawn(cell, team) {
  if (team == c.CONSTANTS.TEAM_RED) return cell.r <= -3;
  if (team == c.CONSTANTS.TEAM_BLUE) return cell.r >= 3;
  if (team == "ANY") return cell.r <= -3 || cell.r >= 3;
}
function isBanArea(cell) {
  return cell.q == 0 && cell.r == 0;
}

function findEntityByName(name, og) {
  return og.entities.find((e) => e.name == name);
}

function findCharacterFromName(name) {
  return c.GAMEDATA.CHARACTERS.find((e) => e.name == name);
}

function endGame(win, reason, og) {
  if (win) {
    Network.clientSendEndGame(TEAM)
    if (reason == "RAGEQUIT") {
      document.getElementById("ragequit").style.display = "block";
      //   document.getElementById("play-again-same").style.display = "none";
    } else document.getElementById("ragequit").style.display = "none";
    document.getElementById("game-result").innerText = "VICTORY";
  } else document.getElementById("game-result").innerText = "DEFEAT";
  hud.switchToEndGame();

hud.displayGauge(1, 1.75)
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
  isSpawn,
  isBanArea,
  findEntityByName,
  findCharacterFromName,
};
