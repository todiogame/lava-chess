const CONSTANTS = Object.freeze({
    MAP_RADIUS: 5,
    NB_PAWNS: 4,
    MAX_HP_PLAYER:4,
    TEAM_RED: "red",
    TEAM_BLUE: "cyan",
    PICK_BAN_ORDER: ["BAN", "BAN", "PICK", "PICK", "PICK", "PICK",]
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
    PLAYER: "PLAYER",
    VULNERABLE: "VULNERABLE",
    // summons types
    LAUNCHED: "LAUNCHED", //generic for animation
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
            summonTypes: [TYPES.INFERNAL, TYPES.PLAYABLE, TYPES.VULNERABLE],
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
            summonTypes: [TYPES.BARREL, TYPES.LAUNCHED, TYPES.VULNERABLE],
            maxHP: 1,
            onDeath: "rasta_barrel_explode",
            auras: [
                { name: "Barrel AOE preview", permanent: true, dealSpell: "nothing", aoe: "area_1", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", }
            ],
        },

        "time_machine": {
            name: "time_machine",
            ttl: 1,
            summonTypes: [TYPES.LAUNCHED, TYPES.VULNERABLE],
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
            summonTypes: [TYPES.PLAYABLE, TYPES.VULNERABLE],
            auras: [],
            spells: [
                //just an hud indication, this spell works with the aura
                { name: "Zombie Attack", dealSpell: "zombie_attack", range: 1, rangeMin: 1, cooldown: 0, aoe: "single", canTarget: [TYPES.VULNERABLE] },
                { passive: true, cooldown: 0, name: "" },
                { passive: true, cooldown: 0, name: "" },
            ]
        },
    },


    LAVA_SPELL: {
        name: "LAVA_SPELL", dealSpell: "riseLava", range: 9, aoe: "single", canTarget: [TYPES.EMPTY]
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
                { name: "Belly Bump", dealSpell: "fisherman_push", range: 1, rangeMin: 1, cooldown: 1, aoe: "single", value: "1", canTarget: [TYPES.ENTITY], description: "Pushes target and deals instant damage." },
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
                { name: "Speed Boost", dealSpell: "buffPM", range: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.PLAYABLE], description: "Grants 1 more movement point to an ally." },
            ]
        },
        {
            name: "Rasta",
            spells: [
                { name: "Gatling Shot", dealSpell: "damage", range: 9, cooldown: 1, aoe: "line", aoeSize: 5, glyph: 1, canTarget: [TYPES.ANY], color: "GLYPH_BROWN", glyphIcon: "damageIcon", animation: ANIMATIONS.FALL, description: "Deals damage in a straight line." },
                { name: "Rolling Barrel", dealSpell: "summon", summon: "barrel", range: 2, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.EMPTY], description: "Places explosive barrel." },
                { name: "Jamming Retreat", dealSpell: "buffPM", value: 2, range: 0, cooldown: 3, aoe: "single", canTarget: [TYPES.PLAYABLE], description: "Grants 2 more movement points to the caster." },
            ]
        },
        {
            name: "Assassin",
            spells: [
                { name: "Backstab", dealSpell: "damage", range: 1, rangeMin: 1, cooldown: 1, aoe: "single", canTarget: [TYPES.VULNERABLE], description: "Deals instant damage to a single target in close range." },
                { name: "Silent Bullet", dealSpell: "damage", range: 3, rangeMin: 3, cooldown: 2, aoe: "single_straight_line", canTarget: [TYPES.VULNERABLE], description: "Deals instant damage to a single target in a straight line at 3 range." },
                { name: "Smoke bomb", dealSpell: "assassin_smokebomb", range: 1, rangeMin: 1, cooldown: 3, aoe: "ring_1_on_self", canTarget: [TYPES.EMPTY], description: "Instantly roots all targets at close range and moves one cell." },
            ]
        },
        {
            name: "Time Traveler",
            spells: [
                { name: "Time Machine", dealSpell: "summon", summon: "time_machine", range: 3, rangeMin: 1, cooldown: 2, aoe: "single", glyph: 0, canTarget: [TYPES.EMPTY], description: "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location." },
                { name: "Backwards Hit", dealSpell: "time_backwards_hit", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.VULNERABLE], description: "Deals instant damage to a single target in close range, the caster then gets pushed backwards." },
                { name: "Silence Lance", dealSpell: "silence", range: 3, rangeMin: 0, cooldown: 2, aoe: "handspinner", glyph: 1, color: "GLYPH_PURPLE", glyphIcon: "silenceIcon", canTarget: [TYPES.ANY], description: "Silences in a handspinner area." },
            ]
        },
        {
            name: "Shaman",
            spells: [
                { name: "Undead Army", dealSpell: "summon", summon: "zombie", range: 1, rangeMin: 1, cooldown: 1, glyph: 1, aoe: "single", canTarget: [TYPES.EMPTY], color: 'GLYPH_DARK', glyphIcon: "tombstoneIcon", description: "Plants a flower that summons a zombie next turn." },
                { name: "Pestilence", dealSpell: "damage", range: 9, rangeMin: 4, cooldown: 1, aoe: "single", glyph: 1, color: "GLYPH_DARK", glyphIcon: "gasIcon", canTarget: [TYPES.ANY], permanent: true, description: "Drops a permanent glyph that deals damage" },
                { name: "Voodoo Curse", dealSpell: "silence", range: 2, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.PLAYABLE], description: "Instantly silences a single target." },
            ]
        },
        {
            name: "Pangolino",
            spells: [
                { name: "Spiky Ball", dealSpell: "pango_spiky_ball", range: 0, cooldown: 1, aoe: "single", canTarget: [TYPES.PLAYABLE], description: "Instantly gains 1 movement point and will deal damage around the caster." },
                { name: "Defensive stance", dealSpell: "shield", range: 0, cooldown: 2, aoe: "single", canTarget: [TYPES.VULNERABLE], color: "GLYPH_GAZ", description: "Shields the caster." },
                { name: "Booby Trap", dealSpell: "root", range: 2, cooldown: 2, aoe: "single", permanent: true, onlyFirst: true, glyph: 1, color: "GLYPH_GAZ", glyphIcon: "rootIcon", canTarget: [TYPES.EMPTY], description: "Drops a lasting trap that roots targets who start their turn inside." },
            ]
        },
        {
            name: "Warrior",
            spells: [
                { name: "Cleave", dealSpell: "damage", range: 0, cooldown: 1, aoe: "curly", glyph: 1, isAura: true, color: "GLYPH_BROWN", canTarget: [TYPES.ANY], description: "Hits in a curly AOE in front of the caster." },
                { name: "Aegis", dealSpell: "shield", range: 0, cooldown: 3, aoe: "area_1", canTarget: [TYPES.VULNERABLE], color: "GLYPH_ORANGE", description: "Shields the caster and everybody around him." },
                { name: "Charge", dealSpell: "warrior_charge", range: 4, rangeMin: 1, cooldown: 2, aoe: "straight_line", onlyFirst: true, canTarget: [TYPES.ENTITY], description: "Charges and pushes first target in a straight line." },
            ]
        },
        {
            name: "Troll",
            spells: [
                { name: "Repulsion", dealSpell: "push", range: 1, rangeMin:1, cooldown: 1, aoe: "single", canTarget: [TYPES.ENTITY], description: "Pushes a target." },
                { name: "Attraction", dealSpell: "pull", range: 2, rangeMin: 2, cooldown: 1, aoe: "straight_line", onlyFirst: true, canTarget: [TYPES.ENTITY], description: "Pulls first target in a straight line." },
                { name: "Transposition", dealSpell: "switcheroo", range: 2, cooldown: 1, aoe: "single", canTarget: [TYPES.ENTITY], description: "Swaps the positions of the caster and its target." },
            ]
        },
        {
            name: "Gasser",
            spells: [
                { name: "Gas gas gas", dealSpell: "damage_others", range: 0, cooldown: 0, aoe: "single", glyph: 1, color: "GLYPH_GAZ", passive: true, permanent: true, onMove: true, selfCast: true, glyphIcon: "gasIcon", canTarget: [TYPES.ANY], description: "Leaves a trail of toxic gas behind him when moving." },
                { name: "Adrenaline", dealSpell: "buffPM", range: 0, cooldown: 2, aoe: "single",  value: 2, canTarget: [TYPES.ENTITY], description: "Grants 2 more movement points to the caster."  },
                { name: "Shotgun", dealSpell: "gasser_shotgun", range: 1, rangeMin: 1, cooldown: 1, aoe: "single", canTarget: [TYPES.ENTITY], description: "Deals instant damage to a single target in close range and add gas to the cell." },
                // { name: "Salto", dealSpell: "salto", range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.ENTITY] },
            ]
        },
        // {
        //     name: "Terroriste",
        //     spells: [
        //         { name: "Drop bomb", dealSpell: "summon", range: 2, rangeMin: 1, cooldown: 1, aoe: "single", ttl: 1, src: bombImage, },
        //         { name: "Kick bomb",  dealSpell: "push",  range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: 2, },
        //         { name: "Surprise",  range: 4, cooldown: 1, aoe: "single", },
        //     ]
        // },
    ]
})

module.exports = {
    CONSTANTS, TYPES, GAMEDATA, ANIMATIONS
}