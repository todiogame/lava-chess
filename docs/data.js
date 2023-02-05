//cell types
const ANY = "ANY";
const LAVA = "LAVA";
const EMPTY = "EMPTY";
//entities types
const ENTITY = "ENTITY";
const PLAYABLE = "PLAYABLE";
const LAUNCHED = "LAUNCHED";
// summons types
const SHADOW = "SHADOW";
const BOMB = "BOMB";
const INFERNAL = "INFERNAL";
const BARREL = "BARREL";
// animations types
const FALL = "FALL";

//summons
const TABLE_SUMMONS = {
  shadow: {
    name: "shadow",
    ttl: -1,
    summonTypes: [SHADOW, LAUNCHED],
    isUnique: true,
  },
  wall: {
    name: "wall",
    ttl: 1,
    summonTypes: [LAUNCHED],
  },
  tentacle: {
    name: "tentacle",
    ttl: 1,
    summonTypes: [LAUNCHED],
    auras: [
      {
        name: "Tentacle Hit",
        dealSpell: damage,
        aoe: "tentacle_hit",
        isAura: true,
        glyph: 1,
        color: GLYPH_BROWN,
      },
    ],
  },
  infernal: {
    name: "Infernal",
    ttl: -1,
    maxHP: 3,
    isUnique: true,
    summonTypes: [INFERNAL, PLAYABLE],
    auras: [
      {
        name: "Flame aura",
        permanent: true,
        dealSpell: damage,
        aoe: "ring_1",
        isAura: true,
        glyph: 1,
        color: GLYPH_BROWN,
        glyphIcon: damageIcon,
      },
    ],
    spells: [
      {
        passive: true,
        cooldown: 0,
        name: "Flame aura",
        permanent: true,
        dealSpell: damage,
        aoe: "ring_1",
        isAura: true,
        glyph: 1,
        color: GLYPH_BROWN,
        glyphIcon: damageIcon,
      },
      { passive: true, cooldown: 0, name: "" },
      { passive: true, cooldown: 0, name: "" },
    ],
  },
  barrel: {
    name: "barrel",
    ttl: -1,
    summonTypes: [BARREL, LAUNCHED],
    maxHP: 1,
    onDeath: rasta_barrel_explode,
    auras: [
      {
        name: "Barrel AOE preview",
        permanent: true,
        dealSpell: nothing,
        aoe: "area_1",
        isAura: true,
        glyph: 1,
        color: GLYPH_PREVIEW,
      },
    ],
  },

  time_machine: {
    name: "time_machine",
    ttl: 1,
    summonTypes: [],
    maxHP: 1,
    auras: [
      {
        name: "Time Machine",
        dealSpell: blink,
        aoe: "single",
        isAura: true,
        glyph: 1,
        color: GLYPH_PREVIEW,
      },
      {
        name: "Explosion",
        dealSpell: damage,
        aoe: "ring_1",
        isAura: true,
        glyph: 1,
        color: GLYPH_BROWN,
      },
    ],
  },

  zombie: {
    name: "Zombie",
    ttl: -1,
    maxHP: 1,
    summonTypes: [PLAYABLE],
    auras: [],
    spells: [
      //just an hud indication, this spell works with the aura
      {
        name: "Zombie Attack",
        dealSpell: zombie_attack,
        range: 1,
        rangeMin: 1,
        cooldown: 0,
        aoe: "single",
        canTarget: [ENTITY],
      },
      { passive: true, cooldown: 0, name: "" },
      { passive: true, cooldown: 0, name: "" },
    ],
  },
};

