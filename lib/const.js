const CONSTANTS = Object.freeze({
    MAP_RADIUS: 5,
    NB_PAWNS: 4,

})

const ANIMATIONS = {
    FALL: "FALL",
}

const TYPES = Object.freeze({
    //cell types
    ANY: "ANY",
    LAVA: "LAVA",
    EMPTY: "EMPTY",
    //entities types
    ENTITY: "ENTITY",
    PLAYABLE: "PLAYABLE",
    // summons types
    LAUNCHED : "LAUNCHED", //generic for animation
    SHADOW: "SHADOW",
    BOMB: "BOMB",
    INFERNAL: "INFERNAL",
    BARREL: "BARREL",
})

const GAMEDATA = Object.freeze({
//summons
TABLE_SUMMONS: {
    "shadow": {
        name: "shadow",
            ttl: -1,
                summonTypes: [TYPES.SHADOW, TYPES.LAUNCHED],
                    isUnique: true,
            },
    "wall": {
        name: "wall",
            ttl: 1,
                summonTypes: [TYPES.LAUNCHED],
            },
    "tentacle": {
        name: "tentacle",
            ttl: 1,
                summonTypes: [],
                    auras: [
                        { name: "Tentacle Hit", dealSpell: "damage", aoe: "tentacle_hit", isAura: true, glyph: 1, color: "GLYPH_BROWN", }
                    ],
            },
    "infernal": {
        name: "Infernal",
            ttl: -1,
                maxHP: 3,
                    isUnique: true,
                        summonTypes: [TYPES.INFERNAL, TYPES.PLAYABLE],
                            auras: [
                                { name: "Flame aura", permanent: true, dealSpell: "damage", aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" }
                            ],
                                spells: [
                                    { passive: true, cooldown: 0, name: "Flame aura", permanent: true, dealSpell: "damage", aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" },
                                    { passive: true, cooldown: 0, name: "" },
                                    { passive: true, cooldown: 0, name: "" },

                                ]
    },
    "barrel": {
        name: "barrel",
            ttl: -1,
                summonTypes: [TYPES.BARREL, TYPES.LAUNCHED],
                    maxHP: 1,
                        onDeath: "rasta_barrel_explode",
                            auras: [
                                { name: "Barrel AOE preview", permanent: true, dealSpell: "nothing", aoe: "area_1", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", }
                            ],
            },

    "time_machine": {
        name: "time_machine",
            ttl: 1,
                summonTypes: [TYPES.LAUNCHED],
                    maxHP: 1,
                        auras: [
                            { name: "Time Machine", dealSpell: "blink", aoe: "single", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", },
                            { name: "Explosion", dealSpell: "damage", aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", },
                        ],
            },

    "zombie": {
        name: "Zombie",
            ttl: -1,
                maxHP: 1,
                    summonTypes: [TYPES.PLAYABLE],
                        auras: [],
                            spells: [
                                //just an hud indication, this spell works with the aura
                                { name: "Zombie Attack", dealSpell: "zombie_attack", range: 1, rangeMin: 1, cooldown: 0, aoe: "single", canTarget: [TYPES.ENTITY] },
                                { passive: true, cooldown: 0, name: "" },
                                { passive: true, cooldown: 0, name: "" },
                            ]
    },
},


LAVA_SPELL: {
    name: "LAVA_SPELL", dealSpell: "riseLava", range: 9, aoe: "single", canTarget: [TYPES.EMPTY]
    // color: ORANGE, effect: "lava", glyphIcon: "lavaIcon"
},
CHARACTERS: [
    {
        name: "Mage",
        spells: [
            { name: "Inferno Strike", dealSpell: "damage", range: 4, rangeMin: 2, cooldown: 1, aoe: "straight_line_inferno", glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon", canTarget: [TYPES.ANY], description: "Deals damage in a straight line." },
            { name: "Freezing Curse", dealSpell: "root", range: 2, rangeMin: 2, cooldown: 3, aoe: "square", canTarget: [TYPES.ANY], description: "Instantly roots targets in a square area." },
            { name: "Force Wave", dealSpell: "push", range: 0, cooldown: 2, aoe: "ring_1", canTarget: [TYPES.PLAYABLE], animation: ANIMATIONS.FALL, description: "Pushes out anyone around the caster in a ring area." },
            // { name: "Blink", dealSpell: "blink", range: 3, cooldown: 3, aoe: "single", glyph: 0, canTarget: [TYPES.EMPTY] },
        ]
    },
    {
        name: "Fisherman",
        spells: [
            { name: "Bait Hook", dealSpell: "pull", range: 5, rangeMin: 1, cooldown: 3, aoe: "straight_line", onlyFirst: true, canTarget: [TYPES.ENTITY], description: "Pulls first target in a straight line." },
            { name: "Fishing Net", dealSpell: "root", range: 4, cooldown: 2, aoe: "pair", glyph: 1, color: "GLYPH_BLUE", glyphIcon: "rootIcon", canTarget: [TYPES.ANY], description: "Drops a 2-cells net that roots targets who start their turn inside." },
            { name: "Belly Bump", dealSpell: "fisherman_push", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: "1", canTarget: [TYPES.ENTITY], description: "Pushes target and deals instant damage." },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, }
        ]
    },
    {
        name: "Golem",
        spells: [
            { name: "Boulder Smash", dealSpell: "golem_boulder", range: 4, cooldown: 1, aoe: "single", glyph: 1, color: "GLYPH_ORANGE", onMiss: "lava", glyphIcon: "boulderIcon", canTarget: [TYPES.ANY], animation: ANIMATIONS.FALL, description: "Deals damage, but if the cell was empty, rise lava." },
            { name: "Magma Wall", dealSpell: "summon", summon: "wall", range: 3, cooldown: 3, aoe: "curly", ttl: 1, canTarget: [TYPES.ANY], description: "Summons a wall in a curly area around a targeted cell." },
            { name: "Explosion", dealSpell: "damage", range: 0, cooldown: 2, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", canTarget: [TYPES.PLAYABLE], description: "Deals damage around the caster." },
        ]
    },
    {
        name: "Ninja",
        spells: [
            { name: "Cast Shadow", dealSpell: "summon", summon: "shadow", range: 2, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.EMPTY], description: "Summons a shadow that can cast Spinning Slash." },
            { name: "Spinning Slash", dealSpell: "damage", range: 0, cooldown: 2, aoe: "ninja_slash", canTarget: [TYPES.PLAYABLE], description: "Deals instant damage in a circular area around the caster and its shadow." },
            { name: "Master of Illusion", dealSpell: "switcheroo", range: 8, cooldown: 2, aoe: "single", canTarget: [TYPES.SHADOW], description: "Swaps the positions of the caster and its shadow." },
        ]
    },
    {
        name: "Demonist",
        spells: [
            { name: "Spawn Tentacle", dealSpell: "demo_tentacle", summon: "tentacle", range: 3, rangeMin: 3, cooldown: 1, aoe: "tentacle", onlyFirst: true, canTarget: [TYPES.EMPTY], description: "Spawns a tentacle that damages in a line." },
            { name: "Summon Infernal", dealSpell: "summon", summon: "infernal", range: 1, rangeMin: 1, cooldown: 5, aoe: "single", canTarget: [TYPES.EMPTY], description: "Summons an infernal with a burning aura." },
            { name: "Speed Boost", dealSpell: "buffPM", range: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.ENTITY], description: "Grants 1 more movement point to an ally." },
        ]
    },
    {
        name: "Rasta",
        spells: [
            { name: "Gatling Shot", dealSpell: "damage", range: 9, cooldown: 1, aoe: "line", aoeSize: 5, glyph: 1, canTarget: [TYPES.ANY], color: "GLYPH_BROWN", glyphIcon: "damageIcon", animation: ANIMATIONS.FALL, description: "Deals damage in a straight line." },
            { name: "Rolling Barrel", dealSpell: "summon", summon: "barrel", range: 2, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.EMPTY], description: "Places explosive barrel." },
            { name: "Jamming Retreat", dealSpell: "buffPM", value: 2, range: 0, cooldown: 3, aoe: "single", canTarget: [TYPES.ENTITY], description: "Grants 2 more movement points to the caster." },
        ]
    },
    {
        name: "Assassin",
        spells: [
            { name: "Backstab", dealSpell: "damage", range: 1, rangeMin: 1, cooldown: 1, aoe: "single", canTarget: [TYPES.ENTITY], description: "Deals instant damage to a single target in close range." },
            { name: "Silent Bullet", dealSpell: "damage", range: 3, rangeMin: 3, cooldown: 2, aoe: "single_straight_line", canTarget: [TYPES.ENTITY], description: "Deals instant damage to a single target in a straight line at 3 range." },
            { name: "Smoke bomb", dealSpell: "assassin_smokebomb", range: 1, rangeMin: 1, cooldown: 3, aoe: "ring_1_on_self", canTarget: [TYPES.EMPTY], description: "Instantly roots all targets at close range and moves one cell." },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
        ]
    },
    {
        name: "Time Traveller",
        spells: [
            { name: "Time Machine", dealSpell: "summon", summon: "time_machine", range: 3, rangeMin: 1, cooldown: 1, aoe: "single", glyph: 0, canTarget: [TYPES.EMPTY], description: "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location." },
            { name: "Backwards Hit", dealSpell: "time_backwards_hit", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.ENTITY], description: "Deals instant damage to a single target in close range, the caster then gets pushed backwards." },
            { name: "Silence Lance", dealSpell: "silence", range: 3, rangeMin: 0, cooldown: 2, aoe: "handspinner", glyph: 1, color: "GLYPH_PURPLE", glyphIcon: "silenceIcon", canTarget: [TYPES.ANY], description: "Silences in a handspinner area." },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
        ]
    },
    {
        name: "Shaman",
        spells: [
            { name: "Undead Army", dealSpell: "summon", summon: "zombie", range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.EMPTY], description: "Summons a zombie." },
            { name: "Happy Flower", dealSpell: "shaman_flower", range: 9, rangeMin: 3, cooldown: 2, aoe: "single", glyph: 1, permanent: true, canTarget: [TYPES.EMPTY], color: 'GLYPH_FLOWER', glyphIcon: "flowerIcon", description: "Creates a happy flower that heals and boosts the caster's range when he starts his turn on the glyph." },
            { name: "Voodoo Curse", dealSpell: "silence", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.PLAYABLE], description: "Instantly silences a single target." },
        ]
    },
//           {
//       name: "Pangolino",
//       spells: [
//           { name: "Spiky Ball", dealSpell: "pango_spiky_ball", range: 0, cooldown: 1, aoe: "single", canTarget: [TYPES.PLAYABLE], description: "Instantly gains 1 movement point and will deal damage around the caster." },
//           { name: "Defensive stance",dealSpell: "shield", range: 0, cooldown: 3, aoe: "single", canTarget: [TYPES.PLAYABLE], color: "GLYPH_ORANGE", },
//           { name:  "Booby Trap",dealSpell: "root", range: 2, cooldown: 2, aoe: "single", permanent :true, onlyFirst: true, glyph: 1, color: "GLYPH_GAZ", glyphIcon: "rootIcon", canTarget: [TYPES.ANY], description: "Drops a lasting trap that roots targets who start their turn inside." },
//       ]
//   },
]
    })

module.exports = {
    CONSTANTS, TYPES, GAMEDATA, ANIMATIONS
}