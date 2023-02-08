const c = require("./const")

//HELPERS
function findMapCell(cell) {
    return map.find(h => h.distance(cell) == 0)
}

function findEntityOnCell(cell) {
    if (cell) return entities.find(e => (e.pos && cell.equals(e.pos)))
}
function findPlayerFromEntity(entity) {
    if (entity) return PLAYERS.find(p => p.entity == entity)
}
function isEntityAlive(entity) {
    if (entity) return entities.find(p => p.entity == entity)
}

function isFree(cellToCheck) { //cell contains no entity
    // find cell in map
    let cell = map.find(h => h.distance(cellToCheck) == 0)
    if (!cell) return true
    var res = true;
    entities.forEach(e => {
        if (e.pos.distance(cell) == 0) {
            res = false;
        }
    })
    return res;
}

function isFreeFromPlayers(cellToCheck) { //cell contains no entity
    // find cell in map
    let cell = map.find(h => h.distance(cellToCheck) == 0)
    if (!cell) return true
    var res = true;
    entities.forEach(e => {
        if (e.types.includes(c.TYPES.PLAYER) && e.pos.distance(cell) == 0) {
            res = false;
        }
    })
    return res;
}

function checkWinCondition() { //appelee a la mort d'un joueur
    let listAlive = PLAYERS.filter(p => !p.dead);

    if (listAlive.length>0) {
      win(listAlive[0].entity.team)
    }
    else {
        //can this really happen ?
        console.log("guess everybody died")
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
function isBanArea(cell){
    return cell.q == 0 && cell.r == 0;
}

function findEntityByName(name) {
    return entities.find(e => e.name == name)
}

function findCharacterFromName(name){
    return c.GAMEDATA.CHARACTERS.find(e => e.name == name)
}

function win(team, reason){
    alert(team.toUpperCase() + " TEAM WON THE GAME"+(reason ? " BY "+reason : "")+"!")
}

module.exports = {
    findMapCell,
    findEntityOnCell,
    findPlayerFromEntity,
    isEntityAlive,
    isFree,
    isFreeFromPlayers,
    checkWinCondition,
    checkSameTeam,
    win,
    isSpawn,
    isBanArea,
    findEntityByName,
    findCharacterFromName,
};
