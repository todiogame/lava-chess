
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
const INFERNAL = "INFERNAL";

//summons
//summons
const TABLE_SUMMONS = {
    "shadow": {
        name: "shadow",
        ttl: -1,
        src: shadowImage,
        summonTypes: [SHADOW],
        summonIsUnique: true,
    },
    "wall": {
        name: "wall",
        ttl: 1,
        src: wallImage,
        summonTypes: [],
    },
    "tentacle": {
        name: "tentacle",
        ttl: 1,
        src: wallImage,
        summonTypes: [],
    },
    "infernal": {
        name: "infernal",
        ttl: 1,
        src: wallImage,
        summonTypes: [INFERNAL, PLAYER],
    }
}

// let onDeath = () => { console.log("raledagoni") }

const LAVA_SPELL =
{
    name: "LAVA_SPELL", dealSpell: riseLava, range: 99, aoe: "single", delay: 0, canTarget: [EMPTY]
    // color: ORANGE, effect: "lava", glyphIcon: lavaIcon
};
const characters = [
    // {
    //     name: "Mage",
    //     src: 'pics/mage.png',
    //     spells: [
    //         { name: "Fireball", dealSpell: damage, range: 4, cooldown: 1, aoe: "single", delay: 1, color: GLYPH_BROWN, glyphIcon: damageIcon, canTarget: [ANY] },
    //         { name: "Frost Nova", dealSpell: damage, range: 3, cooldown: 2, aoe: "ring_1", delay: 1, color: GLYPH_BROWN, glyphIcon: damageIcon, canTarget: [ANY] },
    //         { name: "Blink", dealSpell: blink, range: 3, cooldown: 3, aoe: "single",  delay: 0, type: "tp", canTarget: [EMPTY] },
    //         // { name: "Meteor", damage: 1, range: 4, cooldown: 5, aoe: "line", delay: 1, }
    //     ]
    // },
    // {
    //     name: "Fisherman",
    //     src: 'pics/fisherman.png',
    //     spells: [
    //         { name: "Hook", dealSpell: fisherman_hook, range: 4, rangeMin: 1, cooldown: 3, aoe: "straight_line", delay: 0, onlyFirst: true, canTarget: [ENTITY] },
    //         { name: "Net", dealSpell: root, range: 4, cooldown: 2, aoe: "pair", delay: 1, color: GLYPH_BLUE, glyphIcon: rootIcon, canTarget: [ANY] },
    //         { name: "Belly bump", dealSpell: fisherman_push, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 0, value: "1", canTarget: [ENTITY] },
    //         // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", delay: 1, }
    //     ]
    // },
    {
        name: "Golem",
        src: 'pics/golem.png',
        spells: [
            { name: "Boulder", dealSpell: golem_boulder, range: 4, cooldown: 1, aoe: "single", delay: 1, color: GLYPH_ORANGE, onMiss: "lava", glyphIcon: boulderIcon, canTarget: [ANY] },
            { name: "Wall", dealSpell: summon, summon: TABLE_SUMMONS["wall"], range: 4, cooldown: 3, aoe: "wall", delay: 0, ttl: 1, src: wallImage, canTarget: [ANY], },
            { name: "Explosion", dealSpell: damage, range: 0, cooldown: 2, aoe: "ring_1", isAura: true, delay: 1, color: GLYPH_BROWN, canTarget: [PLAYER] },
            // { name: "Lava triangle", range: 1, cooldown: 5, aoe: "triangle_1", delay: 1, effect: "lava" }
        ]
    },
    {
        name: "Gazeur",
        src: 'pics/gazeur.png',
        spells: [
            { name: "Gaz gaz gaz", dealSpell: damage, range: 0, cooldown: 0, aoe: "single", delay: 1, color: GLYPH_GAZ, passive: true, permanent: true, onMove: true, selfCast: true, affectsOnly: "other", glyphIcon: gasIcon, canTarget: [ANY] },
            { name: "Adrenaline", dealSpell: buffPM, range: 0, cooldown: 2, aoe: "single", delay: 0, type: "BUFF_PM", value: 2, canTarget: [ENTITY] },
            { name: "Salto", dealSpell: salto, range: 1, rangeMin: 1, cooldown: 3, aoe: "single", delay: 0, canTarget: [ENTITY] },
        ]
    },
    {
        name: "Ninja",
        src: 'pics/ninja.png',
        spells: [
            { name: "Drop shadow", dealSpell: summon, summon: TABLE_SUMMONS["shadow"], range: 2, rangeMin: 1, cooldown: 3, aoe: "single",  delay: 0, canTarget: [EMPTY] },
            { name: "Spinning slash", dealSpell: damage, range: 0, cooldown: 2, aoe: "ninja_slash", delay: 0, canTarget: [PLAYER] },
            { name: "Illusion", dealSpell: switcheroo, range: 8, cooldown: 2, aoe: "single", delay: 0, canTarget: [SHADOW] },
        ]
    },
    {
        name: "Demoniste",
        src: 'pics/demonist.png',
        spells: [
            { name: "Tentacle", dealSpell: summon, summon: TABLE_SUMMONS["tentacle"], range: 3, rangeMin: 3, cooldown: 1, aoe: "single",  delay: 0, canTarget: [EMPTY]  },
            { name: "Summon Infernal",   dealSpell: summon, summon: TABLE_SUMMONS["infernal"], range: 1, rangeMin: 1, cooldown: 5, aoe: "single", delay: 0, summonIsUnique: true, canTarget: [EMPTY] },
            { name: "Speed Boost",  dealSpell: buffPM, range: 1, cooldown: 1, aoe: "single", delay: 0,},
        ]
    },
    // {
    //     name: "Terroriste",
    //     src: 'pics/clown.png',
    //     spells: [
    //         { name: "Drop bomb", dealSpell: summon, range: 2, rangeMin: 1, cooldown: 1, aoe: "single", delay: 0, ttl: 1, src: bombImage, },
    //         { name: "Kick bomb",  dealSpell: push,  range: 1, rangeMin: 1, cooldown: 2, aoe: "single", delay: 0, value: 2, affectsOnly: "bomb" },
    //         { name: "Surprise",  range: 4, cooldown: 1, aoe: "single", delay: 0, effect: "switcheroo" },
    //     ]
    // },
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