const LAVA_SPELL = {
  name: "LAVA_SPELL",
  dealSpell: riseLava,
  range: 9,
  aoe: "single",
  canTarget: [EMPTY],
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
      {
        name: "Inferno Strike",
        dealSpell: damage,
        range: 4,
        rangeMin: 2,
        cooldown: 1,
        aoe: "straight_line_inferno",
        glyph: 1,
        color: GLYPH_BROWN,
        glyphIcon: damageIcon,
        canTarget: [ANY],
        description: "Deals damage in a straight line.",
        animation: FALL,
      },
      {
        name: "Freezing Curse",
        dealSpell: root,
        range: 2,
        rangeMin: 2,
        cooldown: 3,
        aoe: "square",
        canTarget: [ANY],
        description: "Instantly roots targets in a square area.",
      },
      {
        name: "Force Wave",
        dealSpell: push,
        range: 0,
        cooldown: 2,
        aoe: "ring_1",
        canTarget: [PLAYABLE],
        description: "Pushes out anyone around the caster in a ring area.",
      },
      // { name: "Blink", dealSpell: blink, range: 3, cooldown: 3, aoe: "single", glyph: 0, canTarget: [EMPTY] },
    ],
  },
  {
    name: "Fisherman",
    spells: [
      {
        name: "Bait Hook",
        dealSpell: pull,
        range: 5,
        rangeMin: 1,
        cooldown: 3,
        aoe: "straight_line",
        onlyFirst: true,
        canTarget: [ENTITY],
        description: "Pulls first target in a straight line.",
      },
      {
        name: "Fishing Net",
        dealSpell: root,
        range: 4,
        cooldown: 2,
        aoe: "pair",
        glyph: 1,
        color: GLYPH_BLUE,
        glyphIcon: rootIcon,
        canTarget: [ANY],
        description:
          "Drops a 2-cells net that roots targets who start their turn inside.",
      },
      {
        name: "Belly Bump",
        dealSpell: fisherman_push,
        range: 1,
        rangeMin: 1,
        cooldown: 2,
        aoe: "single",
        value: "1",
        canTarget: [ENTITY],
        description: "Pushes target and deals instant damage.",
      },
      // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, }
    ],
  },
  {
    name: "Golem",
    spells: [
      {
        name: "Boulder Smash",
        dealSpell: golem_boulder,
        range: 4,
        cooldown: 1,
        aoe: "single",
        glyph: 1,
        color: GLYPH_ORANGE,
        onMiss: "lava",
        glyphIcon: boulderIcon,
        canTarget: [ANY],
        description: "Deals damage, but if the cell was empty, rise lava.",
        animation: FALL,
      },
      {
        name: "Magma Wall",
        dealSpell: summon,
        summon: TABLE_SUMMONS["wall"],
        range: 3,
        cooldown: 3,
        aoe: "curly",
        ttl: 1,
        canTarget: [ANY],
        description: "Summons a wall in a curly area around a targeted cell.",
      },
      {
        name: "Explosion",
        dealSpell: damage,
        range: 0,
        cooldown: 2,
        aoe: "ring_1",
        isAura: true,
        glyph: 1,
        color: GLYPH_BROWN,
        canTarget: [PLAYABLE],
        description: "Deals damage around the caster.",
      },
    ],
  },
  {
    name: "Ninja",
    spells: [
      {
        name: "Cast Shadow",
        dealSpell: summon,
        summon: TABLE_SUMMONS["shadow"],
        range: 2,
        rangeMin: 1,
        cooldown: 3,
        aoe: "single",
        canTarget: [EMPTY],
        description: "Summons a shadow that can cast Spinning Slash.",
      },
      {
        name: "Spinning Slash",
        dealSpell: damage,
        range: 0,
        cooldown: 2,
        aoe: "ninja_slash",
        canTarget: [PLAYABLE],
        description:
          "Deals instant damage in a circular area around the caster and its shadow.",
      },
      {
        name: "Master of Illusion",
        dealSpell: switcheroo,
        range: 8,
        cooldown: 2,
        aoe: "single",
        canTarget: [SHADOW],
        description: "Swaps the positions of the caster and its shadow.",
      },
    ],
  },
  {
    name: "Demonist",
    spells: [
      {
        name: "Spawn Tentacle",
        dealSpell: demo_tentacle,
        summon: TABLE_SUMMONS["tentacle"],
        range: 3,
        rangeMin: 3,
        cooldown: 1,
        aoe: "tentacle",
        onlyFirst: true,
        canTarget: [EMPTY],
        description: "Spawns a tentacle that damages in a line.",
      },
      {
        name: "Summon Infernal",
        dealSpell: summon,
        summon: TABLE_SUMMONS["infernal"],
        range: 1,
        rangeMin: 1,
        cooldown: 5,
        aoe: "single",
        canTarget: [EMPTY],
        description: "Summons an infernal with a burning aura.",
      },
      {
        name: "Speed Boost",
        dealSpell: buffPM,
        range: 1,
        cooldown: 3,
        aoe: "single",
        canTarget: [ENTITY],
        description: "Grants 1 more movement point to an ally.",
      },
    ],
  },
  {
    name: "Rasta",
    spells: [
      {
        name: "Gatling Shot",
        dealSpell: damage,
        range: 9,
        cooldown: 1,
        aoe: "line",
        aoeSize: 5,
        glyph: 1,
        canTarget: [ANY],
        color: GLYPH_BROWN,
        glyphIcon: damageIcon,
        description: "Deals damage in a straight line.",
        animation: FALL,
      },
      {
        name: "Rolling Barrel",
        dealSpell: summon,
        summon: TABLE_SUMMONS["barrel"],
        range: 2,
        rangeMin: 1,
        cooldown: 2,
        aoe: "single",
        canTarget: [EMPTY],
        description: "Places explosive barrel.",
      },
      {
        name: "Jamming Retreat",
        dealSpell: buffPM,
        value: 2,
        range: 0,
        cooldown: 3,
        aoe: "single",
        canTarget: [ENTITY],
        description: "Grants 2 more movement points to the caster.",
      },
    ],
  },
  {
    name: "Assassin",
    spells: [
      {
        name: "Backstab",
        dealSpell: damage,
        range: 1,
        rangeMin: 1,
        cooldown: 1,
        aoe: "single",
        canTarget: [ENTITY],
        description: "Deals instant damage to a single target in close range.",
      },
      {
        name: "Silent Bullet",
        dealSpell: damage,
        range: 3,
        rangeMin: 3,
        cooldown: 2,
        aoe: "single_straight_line",
        canTarget: [ENTITY],
        description:
          "Deals instant damage to a single target in a straight line at 3 range.",
      },
      {
        name: "Smoke bomb",
        dealSpell: assassin_smokebomb,
        range: 1,
        rangeMin: 1,
        cooldown: 3,
        aoe: "ring_1_on_self",
        canTarget: [EMPTY],
        description:
          "Instantly roots all targets at close range and moves one cell.",
      },
      // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
    ],
  },
  {
    name: "Time Traveller",
    spells: [
      {
        name: "Time Machine",
        dealSpell: summon,
        summon: TABLE_SUMMONS["time_machine"],
        range: 3,
        rangeMin: 1,
        cooldown: 1,
        aoe: "single",
        glyph: 0,
        canTarget: [EMPTY],
        description:
          "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location.",
      },
      {
        name: "Backwards Hit",
        dealSpell: time_backwards_hit,
        range: 1,
        rangeMin: 1,
        cooldown: 2,
        aoe: "single",
        canTarget: [ENTITY],
        description:
          "Deals instant damage to a single target in close range, the caster then gets pushed backwards.",
      },
      {
        name: "Silence Lance",
        dealSpell: silence,
        range: 3,
        rangeMin: 0,
        cooldown: 2,
        aoe: "handspinner",
        glyph: 1,
        color: GLYPH_PURPLE,
        glyphIcon: silenceIcon,
        canTarget: [ANY],
        description: "Silences in a handspinner area.",
      },
      // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
    ],
  },
  {
    name: "Shaman",
    spells: [
      {
        name: "Undead Army",
        dealSpell: summon,
        summon: TABLE_SUMMONS["zombie"],
        range: 1,
        rangeMin: 1,
        cooldown: 3,
        aoe: "single",
        canTarget: [EMPTY],
        description: "Summons a zombie.",
      },
      {
        name: "Happy Flower",
        dealSpell: shaman_flower,
        range: 9,
        rangeMin: 3,
        cooldown: 2,
        aoe: "single",
        glyph: 1,
        permanent: true,
        canTarget: [EMPTY],
        color: GLYPH_FLOWER,
        glyphIcon: flowerIcon,
        description:
          "Creates a happy flower that heals and boosts the caster's range when he starts his turn on the glyph.",
      },
      {
        name: "Voodoo Curse",
        dealSpell: silence,
        range: 1,
        rangeMin: 1,
        cooldown: 2,
        aoe: "single",
        canTarget: [PLAYABLE],
        description: "Instantly silences a single target.",
      },
    ],
  },
  // {
  //     name: "Gazeur",
  //     spells: [
  //         { name: "Gaz gaz gaz", dealSpell: damage, range: 0, cooldown: 0, aoe: "single", glyph: 1, color: GLYPH_GAZ, passive: true, permanent: true, onMove: true, selfCast: true, affectsOnly: "other", glyphIcon: gasIcon, canTarget: [ANY] },
  //         { name: "Adrenaline", dealSpell: buffPM, range: 0, cooldown: 2, aoe: "single", type: "BUFF_PM", value: 2, canTarget: [ENTITY] },
  //         { name: "Salto", dealSpell: salto, range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [ENTITY] },
  //     ]
  // },
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
  //         { name: "Charge", damage: 1, range: 3, cooldown: 4, aoe: "line", glyph: 1, color: GLYPH_BLUE, }
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
];
