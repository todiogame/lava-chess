
//cell types
const ANY = "ANY";
const LAVA = "LAVA";
const EMPTY = "EMPTY";
//entities types
const ENTITY = "ENTITY";
const PLAYABLE = "PLAYABLE";
// summons types
const SHADOW = "SHADOW";
const BOMB = "BOMB";
const INFERNAL = "INFERNAL";
const BARREL = "BARREL";

//summons
const TABLE_SUMMONS = {
    "shadow": {
        name: "shadow",
        ttl: -1,
        summonTypes: [SHADOW],
        isUnique: true,
    },
    "wall": {
        name: "wall",
        ttl: 1,
        summonTypes: [],
    },
    "tentacle": {
        name: "tentacle",
        ttl: 1,
        summonTypes: [],
        auras: [
            { name: "Tentacle Hit", dealSpell: damage, aoe: "tentacle_hit", isAura: true, glyph: 1, color: GLYPH_BROWN, }
        ],
    },
    "infernal": {
        name: "Infernal",
        ttl: -1,
        maxHP: 3,
        isUnique: true,
        summonTypes: [INFERNAL, PLAYABLE],
        auras: [
            { name: "Flame aura", permanent: true, dealSpell: damage, aoe: "ring_1", isAura: true, glyph: 1, color: GLYPH_BROWN, glyphIcon: damageIcon }
        ],
        spells: [
            { passive: true, cooldown: 0, name: "Flame aura", permanent: true, dealSpell: damage, aoe: "ring_1", isAura: true, glyph: 1, color: GLYPH_BROWN, glyphIcon: damageIcon },
            { passive: true, cooldown: 0, name: "", permanent: true, dealSpell: damage, aoe: "ring_1", isAura: true, glyph: 1, color: GLYPH_BROWN, glyphIcon: damageIcon },
            { passive: true, cooldown: 0, name: "", permanent: true, dealSpell: damage, aoe: "ring_1", isAura: true, glyph: 1, color: GLYPH_BROWN, glyphIcon: damageIcon },

        ]
    },
    "barrel": {
        name: "barrel",
        ttl: -1,
        summonTypes: [BARREL],
        maxHP: 1,
        onDeath: rasta_barrel_explode,
        auras: [
            { name: "Barrel AOE preview", permanent: true, dealSpell: nothing, aoe: "area_1", isAura: true, glyph: 1, color: GLYPH_PREVIEW,  }
        ],
    },
}

// let onDeath = () => { console.log("raledagoni") }

