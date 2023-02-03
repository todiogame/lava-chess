const s =
    require('./spells.js')

module.exports =
    Object.freeze({
        MAP_RADIUS: 5,
        NB_PAWNS: 4,


        //cell types
        ANY: "ANY",
        LAVA: "LAVA",
        EMPTY: "EMPTY",
        //entities types
        ENTITY: "ENTITY",
        PLAYABLE: "PLAYABLE",
        // summons types
        SHADOW: "SHADOW",
        BOMB: "BOMB",
        INFERNAL: "INFERNAL",
        BARREL: "BARREL",

        //GLYPHS COLORS
ARRAY_GLYPH_COLOR :{
            "GLYPH_BLUE": "rgb(50, 150, 255, 0.2)",
        "GLYPH_BROWN": "rgb(50, 50, 30, 0.3)",
        "GLYPH_ORANGE": "rgb(255, 65, 0, 0.5)",
        "GLYPH_PURPLE": "rgb(255,0,255, 0.3)",
        "GLYPH_FLOWER": "rgb(30, 205, 50, 0.3)",

        "GLYPH_GAZ": "rgb(100, 255, 150, 0.3)",
        "GLYPH_PREVIEW": "rgb(255, 65, 0, 0.2)",
},

        //summons
        TABLE_SUMMONS: {
            "shadow": {
                name: "shadow",
                ttl: -1,
                summonTypes: [this.SHADOW],
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
                    { name: "Tentacle Hit", dealSpell: s.damage, aoe: "tentacle_hit", isAura: true, glyph: 1, color: "GLYPH_BROWN", }
                ],
            },
            "infernal": {
                name: "Infernal",
                ttl: -1,
                maxHP: 3,
                isUnique: true,
                summonTypes: [this.INFERNAL,this.PLAYABLE],
                auras: [
                    { name: "Flame aura", permanent: true, dealSpell: s.damage, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" }
                ],
                spells: [
                    { passive: true, cooldown: 0, name: "Flame aura", permanent: true, dealSpell: s.damage, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" },
                    { passive: true, cooldown: 0, name: "" },
                    { passive: true, cooldown: 0, name: "" },

                ]
            },
            "barrel": {
                name: "barrel",
                ttl: -1,
                summonTypes: [this.BARREL],
                maxHP: 1,
                onDeath: s.rasta_barrel_explode,
                auras: [
                    { name: "Barrel AOE preview", permanent: true, dealSpell: s.nothing, aoe: "area_1", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", }
                ],
            },

            "time_machine": {
                name: "time_machine",
                ttl: 1,
                summonTypes: [],
                maxHP: 1,
                auras: [
                    { name: "Time Machine", dealSpell: s.blink, aoe: "single", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", },
                    { name: "Explosion", dealSpell: s.damage, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", },
                ],
            },

            "zombie": {
                name: "Zombie",
                ttl: -1,
                maxHP: 1,
                summonTypes: [this.PLAYABLE],
                auras: [],
                spells: [
                    //just an hud indication, this spell works with the aura
                    { name: "Zombie Attack", dealSpell: s.zombie_attack, range: 1, rangeMin: 1, cooldown: 0, aoe: "single", canTarget: [this.ENTITY] },
                    { passive: true, cooldown: 0, name: "" },
                    { passive: true, cooldown: 0, name: "" },
                ]
            },
        },


        LAVA_SPELL: {
            name: "LAVA_SPELL", dealSpell: s.riseLava, range: 9, aoe: "single", canTarget: [this.EMPTY]
            // color: ORANGE, effect: "lava", glyphIcon: "lavaIcon"
        },
        CHARACTERS: [
            {
                name: "Mage",
                spells: [
                    { name: "Inferno Strike", dealSpell: s.damage, range: 4, rangeMin: 2, cooldown: 1, aoe: "straight_line_inferno", glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon", canTarget: [this.ANY], description: "Deals damage in a straight line." },
                    { name: "Freezing Curse", dealSpell: s.root, range: 2, rangeMin: 2, cooldown: 3, aoe: "square", canTarget: [this.ANY], description: "Instantly roots targets in a square area." },
                    { name: "Force Wave", dealSpell: s.push, range: 0, cooldown: 2, aoe: "ring_1", canTarget: [this.PLAYABLE], description: "Pushes out anyone around the caster in a ring area." },
                    // { name: "Blink", dealSpell: s.blink, range: 3, cooldown: 3, aoe: "single", glyph: 0, canTarget: [this.EMPTY] },
                ]
            },
            {
                name: "Fisherman",
                spells: [
                    { name: "Bait Hook", dealSpell: s.pull, range: 5, rangeMin: 1, cooldown: 3, aoe: "straight_line", onlyFirst: true, canTarget: [this.ENTITY], description: "Pulls first target in a straight line." },
                    { name: "Fishing Net", dealSpell: s.root, range: 4, cooldown: 2, aoe: "pair", glyph: 1, color: "GLYPH_BLUE", glyphIcon: "rootIcon", canTarget: [this.ANY], description: "Drops a 2-cells net that roots targets who start their turn inside." },
                    { name: "Belly Bump", dealSpell: s.fisherman_push, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: "1", canTarget: [this.ENTITY], description: "Pushes target and deals instant damage." },
                    // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, }
                ]
            },
            {
                name: "Golem",
                spells: [
                    { name: "Boulder Smash", dealSpell: s.golem_boulder, range: 4, cooldown: 1, aoe: "single", glyph: 1, color: "GLYPH_ORANGE", onMiss: "lava", glyphIcon: "boulderIcon", canTarget: [this.ANY], description: "Deals damage, but if the cell was empty, rise lava." },
                    { name: "Magma Wall", dealSpell: s.summon, summon: "wall", range: 3, cooldown: 3, aoe: "curly", ttl: 1, canTarget: [this.ANY], description: "Summons a wall in a curly area around a targeted cell." },
                    { name: "Explosion", dealSpell: s.damage, range: 0, cooldown: 2, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", canTarget: [this.PLAYABLE], description: "Deals damage around the caster." },
                ]
            },
            {
                name: "Ninja",
                spells: [
                    { name: "Cast Shadow", dealSpell: s.summon, summon:"shadow", range: 2, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [this.EMPTY], description: "Summons a shadow that can cast Spinning Slash." },
                    { name: "Spinning Slash", dealSpell: s.damage, range: 0, cooldown: 2, aoe: "ninja_slash", canTarget: [this.PLAYABLE], description: "Deals instant damage in a circular area around the caster and its shadow." },
                    { name: "Master of Illusion", dealSpell: s.switcheroo, range: 8, cooldown: 2, aoe: "single", canTarget: [this.SHADOW], description: "Swaps the positions of the caster and its shadow." },
                ]
            },
            {
                name: "Demonist",
                spells: [
                    { name: "Spawn Tentacle", dealSpell: s.demo_tentacle, summon:"tentacle", range: 3, rangeMin: 3, cooldown: 1, aoe: "tentacle", onlyFirst: true, canTarget: [this.EMPTY], description: "Spawns a tentacle that damages in a line." },
                    { name: "Summon Infernal", dealSpell: s.summon, summon: "infernal", range: 1, rangeMin: 1, cooldown: 5, aoe: "single", canTarget: [this.EMPTY], description: "Summons an infernal with a burning aura." },
                    { name: "Speed Boost", dealSpell: s.buffPM, range: 1, cooldown: 3, aoe: "single", canTarget: [this.ENTITY], description: "Grants 1 more movement point to an ally." },
                ]
            },
            {
                name: "Rasta",
                spells: [
                    { name: "Gatling Shot", dealSpell: s.damage, range: 9, cooldown: 1, aoe: "line", aoeSize: 5, glyph: 1, canTarget: [this.ANY], color: "GLYPH_BROWN", glyphIcon: "damageIcon", description: "Deals damage in a straight line." },
                    { name: "Rolling Barrel", dealSpell: s.summon, summon: "barrel", range: 2, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [this.EMPTY], description: "Places explosive barrel." },
                    { name: "Jamming Retreat", dealSpell: s.buffPM, value: 2, range: 0, cooldown: 3, aoe: "single", canTarget: [this.ENTITY], description: "Grants 2 more movement points to the caster." },
                ]
            },
            {
                name: "Assassin",
                spells: [
                    { name: "Backstab", dealSpell: s.damage, range: 1, rangeMin: 1, cooldown: 1, aoe: "single", canTarget: [this.ENTITY], description: "Deals instant damage to a single target in close range." },
                    { name: "Silent Bullet", dealSpell: s.damage, range: 3, rangeMin: 3, cooldown: 2, aoe: "single_straight_line", canTarget: [this.ENTITY], description: "Deals instant damage to a single target in a straight line at 3 range." },
                    { name: "Smoke bomb", dealSpell: s.assassin_smokebomb, range: 1, rangeMin: 1, cooldown: 3, aoe: "ring_1_on_self", canTarget: [this.EMPTY], description: "Instantly roots all targets at close range and moves one cell." },
                    // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
                ]
            },
            {
                name: "Time Traveller",
                spells: [
                    { name: "Time Machine", dealSpell: s.summon, summon: "time_machine", range: 3, rangeMin: 1, cooldown: 1, aoe: "single", glyph: 0, canTarget: [this.EMPTY], description: "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location." },
                    { name: "Backwards Hit", dealSpell: s.time_backwards_hit, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [this.ENTITY], description: "Deals instant damage to a single target in close range, the caster then gets pushed backwards." },
                    { name: "Silence Lance", dealSpell: s.silence, range: 3, rangeMin: 0, cooldown: 2, aoe: "handspinner", glyph: 1, color: "GLYPH_PURPLE", glyphIcon: "silenceIcon", canTarget: [this.ANY], description: "Silences in a handspinner area." },
                    // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
                ]
            },
            {
                name: "Shaman",
                spells: [
                    { name: "Undead Army", dealSpell: s.summon, summon: "zombie", range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [this.EMPTY], description: "Summons a zombie." },
                    { name: "Happy Flower", dealSpell: s.shaman_flower, range: 9, rangeMin: 3, cooldown: 2, aoe: "single", glyph: 1, permanent: true, canTarget: [this.EMPTY], color: 'GLYPH_FLOWER', glyphIcon: "flowerIcon", description: "Creates a happy flower that heals and boosts the caster's range when he starts his turn on the glyph." },
                    { name: "Voodoo Curse", dealSpell: s.silence, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [this.PLAYABLE], description: "Instantly silences a single target." },
                ]
            },
        ]
    })