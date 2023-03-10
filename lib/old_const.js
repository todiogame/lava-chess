const config = require("../config");

const CONSTANTS = Object.freeze({
  MAP_RADIUS: 5,
  NB_PAWNS: config.TEST ? 2 : 4,
  // NB_PAWNS: 4,
  MAX_HP_PLAYER: config.TEST ? 2 : 4,
  // MAX_HP_PLAYER: 4,
  TEAM_RED: "red",
  TEAM_BLUE: "cyan",
  PICK_BAN_ORDER: ["PICK", "PICK", "PICK", "PICK"],
  // PICK_BAN_ORDER: ["BAN", "BAN", "PICK", "PICK", "PICK", "PICK"],
  TIME_TURN_MS: 60000,
});
const GAME_MODE = Object.freeze({
  QUICK: "QUICK",
  DRAFT: "DRAFT",
});

const CANVAS = Object.freeze({
  WIDTH: 1600,
  HEIGHT: 900,
});

const ANIMATIONS = {
  FALL: "FALL",
};

const TYPES = Object.freeze({
  //cell types
  ANY: "ANY",
  LAVA: "LAVA",
  EMPTY: "EMPTY",
  CLOSE_TO_LAVA: "CLOSE_TO_LAVA",
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
});

const GAMEDATA = Object.freeze({
  //summons
  TABLE_SUMMONS: {
    shadow: {
      name: "shadow",
      ttl: -1,
      summonTypes: [TYPES.SHADOW, TYPES.LAUNCHED],
      isUnique: true,
    },
    wall: {
      name: "wall",
      ttl: 1,
      summonTypes: [TYPES.LAUNCHED],
    },
    tentacle: {
      name: "tentacle",
      ttl: 1,
      summonTypes: [],
      auras: [
        {
          name: "Tentacle Hit",
          dealSpell: "damage",
          aoe: "tentacle_hit",
          isAura: true,
          glyph: 1,
          color: "GLYPH_BROWN",
        },
      ],
    },
    infernal: {
      name: "Infernal",
      ttl: -1,
      maxHP: 3,
      isUnique: true,
      summonTypes: [TYPES.INFERNAL, TYPES.PLAYABLE, TYPES.VULNERABLE],
      auras: [
        {
          name: "Flame aura",
          permanent: true,
          dealSpell: "damage",
          aoe: "ring_1",
          isAura: true,
          glyph: 1,
          color: "GLYPH_BROWN",
          glyphIcon: "damageIcon",
          src: "./pics/spells/infernal_aura.png",
        },
      ],
      spells: [
        {
          passive: true,
          cooldown: 0,
          name: "Flame aura",
          permanent: true,
          dealSpell: "damage",
          aoe: "ring_1",
          isAura: true,
          glyph: 1,
          color: "GLYPH_BROWN",
          glyphIcon: "damageIcon",
          src: "./pics/spells/infernal_aura.png",
          description:
            "A damaging aura around the Infernal. Procs at the start of the Demonist's turn.",
        },
        // { passive: true, cooldown: 0, name: "" },
        // { passive: true, cooldown: 0, name: "" },
      ],
    },
    barrel: {
      name: "barrel",
      ttl: -1,
      summonTypes: [TYPES.BARREL, TYPES.LAUNCHED, TYPES.VULNERABLE],
      maxHP: 1,
      onDeath: "rasta_barrel_explode",
      auras: [
        {
          name: "Barrel AOE preview",
          permanent: true,
          dealSpell: "nothing",
          aoe: "area_1",
          isAura: true,
          glyph: 1,
          color: "GLYPH_PREVIEW",
        },
      ],
    },

    time_machine: {
      name: "time_machine",
      ttl: 1,
      summonTypes: [TYPES.LAUNCHED, TYPES.VULNERABLE],
      maxHP: 1,
      auras: [
        {
          name: "Time Machine",
          dealSpell: "blink",
          aoe: "single",
          isAura: true,
          glyph: 1,
          color: "GLYPH_PREVIEW",
        },
        {
          name: "Explosion",
          dealSpell: "damage",
          aoe: "ring_1",
          isAura: true,
          glyph: 1,
          color: "GLYPH_BROWN",
        },
      ],
    },

    zombie: {
      name: "Zombie",
      ttl: -1,
      maxHP: 1,
      summonTypes: [TYPES.PLAYABLE, TYPES.VULNERABLE],
      auras: [],
      movePoint: 0,
      spells: [
        //just an hud indication, this spell works with the aura
        {
          name: "Zombie Crawl",
          dealSpell: "zombie_crawl",
          range: 1,
          rangeMin: 1,
          cooldown: 1,
          aoe: "single",
          src: "./pics/spells/zombie_crawl.png",
          canTarget: [TYPES.ANY],
          description:
            "Moves, or in close contact deals an instant attack that also kills the caster.",
        },
      ],
    },
  },

  LAVA_SPELL: {
    name: "Raise lava and pass turn",
    dealSpell: "riseLava",
    range: 9,
    aoe: "single",
    canTarget: [TYPES.EMPTY],
    description:
      "Time is ticking and lava is rising! Choose a cell on the edge of the map to make it disappear in the lava.",
  },
  PASS_SPELL: {
    name: "Pass turn",
    description: "Click here to pass your turn.",
  },
  MOVE_SPELL: {
    name: "Move",
    description: "Use a movement point to move to an adjacent cell.",
  },
  CHARACTERS: [
    {
      name: "Mage",
      difficulty: 1, //1 to 3
      title: "Master of the Elements",
      description:
        "This skilled spellcaster commands the power of fire and ice, wielding the ability to unleash inferno strikes and freezing curses, while forcing enemies away with a powerful wave of energy.",
      spells: [
        {
          name: "Inferno Strike",
          dealSpell: "damage",
          range: 4,
          rangeMin: 2,
          cooldown: 1,
          aoe: "straight_line_inferno",
          glyph: 1,
          color: "GLYPH_BROWN",
          glyphIcon: "damageIcon",
          canTarget: [TYPES.ANY],
          description: "Deals damage in a straight line.",
        },
        {
          name: "Freezing Curse",
          dealSpell: "root",
          range: 2,
          rangeMin: 2,
          cooldown: 3,
          aoe: "square",
          canTarget: [TYPES.ANY],
          description: "Instantly roots targets in a square area.",
        },
        {
          name: "Force Wave",
          dealSpell: "mage_force",
          range: 0,
          cooldown: 2,
          aoe: "ring_1",
          canTarget: [TYPES.PLAYABLE],
          animation: ANIMATIONS.FALL,
          description: "Pushes out anyone around the caster in a ring area.",
        },
        // { name: "Blink", dealSpell: "blink", range: 3, cooldown: 3, aoe: "single", glyph: 0, canTarget: [TYPES.EMPTY] },
      ],
    },
    {
      name: "Fisherman",
      difficulty: 1,
      title: "Pub Smasher",
      description:
        "This experienced seaman is capable of pulling in foes with a well-placed hook, trapping them in a fishing net, and pushing them away with a belly bump that deals damage.",
      spells: [
        {
          name: "Bait Hook",
          dealSpell: "pull",
          range: 5,
          rangeMin: 1,
          cooldown: 2,
          aoe: "straight_line",
          onlyFirst: true,
          canTarget: [TYPES.ENTITY],
          description: "Pulls first target in a straight line.",
        },
        {
          name: "Fishing Net",
          dealSpell: "root",
          range: 4,
          cooldown: 2,
          aoe: "pair",
          glyph: 1,
          color: "GLYPH_BLUE",
          glyphIcon: "rootIcon",
          canTarget: [TYPES.ANY],
          description:
            "Drops a 2-cells net that roots targets who start their turn inside.",
        },
        {
          name: "Belly Bump",
          dealSpell: "fisherman_push",
          range: 1,
          rangeMin: 1,
          cooldown: 1,
          aoe: "single",
          value: "1",
          canTarget: [TYPES.ENTITY],
          description: "Pushes target and deals instant damage.",
        },
      ],
    },
    {
      name: "Golem",
      difficulty: 2,
      title: "Unstoppable force of nature",
      description:
        "This ancient being is a living construct, wielding the power of the earth and the ability to summon magma walls and perform boulder smashes that can inflict devastating damage.",
      spells: [
        {
          name: "Boulder Smash",
          dealSpell: "golem_boulder",
          range: 4,
          cooldown: 1,
          aoe: "single",
          glyph: 1,
          color: "GLYPH_ORANGE",
          onMiss: "lava",
          glyphIcon: "boulderIcon",
          canTarget: [TYPES.ANY],
          animation: ANIMATIONS.FALL,
          description: "Deals damage, but if the cell was empty, rise lava.",
        },
        {
          name: "Magma Wall",
          dealSpell: "summon",
          summon: "wall",
          range: 3,
          cooldown: 3,
          aoe: "curly",
          ttl: 1,
          canTarget: [TYPES.ANY],
          description: "Summons a wall in a curly area around a targeted cell.",
        },
        {
          name: "Explosion",
          dealSpell: "damage",
          range: 0,
          cooldown: 2,
          aoe: "ring_1",
          isAura: true,
          glyph: 1,
          color: "GLYPH_BROWN",
          glyphIcon: "damageIcon",
          canTarget: [TYPES.PLAYABLE],
          description: "Deals damage around the caster.",
        },
      ],
    },
    {
      name: "Ninja",
      difficulty: 2,
      title: "Master of shadows",
      description:
        "This enigmatic warrior is trained in the art of stealth and deception, able to cast shadows and unleash spinning slashes, moving with lightning speed to take down their enemies.",
      spells: [
        {
          name: "Cast Shadow",
          dealSpell: "summon",
          summon: "shadow",
          range: 2,
          rangeMin: 1,
          cooldown: 3,
          aoe: "single",
          canTarget: [TYPES.EMPTY],
          description: "Summons a shadow that can cast Spinning Slash.",
        },
        {
          name: "Spinning Slash",
          dealSpell: "ninja_slash", //damage + anim
          range: 0,
          cooldown: 2,
          aoe: "ninja_slash",
          canTarget: [TYPES.PLAYABLE],
          description:
            "Deals instant damage in a circular area around the caster and its shadow.",
        },
        {
          name: "Master of Illusion",
          dealSpell: "switcheroo",
          range: 8,
          cooldown: 2,
          aoe: "single",
          canTarget: [TYPES.SHADOW],
          description: "Swaps the positions of the caster and its shadow.",
        },
      ],
    },
    {
      name: "Demonist",
      difficulty: 2,
      title: "Conjurer of the Underworld",
      description:
        "This dark practitioner draws on the power of demons, summoning tentacles and infernals to do their bidding and wreak havoc on their enemies.",
      spells: [
        {
          name: "Spawn Tentacle",
          dealSpell: "demo_tentacle",
          summon: "tentacle",
          range: 3,
          rangeMin: 3,
          cooldown: 1,
          aoe: "tentacle",
          onlyFirst: true,
          canTarget: [TYPES.EMPTY],
          description: "Spawns a tentacle that damages in a line.",
        },
        {
          name: "Summon Infernal",
          dealSpell: "summon",
          summon: "infernal",
          range: 1,
          rangeMin: 1,
          cooldown: 5,
          aoe: "single",
          canTarget: [TYPES.EMPTY],
          description: "Summons an infernal with a burning aura.",
        },
        {
          name: "Speed Boost",
          dealSpell: "buffPM",
          range: 1,
          cooldown: 3,
          aoe: "single",
          canTarget: [TYPES.PLAYABLE],
          description: "Grants 1 more movement point to an ally.",
        },
      ],
    },
    {
      name: "Rasta",
      difficulty: 1,
      title: "The barrel-wielding shooter",
      description:
        "This fearless fighter is always ready to fire with their gatling shot, rolling explosive barrels towards enemies, and making a quick retreat.",
      spells: [
        {
          name: "Gatling Shot",
          dealSpell: "damage",
          range: 9,
          cooldown: 1,
          aoe: "line",
          aoeSize: 5,
          glyph: 1,
          canTarget: [TYPES.ANY],
          color: "GLYPH_BROWN",
          glyphIcon: "damageIcon",
          animation: ANIMATIONS.FALL,
          description: "Deals damage in a straight line.",
        },
        {
          name: "Rolling Barrel",
          dealSpell: "summon",
          summon: "barrel",
          range: 2,
          rangeMin: 1,
          cooldown: 2,
          aoe: "single",
          canTarget: [TYPES.EMPTY],
          description: "Places explosive barrel.",
        },
        {
          name: "Jamming Retreat",
          dealSpell: "buffPM",
          value: 2,
          range: 0,
          cooldown: 3,
          aoe: "single",
          canTarget: [TYPES.PLAYABLE],
          description: "Grants 2 more movement points to the caster.",
        },
      ],
    },
    {
      name: "Assassin",
      difficulty: 1,
      title: "The silent killer",
      description:
        "This shadow-clad warrior is a master of deception, sneaking up on their enemies to land a deadly backstab, shooting them from a distance with a silent handgun, or disappearing in a cloud of smoke with their smoke bomb.",
      spells: [
        {
          name: "Backstab",
          dealSpell: "damage",
          range: 1,
          rangeMin: 1,
          cooldown: 1,
          aoe: "single",
          canTarget: [TYPES.VULNERABLE],
          description:
            "Deals instant damage to a single target in close range.",
        },
        {
          name: "Silent Bullet",
          dealSpell: "damage",
          range: 3,
          rangeMin: 3,
          cooldown: 3,
          aoe: "single_straight_line",
          canTarget: [TYPES.VULNERABLE],
          description:
            "Deals instant damage to a single target in a straight line at 3 range.",
        },
        {
          name: "Smoke bomb",
          dealSpell: "assassin_smokebomb",
          range: 1,
          rangeMin: 1,
          cooldown: 3,
          aoe: "ring_1_on_self",
          canTarget: [TYPES.EMPTY],
          description:
            "Instantly roots all targets at close range and moves one cell.",
        },
      ],
    },
    {
      name: "Time Traveler",
      difficulty: 3,
      title: "Master of Temporal Magic",
      description:
        "This cosmic wizard wields the power of time itself, able to summon time machines that explode and teleport, strike enemies with backwards hits, and silence foes with lances of silence.",
      spells: [
        {
          name: "Time Machine",
          dealSpell: "summon",
          summon: "time_machine",
          range: 3,
          rangeMin: 1,
          cooldown: 2,
          aoe: "single",
          glyph: 0,
          canTarget: [TYPES.EMPTY],
          description:
            "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location.",
        },
        {
          name: "Backwards Hit",
          dealSpell: "time_backwards_hit",
          range: 1,
          rangeMin: 1,
          cooldown: 2,
          aoe: "single",
          canTarget: [TYPES.VULNERABLE],
          description:
            "Deals instant damage to a single target in close range, the caster then gets pushed backwards.",
        },
        {
          name: "Silence Lance",
          dealSpell: "silence",
          range: 3,
          rangeMin: 0,
          cooldown: 2,
          aoe: "handspinner",
          glyph: 1,
          color: "GLYPH_PURPLE",
          glyphIcon: "silenceIcon",
          canTarget: [TYPES.ANY],
          description: "Silences in a handspinner area.",
        },
      ],
    },
    {
      name: "Shaman",
      difficulty: 2,
      title: "Keeper of the Dead",
      description:
        "This mysterious spiritualist commands an undead army, calling forth zombies with a single spell and spreading pestilence with a dark glyph. They can also curse their enemies with voodoo magic.",
      spells: [
        {
          name: "Undead Army",
          dealSpell: "summon",
          summon: "zombie",
          range: 1,
          rangeMin: 1,
          cooldown: 1,
          glyph: 1,
          aoe: "single",
          canTarget: [TYPES.EMPTY],
          color: "GLYPH_DARK",
          glyphIcon: "tombstoneIcon",
          description: "Reveals a tombstone that summons a zombie next turn.",
        },
        {
          name: "Pestilence",
          dealSpell: "damage",
          range: 9,
          rangeMin: 4,
          cooldown: 1,
          aoe: "single",
          glyph: 1,
          color: "GLYPH_DARK",
          glyphIcon: "gasIcon",
          canTarget: [TYPES.ANY],
          permanent: true,
          description: "Drops a permanent glyph that deals damage",
        },
        {
          name: "Voodoo Curse",
          dealSpell: "silence",
          range: 2,
          rangeMin: 1,
          cooldown: 3,
          aoe: "single",
          canTarget: [TYPES.PLAYABLE],
          description: "Instantly silences a single target.",
        },
      ],
    },
    {
      name: "Random",
      difficulty: 5,
      title: "Random Character",
      description: "Try your luck !",
      spells: [
        {
          name: "?",
          cooldown: "?",
          description: "???",
        },
        {
          name: "?",
          cooldown: "?",
          description: "???",
        },
        {
          name: "?",
          cooldown: "?",
          description: "???",
        },
      ],
    },
    {
      name: "Pangolino",
      difficulty: 1,
      title: "The Armadillo Defender",
      description:
        "This armored mammal is a fierce defender, capable of rolling into a spiky ball to deal damage, shielding themselves with a defensive stance, and setting booby traps to ensnare their enemies.",
      spells: [
        {
          name: "Spiky Ball",
          dealSpell: "pango_spiky_ball",
          range: 0,
          cooldown: 2,
          aoe: "single",
          canTarget: [TYPES.PLAYABLE],
          description:
            "Instantly gains 1 movement point and will deal damage around the caster.",
        },
        {
          name: "Defensive stance",
          dealSpell: "shield",
          range: 0,
          cooldown: 2,
          aoe: "single",
          canTarget: [TYPES.VULNERABLE],
          color: "GLYPH_GAZ",
          description: "Shields the caster.",
        },
        {
          name: "Booby Trap",
          dealSpell: "root",
          range: 3,
          cooldown: 2,
          aoe: "single",
          permanent: true,
          onlyFirst: true,
          glyph: 1,
          color: "GLYPH_GAZ",
          glyphIcon: "rootIcon",
          canTarget: [TYPES.EMPTY],
          description: "Drops a lasting trap that roots targets.",
        },
      ],
    },
    {
      name: "Warrior",
      difficulty: 1,
      title: "Champion of Battle",
      description:
        "This brave warrior is a skilled combatant, able to unleash powerful cleaves, protect allies with an aegis, and charge into battle to push their enemies back.",
      spells: [
        {
          name: "Cleave",
          dealSpell: "damage",
          range: 1,
          rangeMin: 1,
          cooldown: 1,
          aoe: "cleave",
          glyph: 1,
          isAura: true,
          color: "GLYPH_BROWN",
          glyphIcon: "damageIcon",
          canTarget: [TYPES.ANY],
          description: "Hits in a curly AOE in front of the caster.",
        },
        {
          name: "Aegis",
          dealSpell: "shield",
          range: 0,
          cooldown: 2,
          aoe: "area_1",
          canTarget: [TYPES.VULNERABLE],
          color: "GLYPH_ORANGE",
          description: "Shields the caster and everybody around him.",
        },
        {
          name: "Charge",
          dealSpell: "warrior_charge",
          range: 4,
          rangeMin: 1,
          cooldown: 3,
          aoe: "straight_line",
          onlyFirst: true,
          canTarget: [TYPES.ENTITY],
          description:
            "Instantly charges, damages and pushes the first target in a straight line.",
        },
      ],
    },
    // {
    //   name: "Troll",
    //   difficulty: 3,
    //   title: "Master of Movement",
    //   description:
    //     "This mischievous creature is able to manipulate the battlefield with its magic, pushing, pulling, and swapping positions with its enemies and allies.",
    //   spells: [
    //     {
    //       name: "Repulsion",
    //       dealSpell: "push",
    //       range: 1,
    //       rangeMin: 1,
    //       cooldown: 1,
    //       aoe: "single",
    //       canTarget: [TYPES.ENTITY],
    //       description: "Pushes a target.",
    //     },
    //     {
    //       name: "Attraction",
    //       dealSpell: "attraction",
    //       range: 2,
    //       rangeMin: 2,
    //       cooldown: 1,
    //       aoe: "straight_line",
    //       onlyFirst: true,
    //       canTarget: [TYPES.ENTITY],
    //       description: "Pulls first target in a straight line.",
    //     },
    //     {
    //       name: "Transposition",
    //       dealSpell: "switcheroo",
    //       range: 1,
    //       rangeMin: 0,
    //       cooldown: 1,
    //       aoe: "single",
    //       canTarget: [TYPES.ENTITY],
    //       description: "Swaps the positions of the caster and its target.",
    //     },
    //   ],
    // },
    {
      name: "Gasser",
      difficulty: 2,
      title: "Toxic Troublemaker",
      description:
        "This noxious being leaves a trail of poisonous gas wherever they go, and is able to increase their mobility and attack targets up close with a powerful shotgun blast.",
      spells: [
        {
          name: "Gas gas gas",
          dealSpell: "damage_others",
          range: 0,
          cooldown: 0,
          aoe: "single",
          glyph: 1,
          color: "GLYPH_GAZ",
          passive: true,
          permanent: true,
          onMove: true,
          selfCast: true,
          glyphIcon: "gasIcon",
          canTarget: [TYPES.VULNERABLE],
          description:
            "Passively leaves a trail of toxic gas behind him when moving (the caster is immune to the gas).",
        },
        {
          name: "Adrenaline",
          dealSpell: "buffPM",
          range: 0,
          cooldown: 2,
          aoe: "single",
          value: 2,
          canTarget: [TYPES.ENTITY],
          description: "Grants 2 more movement points to the caster.",
        },
        {
          name: "Shotgun",
          dealSpell: "gasser_shotgun",
          range: 1,
          rangeMin: 1,
          cooldown: 1,
          aoe: "single",
          canTarget: [TYPES.VULNERABLE],
          description:
            "Deals instant damage to a single target in close range and add gas to the cell.",
        },
        // { name: "Salto", dealSpell: "salto", range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.ENTITY] },
      ],
    },
    // {
    //   name: "Dragon",
    //   difficulty: 2,
    //   title: "Ruler of the skies",
    //   description:
    //     "This magnificent beast commands the power of the skies, summoning bolts of lightning to scorch the earth and rooting its enemies in place with tempests. Its starfall silence also renders its foes powerless, making it a formidable opponent.",
    //   spells: [
    //     {
    //       name: "Heavenly Wrath",
    //       dealSpell: "damage",
    //       range: 9,
    //       cooldown: 3,
    //       aoe: "dragon_heavenly_wrath",
    //       glyph: 1,
    //       color: "GLYPH_BLUE",
    //       glyphIcon: "damageIcon",
    //       canTarget: [TYPES.ANY],
    //       animation: ANIMATIONS.FALL,
    //       description: "Deals damage anywhere on the map in a wide area.",
    //     },
    //     {
    //       name: "Storm Shackles",
    //       dealSpell: "root",
    //       range: 0,
    //       cooldown: 2,
    //       isAura: true,
    //       aoe: "ring_2",
    //       glyph: 1,
    //       color: "GLYPH_BLUE",
    //       glyphIcon: "rootIcon",
    //       canTarget: [TYPES.PLAYABLE],
    //       animation: ANIMATIONS.FALL,
    //       description: "Roots targets in a large ring area around the caster.",
    //     },
    //     {
    //       name: "Starfall Silence",
    //       dealSpell: "silence",
    //       range: 0,
    //       cooldown: 2,
    //       aoe: "ring_1",
    //       isAura: true,
    //       glyph: 1,
    //       color: "GLYPH_PURPLE",
    //       glyphIcon: "silenceIcon",
    //       canTarget: [TYPES.PLAYABLE],
    //       animation: ANIMATIONS.FALL,
    //       description: "Silences anyone around the caster in a ring area.",
    //     },
    //   ],
    // },
    {
      name: "Lava Elemental",
      difficulty: 3,
      title: "Fury of the Volcano",
      description: "This fiery being commands the power of molten rock and can unleash eruptions of magma to deal massive damage, release sulfurous fumes that poison the air, or teleport through lava to escape his ennemies.",
      spells: [
        {
          name: "Eruption",
          dealSpell: "damage",
          range: 1,
          cooldown: 1,
          aoe: "handspinner",
          glyph: 1,
          color: "GLYPH_BROWN",
          glyphIcon: "damageIcon",
          canTarget: [TYPES.ANY],
          specialRange: TYPES.CLOSE_TO_LAVA,
          animation: ANIMATIONS.FALL,
          description: "Deals area damage anywhere close to the lava.",
        },
        {
          name: "Sulfur Fumes",
          dealSpell: "damage_others",
          range: -1,
          cooldown: 2,
          aoe: "lava_sulfur_fumes",
          glyph: 1,
          color: "GLYPH_ORANGE",
          glyphIcon: "damageIcon",
          canTarget: [TYPES.CLOSE_TO_LAVA],
          specialRange: TYPES.CLOSE_TO_LAVA,
          animation: ANIMATIONS.FALL,
          description: "Deals area damage everywhere close to the lava (the caster is immune to the fumes).",
        },
        {
          name: "Lava flow",
          dealSpell: "lava_flow",
          range: -1,
          rangeMin: 1,
          cooldown: 3,
          aoe: "single",
          canTarget: [TYPES.CLOSE_TO_LAVA, TYPES.EMPTY],
          specialRange: TYPES.CLOSE_TO_LAVA,
          description: "Teleports anywhere near the lava, rising lava behind him.",
        },
      ],
    },
    {
      name: "Water Elemental",
      difficulty: 3,
      title: "Master of the seas",
      description:
        "This elemental wields the power of the ocean and can create powerful whirlpools and crashing waves to devastate their foes. They can also manipulate water to push their enemies away and create safe zones amidst treacherous terrain.", spells: [
          {
            name: "Whirlpool",
            dealSpell: "damage",
            range: 4,
            cooldown: 2,
            aoe: "ring_1",
            glyph: 1,
            color: "GLYPH_WATER",
            canTarget: [TYPES.ANY],
            description: "Deals damage in a ring area.",
          },
          {
            name: "Splash",
            dealSpell: "water_splash",
            range: 3,
            rangeMin: 2,
            cooldown: 3,
            aoe: "pair",
            onlyFirst: true,
            canTarget: [TYPES.ENTITY],
            description: "Pushes a target in a chosen direction, restoring floor beneath them to protect them from lava.",
          },
          {
            name: "Breaking Wave",
            dealSpell: "damage",
            isGoingForward: true,
            range: 1,
            rangeMin: 1,
            cooldown: 2,
            aoe: "cleave",
            glyph: 1,
            color: "GLYPH_WATER",
            glyphIcon: "waveIcon",
            canTarget: [TYPES.ANY],
            description: "Deals damage in a curly area, that goes forward every turn.",
          },
        ],
    },
    {
      name: "Ethereal",
      difficulty: 3,
      title: "The Ghostly Figure",
      description:
        "This phantom figure can shift to an ethereal form, becoming immune to any instant damage to avoid enemy attacks. They also have a deadly ghostly strike that can deal massive damage to enemies.",
      spells: [
        {
          name: "Ethereal Form",
          dealSpell: "ethereal_form",
          value: 1,
          range: 0,
          cooldown: 2,
          aoe: "single",
          canTarget: [TYPES.VULNERABLE],
          description: "Becomes ethereal, gaining one movement point and becoming immune to instant damage for one turn.",
        },
        {
          name: "Ghostly Strike",
          dealSpell: "damage",
          range: 1,
          rangeMin: 1,
          cooldown: 3,
          aoe: "single",
          canTarget: [TYPES.VULNERABLE],
          description: "Deals instant damage to a single target in close range.",
        },
        {
          name: "Haunt",
          dealSpell: "damage",
          range: 4,
          rangeMin: 1,
          cooldown: 1,
          aoe: "handspinner",
          glyph: 1,
          color: "GLYPH_BLUE",
          glyphIcon: "damageIcon",
          canTarget: [TYPES.VULNERABLE],
          description:
            "Deal damage on a target in a handspinner area.",
        },
      ],
    },
    // {
    //     name: "Terrorist",
    //     difficulty: 3,
    //     title: "Master of Mayhem",
    //     description: "This disruptive force specializes in causing chaos and destruction, able to drop bombs that wreak havoc, kick them to their enemies, and always have a few tricks up their sleeve to keep their foes on edge.",
    //     spells: [
    //         { name: "Drop bomb", dealSpell: "summon", range: 2, rangeMin: 1, cooldown: 1, aoe: "single", ttl: 1, src: bombImage, },
    //         { name: "Kick bomb", dealSpell: "push", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: 2, },
    //         { name: "Surprise", range: 4, cooldown: 1, aoe: "single", },
    //     ]
    // },
  ],
});

module.exports = {
  CONSTANTS,
  CANVAS,
  TYPES,
  GAMEDATA,
  ANIMATIONS,
  GAME_MODE,
};
