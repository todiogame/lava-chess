function resolveSpell(cell, spell, casterEntity, direction, mainCell) {
  //direction only use for tentacle now
  targetCell = findMapCell(cell);
  let targetEntity = findEntityOnCell(targetCell);
  let result = spell.dealSpell(
    targetCell,
    spell,
    casterEntity,
    targetEntity,
    direction,
    mainCell,
  );
  checkAnyoneInLava();

  return result;
}
//HELPERS
function findMapCell(cell) {
  return map.find((h) => h.distance(cell) == 0);
}

function findEntityOnCell(cell) {
  if (cell) return entities.find((e) => e?.pos && cell.equals(e.pos));
}
function findPlayerFromEntity(entity) {
  if (entity) return PLAYERS.find((p) => p.entity == entity);
}
function killEntity(entity) {
  let killedPlayer = PLAYERS.find((p) => p.entity == entity);
  if (killedPlayer && !killedPlayer.dead) killedPlayer.die();
  entities = entities.filter((e) => e != entity);
}

// GENERIC
// deaspell correspond a la fonction du spell
function nothing(cell, spell, casterEntity, targetEntity) {}
function damage(cell, spell, casterEntity, targetEntity) {
  if (targetEntity && !targetEntity.isInvulnerable) targetEntity.damage();
}

function pull(cell, spell, casterEntity, targetEntity) {
  const destination = cell
    .subtract(casterEntity.pos)
    .scale(1 / cell.distance(casterEntity.pos))
    .add(casterEntity.pos);
  if (targetEntity) {
    Anim.move(targetEntity, destination);
    targetEntity.pos = destination;
    return true;
  }
  return false;
}
function push(cell, spell, casterEntity, targetEntity) {
  let value = spell.value || 1;
  if (targetEntity) {
    let destination = targetEntity.pos.copy();
    let direction = destination.subtract(casterEntity.pos);
    for (let n = 0; n < value; n++) {
      destination = destination.add(direction); //loop for pushing
      if (isFree(destination)) {
        Anim.move(targetEntity, destination);
        targetEntity.pos = destination;
      }
    }
  }
}
function salto(cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    const destination = targetEntity.pos
      .subtract(casterEntity.pos)
      .halfTurn()
      .add(casterEntity.pos);
    if (isFree(destination)) {
      Anim.move(targetEntity, destination);
      targetEntity.pos = destination;
    }
  }
}
function switcheroo(cell, spell, casterEntity, targetEntity) {
  Anim.splash_flash(cell);
  if (targetEntity) {
    const save = cell.copy();
    targetEntity.pos = casterEntity.pos;
    casterEntity.pos = save;
  }
}

function root(cell, spell, casterEntity, targetEntity) {
  let targetplayer = findPlayerFromEntity(targetEntity);
  if (targetplayer) {
    Anim.splash_debuff(
      cell,
      `-${targetplayer.movePoint > 0 ? targetplayer.movePoint : ""}`,
      "PM",
    );
    targetplayer.loseMovePoint(99);
  }
}

function silence(cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    Anim.splash_debuff(cell, ``, "PA");
    targetEntity.auras.push({ name: "silence", ttl: 2 });
  }
}

function buffPM(cell, spell, casterEntity, targetEntity) {
  let targetplayer = findPlayerFromEntity(targetEntity);
  if (targetplayer) {
    targetplayer.buffPM(spell.value || 1);
    Anim.splash_debuff(cell, `+${spell.value || 1}`, "PM");
  }
}
function buffPO(cell, spell, casterEntity, targetEntity) {
  let targetplayer = findPlayerFromEntity(targetEntity);
  if (targetplayer) {
    targetplayer.buffPO(spell.value || 1);
  }
}

function riseLava(cell, spell, casterEntity, targetEntity) {
  Anim.splash_lava(cell);
  if (targetEntity) {
    // kill entities on the cell
    killEntity(targetEntity);
  }
  const cellM = findMapCell(cell);
  cellM.aoe = []; //remove any aoe. We will rework if we ad a character that can survive lava
  cellM.floor = false;
}

function blink(cell, spell, casterEntity, targetEntity) {
  // if (!targetEntity) //empty cell
  casterEntity.pos = cell;
  Anim.splash_flash(cell);
}

function summon(cell, spell, casterEntity, targetEntity) {
  var summoned;

  if (!targetEntity) {
    //empty cell
    //if unique summon, kill previous one
    if (spell.summon.isUnique) {
      killEntity(
        entities.find(
          (e) => e.name == spell.summon.name && e.summoner == casterEntity,
        ),
      );
    }
    summoned = new Entity(
      spell.summon.name,
      casterEntity.team,
      spell.summon.auras ? spell.summon.auras : [],
      spell.summon.summonTypes ? spell.summon.summonTypes : [],
      cell.copy(),
      spell.summon.maxHP,
      spell.summon.ttl,
      currentPlayer,
      casterEntity,
      spell.summon.onDeath,
      spell.summon.flags,
    );
    if (summoned.auras)
      summoned.auras.forEach((a) => (a.source = currentPlayer));

    entities.push(summoned);

    if (summoned.types.includes(PLAYABLE)) {
      let summonedP = new Playable(summoned, spell.summon.spells);
      summonedP.isSummoned = true;
      PLAYERS.splice(
        (idCurrentPlayer + 1) % (PLAYERS.length + 1),
        0,
        summonedP,
      );
    }
    if (summoned.types.includes(PROJECTILE)) {
      Anim.projectile(summoned, casterEntity, cell);
    } else Anim.splash_invo(cell);
  }
  console.log("SUMMONED ", summoned);
  return summoned;
}

// special for perso
function golem_boulder(cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    damage(cell, spell, casterEntity, targetEntity);
  } else {
    riseLava(cell, spell, casterEntity, targetEntity);
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
  damage(cell, spell, casterEntity, targetEntity);
  push(cell, spell, casterEntity, targetEntity);
}

function demo_tentacle(cell, spell, casterEntity, targetEntity, direction) {
  console.log("demo tentacle");
  let tentacle = summon(cell, spell, casterEntity, targetEntity);
  tentacleHit = tentacle.auras.find((a) => (a.name = "Tentacle Hit"));
  tentacleHit.direction = direction;
  tentacleHit.source = currentPlayer;
  return tentacle;
}

function assassin_smokebomb(
  cell,
  spell,
  casterEntity,
  targetEntity,
  direction,
  mainCell,
) {
  if (targetEntity != casterEntity)
    root(cell, spell, casterEntity, targetEntity);
  //casterEntity.pos = mainCell;
  blink(mainCell, spell, casterEntity, targetEntity);
}

function time_backwards_hit(cell, spell, casterEntity, targetEntity) {
  damage(cell, spell, casterEntity, targetEntity);
  push(cell, spell, targetEntity, casterEntity);
}

function zombie_attack(cell, spell, casterEntity, targetEntity) {
  damage(cell, spell, casterEntity, targetEntity);
  casterEntity.die();
}
function shaman_flower(cell, spell, casterEntity, targetEntity) {
  if (targetEntity == casterEntity) {
    spell.permanent = false;
    //heal
    targetEntity.heal();
    //buff PO
    buffPO(cell, spell, casterEntity, targetEntity);
  }
}
function debuffCD(cell, spell, casterEntity, targetEntity) {}

//on death spells
function rasta_barrel_explode(casterEntity) {
  console.log("Barrel exploses !");
  let listCells = makeAOEFromCell(casterEntity.pos, "ring_1");
  listCells.forEach((cell) =>
    resolveSpell(cell, { dealSpell: damage }, casterEntity),
  );
}
