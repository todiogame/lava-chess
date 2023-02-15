const utils = require("./gameUtils");
const aoes = require("./aoe");
const Entity = require("./Entity");
const Playable = require("./Playable");
const c = require("./const");
if (typeof window != "undefined" && window.document) {
  Anim = require("./client/Anim");
}

function resolveSpell(og, cell, spellData, casterEntity, direction, mainCell) {
  //direction only use for tentacle now and maincell for assassin smoke bomb
  targetCell = utils.findMapCell(cell, og);
  let targetEntity = utils.findEntityOnCell(targetCell, og);
  if (targetEntity) console.log("spell target:" + targetEntity.name); else console.log("spell target:" + "no")
  let realSpell = LIB_SPELLS[spellData.dealSpell];

  if (spellData?.animation) {
    switch (spellData.animation) {
      case c.ANIMATIONS.FALL:
        if (typeof window != 'undefined' && window.document)
          Anim.fall(spellData, cell);
        break;
      //default: nothing
    }
  }
  let result = realSpell(
    og,
    targetCell,
    spellData,
    casterEntity,
    targetEntity,
    direction,
    mainCell,
  );
  checkAnyoneInLava(og);
  return result;
}

// GENERIC
function checkAnyoneInLava(og) {
  og.entities.forEach((e) => {
    found = og.map.find((h) => e.pos.distance(h) == 0);
    if (!found || !found.floor) {
      //aie aie aie
      e.die(og);
      //todo kill player if needed
    }
  });
}
// deaspell correspond a la fonction du spell
function nothing(og, cell, spell, casterEntity, targetEntity) { }
function damage(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity && !targetEntity.isInvulnerable) {
    let hpBefore = targetEntity.currentHP;
    targetEntity.damage(og);
    //todo check if we are client or not => will help when server will check actions
    // if (typeof window != 'undefined' && window.document)

    //Anim.splash(targetCell, targetEntity.currentHP - hpBefore)
    if (typeof window != 'undefined' && window.document)
      Anim.damageParticles(targetCell, targetEntity.currentHP - hpBefore);

    //check if entity is dead and has an ondeath close
    if (targetEntity.dead && targetEntity.onDeath) {
      let onDeathSpell = LIB_SPELLS[targetEntity.onDeath];
      onDeathSpell(og, targetEntity);
    }
    return true;
  }
}
function damage_others(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity != casterEntity)
    damage(og, cell, spell, casterEntity, targetEntity);
}

function pull(og, cell, spell, casterEntity, targetEntity) {
  const destination = cell
    .subtract(casterEntity.pos)
    .scale(1 / cell.distance(casterEntity.pos))
    .add(casterEntity.pos);
  if (targetEntity) {
    if (typeof window != 'undefined' && window.document)
      Anim.move(targetEntity, destination);
    targetEntity.pos = destination;
    return true;
  }
  return false;
}
function attraction(og, cell, spell, casterEntity, targetEntity) {
  console.log(og, cell, spell, casterEntity, targetEntity)
  const destination = cell
    .subtract(casterEntity.pos)
    .scale(1 / cell.distance(casterEntity.pos))
    .add(casterEntity.pos);
  if (typeof window != 'undefined' && window.document)
    Anim.move(casterEntity, destination);
  casterEntity.pos = destination;
  return true;
}
function push(og, cell, spell, casterEntity, targetEntity) {
  let value = spell.value || 1;
  if (targetEntity) {
    let destination = targetEntity.pos.copy();
    let direction = destination.subtract(casterEntity.pos);
    console.log("direction", direction);
    direction = direction.normalize();
    console.log("direction", direction);
    for (let n = 0; n < value; n++) {
      destination = destination.add(direction); //loop for pushing
      if (utils.isFree(destination, og)) {
        if (typeof window != 'undefined' && window.document)
          Anim.move(targetEntity, destination);
        targetEntity.pos = destination;
      }
    }
  }
}
function salto(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    const destination = targetEntity.pos
      .subtract(casterEntity.pos)
      .halfTurn()
      .add(casterEntity.pos);
    if (utils.isFree(destination, og)) {
      if (typeof window != 'undefined' && window.document)
        Anim.move(targetEntity, destination);
      targetEntity.pos = destination;
    }
  }
}
function switcheroo(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    if (typeof window != 'undefined' && window.document)
      Anim.flashParticles(cell);
    const save = cell.copy();
    targetEntity.pos = casterEntity.pos;
    casterEntity.pos = save;
  }
}

