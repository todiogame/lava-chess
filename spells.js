
function resolveSpell(cell, spell, casterEntity) {
    h = findMapCell(cell)
    if (checkCanCast(spell.canTarget(h))) {
        const targetEntity = findEntityOnCell(cell);
        spell.dealSpell(cell, spell, casterEntity, targetEntity)
    }
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
        }
        if (isFree(destination)) e.pos = destination;
    }
}
function salto(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        targetEntity.pos = cell.pos.subtract(casterEntity.pos).halfTurn().add(casterEntity.pos)
    }
}
function switcheroo(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        const save = cell.copy()
        e.pos = casterEntity.pos
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

function lava(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        // kill entities on the cell
        killEntity(targetEntity)
    }
    cell.floor = false;
}

function blink(cell, spell, casterEntity, targetEntity) {
    if (!targetEntity) //empty cell
        casterEntity.pos = cell;
}

function summon(cell, spell, casterEntity, targetEntity) {
    if (!targetEntity) //empty cell
        entities.push({
            name: spell.name,
            image: spell.src,
            ttl: spell.ttl,
            pos: cell.copy(),
            owner: currentPlayer,
            casterEntity : casterEntity,
            // onDeath: spell.onDeath
        })
}




// 

if (spell.effect == "lava") cell.floor = false;
if (!hit) {
    if (spell.type == "tp" && isFree(h) && h.floor) moveEntity(perso, h)

    if (spell.onMiss == "summon") {
    }
    if (spell.onMiss == "lava") {
        cell.floor = false;
    }
}