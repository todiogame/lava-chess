
function resolveSpell(cell, spell, casterEntity) {
    h = findMapCell(cell)
    //todo checkCanCast 
    // if (checkCanCast(spell.canTarget(h))) {
    let targetEntity = findEntityOnCell(cell);
    spell.dealSpell(cell, spell, casterEntity, targetEntity)
    // }
    checkAnyoneInLava()
    // make movable aoe follow
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
        targetplayer.buffPM(spell.value);
    }
}

function riseLava(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        // kill entities on the cell
        killEntity(targetEntity)
    }
    cell.aoe = []; //remove any aoe. We will rework if we ad a character that can survive lava
    cell.floor = false;
}

function blink(cell, spell, casterEntity, targetEntity) {
    if (!targetEntity) //empty cell
        casterEntity.pos = cell;
}

function summon(cell, spell, casterEntity, targetEntity) {
    if (!targetEntity) { //empty cell
        //if unique summon, kill previous one
        if (spell.summonIsUnique) {
            entities = entities.filter(e => {
                return e.name != spell.name || e.casterEntity != casterEntity
            })
        }

        entities.push({
            name: spell.name,
            image: spell.src,
            ttl: spell.ttl,
            pos: cell.copy(),
            owner: currentPlayer,
            casterEntity: casterEntity,
            types: [ENTITY, ...spell.summonTypes],
            auras: spell.auras
            // onDeath: spell.onDeath
        })
    }
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