function root(og, cell, spell, casterEntity, targetEntity) {
  let targetplayer = utils.findPlayerFromEntity(targetEntity, og);
  if (targetplayer) {
    if (typeof window != 'undefined' && window.document)
      Anim.debuffParticles(
        cell,
        `-${targetplayer.movePoint > 0 ? targetplayer.movePoint : ""}`,
        "PM",
      );
    targetplayer.loseMovePoint(99);
    return true;
  }
}

function silence(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    if (typeof window != 'undefined' && window.document)
      Anim.debuffParticles(cell, ``, "PA");
    console.log("silencing " + targetEntity.name)
    targetEntity.auras.push({ name: "silence", ttl: 2 });
  }
}

function buffPM(og, cell, spell, casterEntity, targetEntity) {
  let targetplayer = utils.findPlayerFromEntity(targetEntity, og);
  if (targetplayer) {
    targetplayer.buffPM(spell.value || 1);
    if (typeof window != 'undefined' && window.document)
      Anim.debuffParticles(cell, `+${spell.value || 1}`, "PM");
  }
}
function buffPO(og, cell, spell, casterEntity, targetEntity) {
  let targetplayer = utils.findPlayerFromEntity(targetEntity, og);
  if (targetplayer) {
    targetplayer.buffPO(spell.value || 1);
  }
}

function riseLava(og, cell, spell, casterEntity, targetEntity) {
  if (typeof window != 'undefined' && window.document)
    Anim.lavaParticles(cell);
  if (targetEntity) {
    // kill entities on the cell
    targetEntity.die(og);
  }
  cellM = utils.findMapCell(cell, og);
  cellM.aoe = []; //remove any aoe. We will rework if we ad a character that can survive lava
  cellM.floor = false;
}

function shield(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    // kill entities on the cell
    targetEntity.shield(spell.value || 1, spell.color, casterEntity);
  }
}

function blink(og, cell, spell, casterEntity, targetEntity) {
  // if (!targetEntity) //empty cell
  casterEntity.pos = cell;
  if (typeof window != 'undefined' && window.document)
    Anim.flashParticles(cell);
}

function summon(og, cell, spell, casterEntity, targetEntity) {
  var summoned;
  let summonData = c.GAMEDATA.TABLE_SUMMONS[spell.summon];
  if (summonData && !targetEntity) {
    //empty cell
    //if unique summon, kill previous one
    if (summonData.isUnique) {
      let previous = og.entities.find(
        (e) => e.name == summonData.name && e.summoner == casterEntity,
      );
      if (previous) previous.die(og);
    }
    summoned = new Entity(
      summonData.name,
      casterEntity.team,
      summonData.auras ? summonData.auras : [],
      summonData.summonTypes ? summonData.summonTypes : [],
      cell.copy(),
      summonData.maxHP,
      summonData.ttl,
      og.currentPlayer,
      casterEntity,
      summonData.onDeath,
      summonData.flags,
    );
    if (summoned.auras)
      summoned.auras.forEach((a) => {
        a.source = og.currentPlayer;
        if (typeof window != 'undefined' && window.document) {
          if (a.src) {
            let imageAura = new Image();
            imageAura.src = a.src;
            a.image = imageAura
          } else a.image = spell.image;
        }
      });

    og.entities.push(summoned);

    if (summoned.types.includes(c.TYPES.PLAYABLE)) {
      let summonedP = new Playable(summoned, summonData.spells, summonData.movePoint != undefined ? summonData.movePoint : 1);
      summonedP.isSummoned = true;
      og.PLAYERS.splice(
        (og.idCurrentPlayer + 1) % (og.PLAYERS.length + 1),
        0,
        summonedP,
      );
      //add spell icons to summons
      if ((typeof window != 'undefined' && window.document)) {
        summonData.spells.forEach((s, i) => {
          let image = new Image();
          image.src = s.src;
          summonedP.spells[i].image = image;
        })
      }
    }
    if (typeof window != 'undefined' && window.document) {
      if (summoned.types.includes(c.TYPES.LAUNCHED)) {
        Anim.launched(summoned, casterEntity, cell);
      } else Anim.summonParticles(cell);
    }
  }
  console.log("SUMMONED ", summoned);
  return summoned;
}

