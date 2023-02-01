
function resolveSpell(cell, spell, casterEntity, direction) {
    //direction only use for tentacle now
    targetCell = findMapCell(cell)
    let targetEntity = findEntityOnCell(targetCell);
    let result = spell.dealSpell(targetCell, spell, casterEntity, targetEntity, direction)
    checkAnyoneInLava()

    return result;
}
//HELPERS
function findMapCell(cell) {
    return map.find(h => h.distance(cell) == 0)
}

function findEntityOnCell(cell) {
    if (cell) return entities.find(e => (cell.distance(e.pos) == 0))
}
function findPlayerFromEntity(entity) {
    if (entity) return PLAYERS.find(p => p.entity == entity)
}
function killEntity(entity) {
    entities = entities.filter(e => e != entity)
}

// GENERIC
// deaspell correspond a la fonction du spell 
function pull(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        targetEntity.pos = (cell.subtract(casterEntity.pos)).scale(1 / cell.distance(casterEntity.pos)).add(casterEntity.pos);
        return true
    }
    return false;
}
function push(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        let destination = cell.copy();
        let direction = (destination.subtract(casterEntity.pos));
        for (let n = 0; n < spell.value; n++) {
            destination = destination.add(direction) //loop for pushing
            if (isFree(destination)) targetEntity.pos = destination;
        }

    }
}
function salto(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        targetEntity.pos = targetEntity.pos.subtract(casterEntity.pos).halfTurn().add(casterEntity.pos)
    }
}
function switcheroo(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        const save = cell.copy()
        targetEntity.pos = casterEntity.pos
        casterEntity.pos = save;
    }
}

function root(cell, spell, casterEntity, targetEntity) {
    let targetplayer = findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.loseMovePoint(99);
    }
}
function damage(cell, spell, casterEntity, targetEntity) {
    let targetplayer = findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.damage();
    }
}
function buffPM(cell, spell, casterEntity, targetEntity) {
    let targetplayer = findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.buffPM(spell.value || 1);
    }
}

function riseLava(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        // kill entities on the cell
        killEntity(targetEntity)
    }
    cellM = findMapCell(cell);
    cellM.aoe = []; //remove any aoe. We will rework if we ad a character that can survive lava
    cellM.floor = false;

}

function blink(cell, spell, casterEntity, targetEntity) {
    if (!targetEntity) //empty cell
        casterEntity.pos = cell;
}

function summon(cell, spell, casterEntity, targetEntity) {
    var summoned;
    if (!targetEntity) { //empty cell
        //if unique summon, kill previous one
        if (spell.summonIsUnique) {
            entities = entities.filter(e => {
                return e.name != spell.name || e.summoner != casterEntity
            })
        }
        summoned = new Entity(
            spell.summon.name,
            casterEntity.team,
            spell.summon.src,
            spell.summon.auras,
            spell.summon.summonTypes,
            cell.copy(),
            spell.summon.ttl,
            currentPlayer,
            casterEntity,
            // onDeath: spell.onDeath
        )
        entities.push(summoned)
        // PLAYERS.splice(index, 0, item);
    }
    return summoned;
}

// special for perso
function golem_boulder(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        damage(cell, spell, casterEntity, targetEntity)
    } else {
        riseLava(cell, spell, casterEntity, targetEntity)
    }
}
function fisherman_hook(cell, spell, casterEntity, targetEntity) {
    let res = pull(cell, spell, casterEntity, targetEntity)
    damage(cell, spell, casterEntity, targetEntity)
    return res
}
function fisherman_push(cell, spell, casterEntity, targetEntity) {
    damage(cell, spell, casterEntity, targetEntity)
    push(cell, spell, casterEntity, targetEntity)
}
function demo_tentacle(cell, spell, casterEntity, targetEntity, direction) {
    console.log("demo tentacle")
    let tentacle = summon(cell, spell, casterEntity, targetEntity)
    tentacleHit = tentacle.auras.find(a => a.name = "Tentacle Hit")
    tentacleHit.direction = direction;
    tentacleHit.source = currentPlayer;
    return tentacle;
}