const SIZE_PERSO = 64;
function drawEntities() {
    entities.forEach(e => drawPerso(e))
}
function drawPerso(entity) {
    if (!entity.hide) {
        pPerso = layout.hexToPixel(entity.pos);
        ctx.drawImage(entity.image, pPerso.x - SIZE_PERSO / 2, pPerso.y - SIZE_PERSO / 2, SIZE_PERSO, SIZE_PERSO);
        //todo health bar ?
    }
}


wallImage = new Image();
wallImage.src = "wall.png";

bombImage = new Image();
bombImage.src = "bomb.png";

damageIcon = new Image();
damageIcon.src = "fire_icon.png";

rootIcon = new Image();
rootIcon.src = "net.png"

lavaIcon = new Image();
lavaIcon.src = "rising.png"

gasIcon = new Image();
gasIcon.src = "gas.png"

boulderIcon = new Image();
boulderIcon.src = "boulder.png"

function canCast(entity, spell, targetCell) {
    if (entity?.pos?.distance(targetCell) <= spell.range
        && (!(spell.requires == "free") || (isFree(targetCell) && targetCell.floor))
        && (!(spell.aoe == "straight_line") || targetCell.isSameLine(entity?.pos))
        && (!spell.rangeMin || entity?.pos.distance(targetCell) >= spell.rangeMin)
    ) {
        return true; //add other tests : line of sight, blocked case ?
    }
}
function canMove(entity, posCase, max) {
    //todo pathfinding
    //en attendant 1 case max
    if (!posCase.floor) return false;
    if (max > 1) max = 1;
    res = (entity?.pos?.distance(posCase) <= max) && isFree(posCase) && posCase.floor; //and other blocked cases
    return res
}
function canRiseLava(cell, bypassEntityCheck) {
    // autorise seulement si la case est a cote de 2 cases de lave
    var res = false;
    if ((isFree(cell) || bypassEntityCheck ) && cell.floor &&  !cell.aoe.find(spell => spell.effect == "lava")) {
      let lavaCells = 0;
      map.forEach(h => {
        if (Hex.directions.find(d => h.distance(d.add(cell)) == 0 && h && !h.floor)) {
          lavaCells++;
        }
      });
      res = lavaCells >= 2;
    }
    return res;
  }

let onDeath = () => { console.log("raledagoni") }

const LAVA_SPELL =
    { name: "LAVA_SPELL", dealSpell: riseLava, range: 99, aoe: "single", delay: 0, color: ORANGE, effect: "lava", glyphIcon: lavaIcon };
const characters = [
    {
        name: "Mage",
        src: 'mage.png',
        maxHP: 4,
        spells: [
            { name: "Fireball", dealSpell: damage, range: 4, cooldown: 1, aoe: "single", delay: 1, color: GLYPH_BROWN, glyphIcon: damageIcon },
            { name: "Frost Nova", dealSpell: damage, range: 3, cooldown: 2, aoe: "ring_1", delay: 1, color: GLYPH_BROWN, glyphIcon: damageIcon },
            { name: "Blink", dealSpell: blink, range: 3, cooldown: 3, aoe: "single", requires: "free", delay: 0, type: "tp" },
            // { name: "Meteor", damage: 1, range: 4, cooldown: 5, aoe: "line", delay: 1, }
        ]
    },
    {
        name: "Fisherman",
        maxHP: 4,
        src: 'fisherman.png',
        spells: [
            { name: "Hook", dealSpell: fisherman_hook, range: 4, rangeMin: 1, cooldown: 3, aoe: "straight_line", delay: 0, effect: "pull", onlyFirst: true },
            { name: "Net", dealSpell: root, range: 4, cooldown: 2, aoe: "pair", delay: 1, color: GLYPH_BLUE, effect: "root", glyphIcon: rootIcon },
            { name: "Push", dealSpell: fisherman_push, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 0, effect: "push", value: "1" },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", delay: 1, }
        ]
    },
    {
        name: "Golem",
        maxHP: 4,
        src: 'golem.png',
        spells: [
            { name: "Boulder", dealSpell: golem_boulder, damage: 1, range: 4, cooldown: 1, aoe: "single", delay: 1, color: GLYPH_ORANGE, onMiss: "lava", glyphIcon: boulderIcon },
            { name: "Wall", dealSpell: summon, range: 4, cooldown: 3, aoe: "wall", delay: 0, ttl: 1, src: wallImage, },
            { name: "Explosion", dealSpell: damage, range: 0, cooldown: 2, aoe: "ring_1", delay: 1, color: GLYPH_BROWN },
            // { name: "Lava triangle", range: 1, cooldown: 5, aoe: "triangle_1", delay: 1, effect: "lava" }
        ]
    },
    {
        name: "Gazeur",
        maxHP: 4,
        src: 'gazeur.png',
        spells: [
            { name: "Gaz gaz gaz", dealSpell: damage, range: 0, cooldown: 0, aoe: "single", delay: 1, color: GLYPH_GAZ, passive: true, permanent: true, onMove: true, selfCast: true, affectsOnly: "other", glyphIcon: gasIcon },
            { name: "Adrenaline", dealSpell: buffPM, range: 1, cooldown: 2, aoe: "single", delay: 0, type: "BUFF_PM", value: 2 },
            { name: "Salto", dealSpell: salto, range: 1, rangeMin: 1, cooldown: 3, aoe: "single", delay: 0 },
        ]
    },
    // {
    //     name: "Terroriste",
    //     maxHP: 4,
    //     src: 'clown.png',
    //     spells: [
    //         { name: "Drop bomb", damage: 0, range: 2, rangeMin: 1, cooldown: 1, aoe: "single", requires: "free", delay: 0, ttl: 1, src: bombImage, onMiss: "summon", onDeath: onDeath },
    //         { name: "Kick bomb", damage: 0, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 0, effect: "push", value: 2, affectsOnly: "bomb" },
    //         { name: "Surprise", damage: 0, range: 4, cooldown: 1, aoe: "single", delay: 0, effect: "switcheroo" },
    //     ]
    // },
    // {
    //     name: "Warrior",
    //     src: 'warrior.png',
    //     maxHP: 4,
    //     spells: [
    //         { name: "Cleave", damage: 1, range: 2, cooldown: 2, aoe: "single", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Shield Bash", damage: 1, range: 1, cooldown: 3, aoe: "single", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Charge", damage: 1, range: 3, cooldown: 4, aoe: "line", delay: 1, color: GLYPH_BLUE, },
    //         // { name: "Whirlwind", damage: 1, range: 1, cooldown: 5, aoe: "cone", delay: 1, }
    //     ]
    // },
    // {
    //     name: "Ranger",
    //     maxHP: 4,
    //     spells: [
    //         { name: "Multi-Shot", damage: 1, range: 4, cooldown: 2, aoe: "cone", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Silent Shot", damage: 1, range: 3, cooldown: 3, aoe: "single", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Rapid Fire", damage: 1, range: 2, cooldown: 4, aoe: "line", delay: 1, color: GLYPH_BLUE, },
    //         // { name: "Vault", damage: 1, range: 1, cooldown: 5, aoe: "self", delay: 1, }
    //     ]
    // },
    // {
    //     name: "Assassin",
    //     src: 'assassin.png',
    //     maxHP: 4,
    //     spells: [
    //         { name: "Backstab", damage: 1, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Smoke bomb", damage: 1, range: 2, cooldown: 3, aoe: "area", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Blink strike", damage: 1, range: 3, cooldown: 4, aoe: "line", delay: 1, color: GLYPH_BLUE, },
    //         // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", delay: 1, }
    //     ]
    // },
];