// special for perso
function golem_boulder(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    damage(og, cell, spell, casterEntity, targetEntity);
  } else {
    riseLava(og, cell, spell, casterEntity, targetEntity);
  }
}

// add this when we add LOS maybe (ldv)
/*
function fisherman_hook(og, cell, spell, casterEntity, targetEntity) {
    let res = pull(og, cell, spell, casterEntity, targetEntity)
    if (casterEntity.isEnemy(targetEntity)) damage(og, cell, spell, casterEntity, targetEntity)
    return res
}*/

function fisherman_push(og, cell, spell, casterEntity, targetEntity) {
  damage(og, cell, spell, casterEntity, targetEntity);
  push(og, cell, spell, casterEntity, targetEntity);
}

function ninja_slash(og, cell, spell, casterEntity, targetEntity, direction, mainCell) {
  if (typeof window != 'undefined' && window.document) {
    if (casterEntity.pos.add(direction).equals(cell)) { //little hack to cast the anim only once
      Anim.shadowParticles(casterEntity.pos);
      let shadow = og.entities.find(e => e.types.includes(c.TYPES.SHADOW))
      Anim.shadowParticles(shadow.pos);
    }
  }
  damage(og, cell, spell, casterEntity, targetEntity);
}

function demo_tentacle(og, cell, spell, casterEntity, targetEntity, direction) {
  console.log("demo tentacle");
  let tentacle = summon(og, cell, spell, casterEntity, targetEntity);
  tentacleHit = tentacle.auras.find((a) => (a.name = "Tentacle Hit"));
  tentacleHit.direction = direction;
  tentacleHit.source = og.currentPlayer;
  return tentacle;
}

function assassin_smokebomb(
  og,
  cell,
  spell,
  casterEntity,
  targetEntity,
  direction,
  mainCell,
) {
  if (targetEntity != casterEntity)
    root(og, cell, spell, casterEntity, targetEntity);
  if (cell == mainCell) {
    if (typeof window != 'undefined' && window.document) {
      Anim.shadowParticles(casterEntity.pos);
      Anim.move(casterEntity, mainCell);
    }
    casterEntity.pos = mainCell;
  }
}

function time_backwards_hit(og, cell, spell, casterEntity, targetEntity) {
  damage(og, cell, spell, casterEntity, targetEntity);
  push(og, cell, spell, targetEntity, casterEntity);
}

