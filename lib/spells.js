const utils = require("./gameUtils")
const aoes = require("./aoe")
const Entity = require("./Entity")
const Playable = require("./Playable")
const c = require("./const")
if (typeof window != 'undefined' && window.document) {
    Anim = require("./client/Anim");
}

function resolveSpell(cell, spellData, casterEntity, direction, mainCell) {
    //direction only use for tentacle now and maincell for assassin smoke bomb
    targetCell = utils.findMapCell(cell)
    let targetEntity = utils.findEntityOnCell(targetCell);
    let realSpell = LIB_SPELLS[spellData.dealSpell]
    let result = realSpell(targetCell, spellData, casterEntity, targetEntity, direction, mainCell)
    checkAnyoneInLava()

    return result;
}


// GENERIC
function checkAnyoneInLava() {
    entities = entities.filter(e => {
        found = map.find(h => e.pos.distance(h) == 0)
        if (found && !found.floor) {
            //aie aie aie
            entity.die();
            return false;
        }
        return true;
    })
}
// deaspell correspond a la fonction du spell 
function nothing(cell, spell, casterEntity, targetEntity) {
}
function damage(cell, spell, casterEntity, targetEntity) {
    if (targetEntity && !targetEntity.isInvulnerable) {
        if (typeof window != 'undefined' && window.document) Anim.splash(targetCell, "-1")
        targetEntity.damage();
    }
}

function pull(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        targetEntity.pos = (cell.subtract(casterEntity.pos)).scale(1 / cell.distance(casterEntity.pos)).add(casterEntity.pos);
        return true
    }
    return false;
}
function push(cell, spell, casterEntity, targetEntity) {
    let value = spell.value || 1;
    if (targetEntity) {
        let destination = (targetEntity.pos).copy()
        let direction = (destination.subtract(casterEntity.pos));
        for (let n = 0; n < value; n++) {
            destination = destination.add(direction) //loop for pushing
            if (utils.isFree(destination)) targetEntity.pos = destination;
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
    let targetplayer = utils.findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.loseMovePoint(99);
    }
}

function silence(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) targetEntity.auras.push(
        { name: "silence", ttl: 2 }
    );
}

function buffPM(cell, spell, casterEntity, targetEntity) {
    let targetplayer = utils.findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.buffPM(spell.value || 1);
    }
}
function buffPO(cell, spell, casterEntity, targetEntity) {
    let targetplayer = utils.findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.buffPO(spell.value || 1);
    }
}

function riseLava(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        // kill entities on the cell
        targetEntity.die();
    }
    cellM = utils.findMapCell(cell);
    cellM.aoe = []; //remove any aoe. We will rework if we ad a character that can survive lava
    cellM.floor = false;

}

function blink(cell, spell, casterEntity, targetEntity) {
    // if (!targetEntity) //empty cell
    casterEntity.pos = cell;
}

function summon(cell, spell, casterEntity, targetEntity) {
    var summoned;
    let summonData = c.GAMEDATA.TABLE_SUMMONS[spell.summon];
    if (summonData && !targetEntity) { //empty cell
        //if unique summon, kill previous one
        if (summonData.isUnique) {
            let previous = (entities.find(e => e.name == summonData.name && e.summoner == casterEntity))
            if (previous) previous.die()
        }
        summoned = new Entity(
            summonData.name,
            casterEntity.team,
            summonData.auras ? summonData.auras : [],
            summonData.summonTypes ? summonData.summonTypes : [],
            cell.copy(),
            summonData.maxHP,
            summonData.ttl,
            currentPlayer,
            casterEntity,
            summonData.onDeath,
            summonData.flags,
        )
        if (summoned.auras) summoned.auras.forEach(a => a.source = currentPlayer)

        entities.push(summoned)

        if (summoned.types.includes(c.TYPES.PLAYABLE)) {
            let summonedP = new Playable(summoned, summonData.spells)
            summonedP.isSummoned = true;
            PLAYERS.splice((idCurrentPlayer + 1) % (PLAYERS.length + 1), 0, summonedP);
        }
    }
    console.log("SUMMONED ", summoned)
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

// add this when we add LOS maybe (ldv)
/*
function fisherman_hook(cell, spell, casterEntity, targetEntity) {
    let res = pull(cell, spell, casterEntity, targetEntity)
    if (casterEntity.isEnemy(targetEntity)) damage(cell, spell, casterEntity, targetEntity)
    return res
}*/

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

function assassin_smokebomb(cell, spell, casterEntity, targetEntity, direction, mainCell) {
    if (targetEntity != casterEntity) root(cell, spell, casterEntity, targetEntity);
    casterEntity.pos = mainCell;
}

function time_backwards_hit(cell, spell, casterEntity, targetEntity) {
    damage(cell, spell, casterEntity, targetEntity)
    push(cell, spell, targetEntity, casterEntity,)
}

function zombie_attack(cell, spell, casterEntity, targetEntity) {
    damage(cell, spell, casterEntity, targetEntity)
    casterEntity.die();
}
function shaman_flower(cell, spell, casterEntity, targetEntity) {
    if (targetEntity == casterEntity) {
        spell.permanent = false;
        //heal
        targetEntity.heal()
        //buff PO
        buffPO(cell, spell, casterEntity, targetEntity)

    }
}
function debuffCD(cell, spell, casterEntity, targetEntity) {

}

//on death spells
function rasta_barrel_explode(casterEntity) {
    console.log("Barrel exploses !")
    let listCells = aoes.makeAOEFromCell(casterEntity.pos, "ring_1");
    listCells.forEach(cell => resolveSpell(cell, { dealSpell: damage }, casterEntity))
}

const LIB_SPELLS = {
    "resolveSpell": resolveSpell,
    "nothing": nothing,
    "damage": damage,
    "pull": pull,
    "push": push,
    "salto": salto,
    "switcheroo": switcheroo,
    "root": root,
    "silence": silence,
    "buffPM": buffPM,
    "buffPO": buffPO,
    "riseLava": riseLava,
    "blink": blink,
    "summon": summon,
    "golem_boulder": golem_boulder,
    "fisherman_push": fisherman_push,
    "demo_tentacle": demo_tentacle,
    "assassin_smokebomb": assassin_smokebomb,
    "time_backwards_hit": time_backwards_hit,
    "zombie_attack": zombie_attack,
    "shaman_flower": shaman_flower,
    "debuffCD": debuffCD,
    "rasta_barrel_explode": rasta_barrel_explode,
}

module.exports = {
    "resolveSpell": resolveSpell,
    nothing,
    damage,
    pull,
    push,
    salto,
    switcheroo,
    root,
    silence,
    buffPM,
    buffPO,
    riseLava,
    blink,
    summon,
    golem_boulder,
    fisherman_push,
    demo_tentacle,
    assassin_smokebomb,
    time_backwards_hit,
    zombie_attack,
    shaman_flower,
    debuffCD,
    rasta_barrel_explode,

};
