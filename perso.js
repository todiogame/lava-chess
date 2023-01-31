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
//cell types
const ANY = "ANY";
const LAVA = "LAVA";
const EMPTY = "EMPTY";
//entities types
const ENTITY = "ENTITY";
const PLAYER = "PLAYER";
// summons types
const SHADOW = "SHADOW";
const BOMB = "BOMB";

//summons
wallImage = new Image();
wallImage.src = "wall.png";

bombImage = new Image();
bombImage.src = "bomb.png";

shadowImage = new Image();
shadowImage.src = "shadow.png"

//glyphs
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

function canCast(caster, spell, targetCell) {
    //check range
    if (outOfRange(caster, spell, targetCell)) return false;

    //check affects types :
    let isAffected = false;
    if (spell.canTarget?.includes(ANY)) {
        isAffected = true;
    } else {
        //targetCell is map cell with info
        var typesCell = new Set()
        if (!targetCell.floor) typesCell.add(LAVA)
        else {
            let entity = entities.find(e => e.pos.distance(targetCell) == 0)
            if (!entity) typesCell.add(EMPTY)
            else {
                typesCell.add(ENTITY)
                entity.types.forEach(item => typesCell.add(item))
            }
        }
        //at this point we have 
        spell.canTarget?.forEach(typesSpell => {
            if (typesCell.has(typesSpell)) isAffected = true;
        });
    }

    return isAffected;
    //add other tests : line of sight, blocked case ?
}
function outOfRange(caster, spell, targetCell) {
    return (caster.pos.distance(targetCell) > spell.range)
        || (spell.rangeMin && caster.pos.distance(targetCell) < spell.rangeMin)
        || ((spell.aoe == "straight_line") && !(targetCell.isSameLine(caster.pos)));
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
    // autorise seulement si la case est a cote de 3 cases de lave
    var res = false;
    if ((isFree(cell) || bypassEntityCheck) && cell.floor && !cell.aoe.find(spell => spell.effect == "lava")) {
        let lavaCells = 0;
        map.forEach(h => {
            if (Hex.directions.find(d => h.distance(d.add(cell)) == 0 && h && !h.floor)) {
                lavaCells++;
            }
        });
        res = lavaCells >= 3;
    }
    return res;
}

let onDeath = () => { console.log("raledagoni") }