function zombie_crawl(og, cell, spell, casterEntity, targetEntity) {
  //"Moves, or in close contact deals an instant attack that also kills the caster."
  if (targetEntity) {
    damage(og, cell, spell, casterEntity, targetEntity);
    // bugfix : if the zombie is not dead yet after attacking ! (damn barrel)
    if (utils.isEntityAlive(casterEntity, og)) casterEntity.die(og);
    //todo kill player
  }
  else {
    if (typeof window != 'undefined' && window.document)
      Anim.move(casterEntity, cell);
    casterEntity.pos = cell;
  }
}
function shaman_flower(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity == casterEntity) {
    spell.permanent = false;
    //heal
    targetEntity.heal();
    //buff PO
    buffPO(og, cell, spell, casterEntity, targetEntity);
  }
}
function pango_spiky_ball(og, cell, spell, casterEntity, targetEntity) {
  buffPM(og, cell, spell, casterEntity, targetEntity);
  let newAura = {
    name: spell.name,
    dealSpell: "damage",
    aoe: "ring_1+diag",
    isAura: true,
    glyph: 1,
    color: "GLYPH_BROWN",
    image: spell.image,
    description: "Deals damage around the caster.",
  };
  newAura.source = og.currentPlayer;
  casterEntity.auras.push(newAura);
}
function warrior_charge(og, cell, spell, casterEntity, targetEntity) {
  if (targetEntity) {
    damage(og, cell, spell, casterEntity, targetEntity);
    const targetDestination = targetEntity.pos
      .subtract(casterEntity.pos)
      .scale(1 / targetEntity.pos.distance(casterEntity.pos))
      .add(targetEntity.pos);
    if (utils.isFree(targetDestination, og)) {
      if (typeof window != 'undefined' && window.document)
        Anim.move(targetEntity, targetDestination);
      casterEntity.pos = targetEntity.pos;
      targetEntity.pos = targetDestination;
    } else {
      const casterDestination = casterEntity.pos
        .subtract(targetEntity.pos)
        .scale(1 / targetEntity.pos.distance(casterEntity.pos))
        .add(targetEntity.pos);
      casterEntity.pos = casterDestination;
    }

    return true;
  }
}

function gasser_shotgun(og, cell, spell, casterEntity, targetEntity) {
  damage(og, cell, spell, casterEntity, targetEntity);
  let gas = {};
  Object.assign(gas, utils.findPlayerFromEntity(casterEntity, og).spells[0]);
  gas.source = utils.findPlayerFromEntity(casterEntity, og);
  if (cell.floor && !cell.aoe.find((s) => s.name == gas.name))
    cell.aoe.push(gas);
}

function lava_flow(og, cell, spell, casterEntity, targetEntity) {
  let pos = casterEntity.pos;
  blink(og, cell, spell, casterEntity, targetEntity);
  riseLava(og, pos, spell, casterEntity, null);
}

function water_splash(og, cell, spell, casterEntity, targetEntity, direction) {
  if (targetEntity) {
    let destination = targetEntity.pos.copy();
    destination = destination.add(direction);
    if (utils.isFree(destination, og)) {
      if (typeof window != 'undefined' && window.document){
        Anim.blueParticles(cell)
        Anim.move(targetEntity, destination);
      }
      let destinationMap = utils.findMapCell(destination, og)
      if (destinationMap) destinationMap.floor = true;
      targetEntity.pos = destination;
    }
  }
}

//on death spells
function rasta_barrel_explode(og, casterEntity) {
  console.log("Barrel exploses !");
  let listCells = aoes.makeAOEFromCell(og, casterEntity.pos, "ring_1");
  listCells.forEach((cell) =>
    resolveSpell(og, cell, { dealSpell: "damage" }, casterEntity),
  );
}

const LIB_SPELLS = {
  resolveSpell: resolveSpell,
  nothing: nothing,
  damage: damage,
  damage_others: damage_others,
  pull: pull,
  attraction: attraction,
  push: push,
  salto: salto,
  switcheroo: switcheroo,
  root: root,
  silence: silence,
  buffPM: buffPM,
  buffPO: buffPO,
  shield: shield,
  riseLava: riseLava,
  blink: blink,
  summon: summon,
  golem_boulder: golem_boulder,
  fisherman_push: fisherman_push,
  ninja_slash: ninja_slash,
  demo_tentacle: demo_tentacle,
  assassin_smokebomb: assassin_smokebomb,
  time_backwards_hit: time_backwards_hit,
  zombie_crawl: zombie_crawl,
  shaman_flower: shaman_flower,
  pango_spiky_ball: pango_spiky_ball,
  warrior_charge: warrior_charge,
  gasser_shotgun: gasser_shotgun,
  lava_flow: lava_flow,
  water_splash: water_splash,
  rasta_barrel_explode: rasta_barrel_explode,
};

module.exports = {
  resolveSpell: resolveSpell,
};
