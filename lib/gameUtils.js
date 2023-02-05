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


function checkWinCondition() { //appelee a la mort d'un joueur
    let listAlive = PLAYERS.filter(p => !p.dead);

    if (listAlive.length == 0) {
        console.log("EVERYBODY IS DEAD")
        alert("EVERYBODY IS DEAD")
        // ordonanceur();
    }
    else if (listAlive.length == 1) {
        console.log(listAlive[0].name + " WON THE GAME !")
        alert(listAlive[0].name + " WON THE GAME !")
        // ordonanceur();
    }
    else {
        if (checkSameTeam(listAlive))
            alert(listAlive[0].entity.team.toUpperCase() + " TEAM WON THE GAME !")
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

module.exports = {
    findMapCell,
    findEntityOnCell,
    findPlayerFromEntity,
    isFree,
    checkWinCondition,
    checkSameTeam,
};