const LAVA_SPELL =
{
    name: "LAVA_SPELL", dealSpell: riseLava, range: 99, aoe: "single", delay: 0,
    // color: ORANGE, effect: "lava", glyphIcon: lavaIcon
};
const characters = [
    {
        name: "Mage",
        src: 'mage.png',
        spells: [
            { name: "Fireball", dealSpell: damage, range: 4, cooldown: 1, aoe: "single", delay: 1, color: GLYPH_BROWN, glyphIcon: damageIcon, canTarget: [ANY] },
            { name: "Frost Nova", dealSpell: damage, range: 3, cooldown: 2, aoe: "ring_1", delay: 1, color: GLYPH_BROWN, glyphIcon: damageIcon, canTarget: [ANY] },
            { name: "Blink", dealSpell: blink, range: 3, cooldown: 3, aoe: "single", requires: "free", delay: 0, type: "tp", canTarget: [EMPTY] },
            // { name: "Meteor", damage: 1, range: 4, cooldown: 5, aoe: "line", delay: 1, }
        ]
    },
    {
        name: "Fisherman",
        src: 'fisherman.png',
        spells: [
            { name: "Hook", dealSpell: fisherman_hook, range: 4, rangeMin: 1, cooldown: 3, aoe: "straight_line", delay: 0, onlyFirst: true, canTarget: [ENTITY] },
            { name: "Net", dealSpell: root, range: 4, cooldown: 2, aoe: "pair", delay: 1, color: GLYPH_BLUE, glyphIcon: rootIcon, canTarget: [ANY] },
            { name: "Belly bump", dealSpell: fisherman_push, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 0, value: "1", canTarget: [ENTITY] },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", delay: 1, }
        ]
    },
    {
        name: "Golem",
        src: 'golem.png',
        spells: [
            { name: "Boulder", dealSpell: golem_boulder, range: 4, cooldown: 1, aoe: "single", delay: 1, color: GLYPH_ORANGE, onMiss: "lava", glyphIcon: boulderIcon, canTarget: [ANY] },
            { name: "Wall", dealSpell: summon, range: 4, cooldown: 3, aoe: "wall", delay: 0, ttl: 1, src: wallImage, canTarget: [ANY], summonTypes:[] },
            { name: "Explosion", dealSpell: damage, range: 0, cooldown: 2, aoe: "ring_1", isAura: true, delay: 1, color: GLYPH_BROWN, canTarget: [PLAYER] },
            // { name: "Lava triangle", range: 1, cooldown: 5, aoe: "triangle_1", delay: 1, effect: "lava" }
        ]
    },
    {
        name: "Gazeur",
        src: 'gazeur.png',
        spells: [
            { name: "Gaz gaz gaz", dealSpell: damage, range: 0, cooldown: 0, aoe: "single", delay: 1, color: GLYPH_GAZ, passive: true, permanent: true, onMove: true, selfCast: true, affectsOnly: "other", glyphIcon: gasIcon, canTarget: [ANY] },
            { name: "Adrenaline", dealSpell: buffPM, range: 0, cooldown: 2, aoe: "single", delay: 0, type: "BUFF_PM", value: 2, canTarget: [ENTITY] },
            { name: "Salto", dealSpell: salto, range: 1, rangeMin: 1, cooldown: 3, aoe: "single", delay: 0, canTarget: [ENTITY] },
        ]
    },
    // {
    //     name: "Terroriste",
    //     src: 'clown.png',
    //     spells: [
    //         { name: "Drop bomb", dealSpell: summon, range: 2, rangeMin: 1, cooldown: 1, aoe: "single", requires: "free", delay: 0, ttl: 1, src: bombImage, },
    //         { name: "Kick bomb",  dealSpell: push,  range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 0, value: 2, affectsOnly: "bomb" },
    //         { name: "Surprise",  range: 4, cooldown: 1, aoe: "single", delay: 0, effect: "switcheroo" },
    //     ]
    // },
    {
        name: "Ninja",
        src: 'ninja.png',
        spells: [
            { name: "Drop shadow", dealSpell: summon, range: 2, rangeMin: 1, cooldown: 3, aoe: "single", requires: "free", delay: 0, ttl: -1, src: shadowImage, summonTypes: [SHADOW], summonIsUnique: true, canTarget: [EMPTY] },
            { name: "Spinning slash", dealSpell: damage, range: 0, cooldown: 2, aoe: "ninja_slash", delay: 0, canTarget: [PLAYER] },
            { name: "Illusion", dealSpell: switcheroo, range: 8, cooldown: 2, aoe: "single", delay: 0, canTarget: [SHADOW] },
        ]
    },
    // {
    //     name: "Warrior",
    //     src: 'warrior.png',
    //     spells: [
    //         { name: "Cleave", damage: 1, range: 2, cooldown: 2, aoe: "single", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Shield Bash", damage: 1, range: 1, cooldown: 3, aoe: "single", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Charge", damage: 1, range: 3, cooldown: 4, aoe: "line", delay: 1, color: GLYPH_BLUE, },
    //         // { name: "Whirlwind", damage: 1, range: 1, cooldown: 5, aoe: "cone", delay: 1, }
    //     ]
    // },
    // {
    //     name: "Ranger",
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
    //     spells: [
    //         { name: "Backstab", damage: 1, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Smoke bomb", damage: 1, range: 2, cooldown: 3, aoe: "area", delay: 1, color: GLYPH_BLUE, },
    //         { name: "Blink strike", damage: 1, range: 3, cooldown: 4, aoe: "line", delay: 1, color: GLYPH_BLUE, },
    //         // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", delay: 1, }
    //     ]
    // },
];