const LAVA_SPELL =
{
    name: "LAVA_SPELL", dealSpell: riseLava, range: 99, aoe: "single", canTarget: [EMPTY]
    // color: ORANGE, effect: "lava", glyphIcon: lavaIcon
};
const characters = [
    // {
    //     name: "MageTest",
    //     spells: [
    //         { name: "Fireball", dealSpell: damage, range: 4, cooldown: 1, aoe: "single", glyph: 1, color: GLYPH_BROWN, glyphIcon: damageIcon, canTarget: [ANY] },
    //         { name: "Frost Nova", dealSpell: damage, range: 3, cooldown: 2, aoe: "ring_1", glyph: 1, color: GLYPH_BROWN, glyphIcon: damageIcon, canTarget: [ANY] },
    //         { name: "Blink", dealSpell: blink, range: 3, cooldown: 3, aoe: "single",  glyph: 0, type: "tp", canTarget: [EMPTY] },
    //         // { name: "Meteor", damage: 1, range: 4, cooldown: 5, aoe: "line", glyph: 1, }
    //     ]
    // },
    {
        name: "Mage",
        spells: [
            { name: "Inferno Strike", dealSpell: damage, range: 4, rangeMin: 2, cooldown: 1, aoe: "straight_line_space_1", glyph: 1, color: GLYPH_BROWN, glyphIcon: damageIcon, canTarget: [ANY] },
            { name: "Freezing Curse", dealSpell: root, range: 2, rangeMin: 2, cooldown: 2, aoe: "square", glyph: 1, color: GLYPH_BLUE, glyphIcon: rootIcon, canTarget: [ANY] },
            { name: "Force Wave", dealSpell: push, range: 0, cooldown: 3, aoe: "ring_1", canTarget: [PLAYABLE] },
            // { name: "Blink", dealSpell: blink, range: 3, cooldown: 3, aoe: "single", glyph: 0, canTarget: [EMPTY] },
        ]
    },
    {
        name: "Fisherman",
        spells: [
            { name: "Bait Hook", dealSpell: pull, range: 4, rangeMin: 1, cooldown: 3, aoe: "straight_line", onlyFirst: true, canTarget: [ENTITY] },
            { name: "Fishing Net", dealSpell: root, range: 4, cooldown: 2, aoe: "pair", glyph: 1, color: GLYPH_BLUE, glyphIcon: rootIcon, canTarget: [ANY] },
            { name: "Belly Bump", dealSpell: fisherman_push, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: "1", canTarget: [ENTITY] },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, }
        ]
    },
    {
        name: "Golem",
        spells: [
            { name: "Boulder Smash", dealSpell: golem_boulder, range: 4, cooldown: 1, aoe: "single", glyph: 1, color: GLYPH_ORANGE, onMiss: "lava", glyphIcon: boulderIcon, canTarget: [ANY] },
            { name: "Magma Wall", dealSpell: summon, summon: TABLE_SUMMONS["wall"], range: 3, cooldown: 3, aoe: "curly", ttl: 1, canTarget: [ANY], },
            { name: "Explosion", dealSpell: damage, range: 0, cooldown: 2, aoe: "ring_1", isAura: true, glyph: 1, color: GLYPH_BROWN, canTarget: [PLAYABLE] },
            // { name: "Lava triangle", range: 1, cooldown: 5, aoe: "triangle_1", glyph: 1, effect: "lava" }
        ]
    },
    // {
    //     name: "Gazeur",
    //     spells: [
    //         { name: "Gaz gaz gaz", dealSpell: damage, range: 0, cooldown: 0, aoe: "single", glyph: 1, color: GLYPH_GAZ, passive: true, permanent: true, onMove: true, selfCast: true, affectsOnly: "other", glyphIcon: gasIcon, canTarget: [ANY] },
    //         { name: "Adrenaline", dealSpell: buffPM, range: 0, cooldown: 2, aoe: "single", type: "BUFF_PM", value: 2, canTarget: [ENTITY] },
    //         { name: "Salto", dealSpell: salto, range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [ENTITY] },
    //     ]
    // },
    {
        name: "Ninja",
        spells: [
            { name: "Cast Shadow", dealSpell: summon, summon: TABLE_SUMMONS["shadow"], range: 2, rangeMin: 1, cooldown: 3, aoe: "single", glyph: 0, canTarget: [EMPTY] },
            { name: "Spinning Slash", dealSpell: damage, range: 0, cooldown: 2, aoe: "ninja_slash", canTarget: [PLAYABLE] },
            { name: "Master of Illusion", dealSpell: switcheroo, range: 8, cooldown: 2, aoe: "single", canTarget: [SHADOW] },
        ]
    },
    {
        name: "Demonist",
        spells: [
            { name: "Spawn Tentacle", dealSpell: demo_tentacle, summon: TABLE_SUMMONS["tentacle"], range: 3, rangeMin: 3, cooldown: 1, aoe: "tentacle", onlyFirst: true, canTarget: [EMPTY] },
            { name: "Summon Infernal", dealSpell: summon, summon: TABLE_SUMMONS["infernal"], range: 1, rangeMin: 1, cooldown: 5, aoe: "single", canTarget: [EMPTY] },
            { name: "Speed Boost", dealSpell: buffPM, range: 1, cooldown: 3, aoe: "single", canTarget: [ENTITY] },
        ]
    },
    {
        name: "Rasta",
        spells: [
            { name: "Gatling Shot", dealSpell: damage, range: 99, cooldown: 1, aoe: "line", aoeSize:5, glyph: 1, canTarget: [ANY], color: GLYPH_BROWN, glyphIcon: damageIcon },
            { name: "Rolling Barrel", dealSpell: summon, summon: TABLE_SUMMONS["barrel"], range: 2, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [EMPTY] },
            { name: "Jamming Retreat", dealSpell: buffPM, value: 2, range: 0, cooldown: 3, aoe: "single", canTarget: [ENTITY] },
        ]
    },
    // {
    //     name: "Terroriste",
    //     spells: [
    //         { name: "Drop bomb", dealSpell: summon, range: 2, rangeMin: 1, cooldown: 1, aoe: "single", ttl: 1, src: bombImage, },
    //         { name: "Kick bomb",  dealSpell: push,  range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: 2, affectsOnly: "bomb" },
    //         { name: "Surprise",  range: 4, cooldown: 1, aoe: "single", effect: "switcheroo" },
    //     ]
    // },
    // {
    //     name: "Warrior",
    //     spells: [
    //         { name: "Cleave", damage: 1, range: 2, cooldown: 2, aoe: "single", glyph: 1, color: GLYPH_BLUE, },
    //         { name: "Shield Bash", damage: 1, range: 1, cooldown: 3, aoe: "single", glyph: 1, color: GLYPH_BLUE, },
    //         { name: "Charge", damage: 1, range: 3, cooldown: 4, aoe: "line", glyph: 1, color: GLYPH_BLUE, },
    //         // { name: "Whirlwind", damage: 1, range: 1, cooldown: 5, aoe: "cone", glyph: 1, }
    //     ]
    // },
    // {
    //     name: "Ranger",
    //     spells: [
    //         { name: "Multi-Shot", damage: 1, range: 4, cooldown: 2, aoe: "cone", glyph: 1, color: GLYPH_BLUE, },
    //         { name: "Silent Shot", damage: 1, range: 3, cooldown: 3, aoe: "single", glyph: 1, color: GLYPH_BLUE, },
    //         { name: "Rapid Fire", damage: 1, range: 2, cooldown: 4, aoe: "line", glyph: 1, color: GLYPH_BLUE, },
    //         // { name: "Vault", damage: 1, range: 1, cooldown: 5, aoe: "self", glyph: 1, }
    //     ]
    // },
    // {
    //     name: "Assassin",
    //     spells: [
    //         { name: "Backstab", damage: 1, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", glyph: 1, color: GLYPH_BLUE, },
    //         { name: "Smoke bomb", damage: 1, range: 2, cooldown: 3, aoe: "area", glyph: 1, color: GLYPH_BLUE, },
    //         { name: "Blink strike", damage: 1, range: 3, cooldown: 4, aoe: "line", glyph: 1, color: GLYPH_BLUE, },
    //         // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, }
    //     ]
    // },
];