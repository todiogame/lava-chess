const { Point, Hex, Layout } = require("../Hex");
const hud = require("./hud");
const c = require("../const");
const text = require("./text");
const utils = require("../gameUtils");

const SCALE = 60;
const SIZE_GLYPH = 115;
const SIZE_PERSO = 120;
const SIZE_TILE = 144;
const THICKNESS = 1;

var layout = makeLayout();
// Create the grid container
var canvas, ctx;
const aspectRatio = c.CANVAS.WIDTH / c.CANVAS.HEIGHT;

function makeLayout(isPickPhase) {
  let origin = new Point(c.CANVAS.WIDTH / 2 + (isPickPhase ? 200 : 0), c.CANVAS.HEIGHT / 2);
  const layout = new Layout(Layout.pointy, new Point(SCALE, SCALE), origin);
  return layout;
}

function resizeCanvas() {
  canvas.height = window.innerHeight - 130;  // Leave space for SpellDock
  canvas.width = canvas.height * aspectRatio;
}


function setCanvas(canvasRef) {
  canvas = canvasRef;
  canvasLeft = canvas.offsetLeft + canvas.clientLeft;
  canvasTop = canvas.offsetTop + canvas.clientTop;
  ctx = canvas.getContext("2d");
  resizeCanvas();
  // Ensure resize listener is attached only once or handled by React
  // window.addEventListener("resize", resizeCanvas); 
}


const AssetManager = require("./AssetManager");

AssetManager.queueDownload("pics/clock.webp");
AssetManager.queueDownload("pics/help.webp");

AssetManager.queueDownload("pics/tile0.webp");
AssetManager.queueDownload("pics/tile1.webp");
AssetManager.queueDownload("pics/tile2.webp");
AssetManager.queueDownload("pics/tile3.webp");

//glyphs
AssetManager.queueDownload("pics/ban.webp");
AssetManager.queueDownload("pics/fire_icon.webp");
AssetManager.queueDownload("pics/net.webp");
AssetManager.queueDownload("pics/silence.webp");
AssetManager.queueDownload("pics/rising.webp");
AssetManager.queueDownload("pics/gas.webp");
AssetManager.queueDownload("pics/boulder.webp");
AssetManager.queueDownload("pics/tombstone.webp");
AssetManager.queueDownload("pics/waveIcon.webp");
AssetManager.queueDownload("pics/ethereal_icon.webp");

AssetManager.queueDownload("pics/spells/spell_placeholder.webp");
AssetManager.queueDownload("pics/spells/cd_icon.webp");
AssetManager.queueDownload("pics/spells/move.webp");
AssetManager.queueDownload("pics/spells/lavapass.webp");
AssetManager.queueDownload("pics/spells/pass.webp");
AssetManager.queueDownload("pics/spells/cooldown.webp");

AssetManager.queueDownload("pics/lavasmall.webp");

let colorSpellPassive = "rgb(120,120,120, 0.3)"
let colorSpellSilenced = "rgb(120,0,120, 0.3)"
let colorSpellDisabled = "rgb(0,0,75, 0.3)"
let colorSpellEnemyTurn = "rgb(120, 120, 120, .6)";

function initAssets() {
  clockImage = AssetManager.getAsset("pics/clock.webp");
  helpCircleImage = AssetManager.getAsset("pics/help.webp");

  tile0Image = AssetManager.getAsset("pics/tile0.webp");
  tile1Image = AssetManager.getAsset("pics/tile1.webp");
  tile2Image = AssetManager.getAsset("pics/tile2.webp");
  tile3Image = AssetManager.getAsset("pics/tile3.webp");
  tileImage = [tile0Image, tile1Image, tile2Image, tile3Image];

  banIcon = AssetManager.getAsset("pics/ban.webp");
  damageIcon = AssetManager.getAsset("pics/fire_icon.webp");
  rootIcon = AssetManager.getAsset("pics/net.webp");
  silenceIcon = AssetManager.getAsset("pics/silence.webp");
  lavaIcon = AssetManager.getAsset("pics/rising.webp");
  gasIcon = AssetManager.getAsset("pics/gas.webp");
  boulderIcon = AssetManager.getAsset("pics/boulder.webp");
  tombstoneIcon = AssetManager.getAsset("pics/tombstone.webp");
  waveIcon = AssetManager.getAsset("pics/waveIcon.webp");
  etherealIcon = AssetManager.getAsset("pics/ethereal_icon.webp");

  placeholderSpell = AssetManager.getAsset("pics/spells/spell_placeholder.webp");
  cdIcon = AssetManager.getAsset("pics/spells/cd_icon.webp");
  move = AssetManager.getAsset("pics/spells/move.webp");
  lavapass = AssetManager.getAsset("pics/spells/lavapass.webp");
  pass = AssetManager.getAsset("pics/spells/pass.webp");
  cooldown = AssetManager.getAsset("pics/spells/cooldown.webp");
  lava = AssetManager.getAsset("pics/lavasmall.webp");

  ARRAY_ICONS = {
    banIcon: banIcon,
    damageIcon: damageIcon,
    rootIcon: rootIcon,
    silenceIcon: silenceIcon,
    gasIcon: gasIcon,
    boulderIcon: boulderIcon,
    tombstoneIcon: tombstoneIcon,
    waveIcon: waveIcon,
  };
}

ARRAY_ICONS = {}; // Will be populated in initAssets

const ORANGE = "rgb(255, 65, 0, 0.7)";
const EARTH = "rgb(220, 150, 30)";

const SPAWN_BLUE = "rgb(0,200,200, 0.2)";
const SPAWN_RED = "rgb(255, 0, 0, 0.2)";
const SPAWN_BLUE_ACTIVE = "rgb(0,200,200, 0.7)";
const SPAWN_RED_ACTIVE = "rgb(255, 0, 0, 0.7)";

const MOVE_HOVER = "rgb(30, 75, 0, 0.5)";
const MOVE_RANGE = "rgb(30, 205, 0, 0.5)";
const SPELL_HOVER = "rgb(255, 0, 0, 0.5)";
const SPELL_RANGE = "rgb(255, 100, 100, 0.4)";
const SPELL_HIT = "rgb(255, 50, 50, 0.5)";
const ARRAY_GLYPH_COLOR = {
  GLYPH_BAN: "rgb(200, 0, 0, 0.1)",
  GLYPH_BLUE: "rgb(50, 150, 255, 0.2)",
  GLYPH_BROWN: "rgb(150, 50, 30, 0.5)",
  GLYPH_DARK: "rgb(12, 30, 12, 0.5)",
  GLYPH_ORANGE: "rgb(255, 65, 0, 0.5)",
  GLYPH_PURPLE: "rgb(255,0,255, 0.3)",
  GLYPH_FLOWER: "rgb(30, 205, 50, 0.3)",
  GLYPH_GAZ: "rgb(100, 255, 150, 0.3)",
  GLYPH_WATER: "rgb(0, 0, 150, 0.3)",
  GLYPH_PREVIEW: "rgb(255, 65, 0, 0.2)",
  GLYPH_HIGHLIGHT: "rgb(255, 255, 200, 0.2)",
};

function loadIconsForDraft(entities) {
  entities.map(p => {
    for (let i = 0; i < p.spellsDisplay.length; i++) {
      const path = `./pics/spells/${p.id.toLowerCase()}_${i + 1}.webp`;
      p.spells[i].image = AssetManager.getAsset(path);
      // Note: For now, draft icons might need dynamic loading if not preloaded.
      // Ideally we preload all spells. For this task, we will just use the preloader for static assets
      // and let dynamic assets be handled carefully or ensuring we queue them ALL.
      if (!p.spells[i].image) {
        // Fallback for not-yet-loaded
        const image = new Image();
        image.src = path;
        p.spells[i].image = image;
      }
    }
    return p;
  })
  return entities
}

function loadImages(players) {
  players.map(p => {
    // console.log(p)
    // Character Image
    const charPath = `pics/${p.entity.id.toLowerCase()}.webp`;
    let charImg = AssetManager.getAsset(charPath);
    if (!charImg) {
      charImg = new Image();
      charImg.src = charPath;
    }
    p.entity.image = charImg;

    for (let i = 0; i < p.spells.length; i++) {
      const path = `./pics/spells/${p.entity.id.toLowerCase()}_${i + 1}.webp`;
      let img = AssetManager.getAsset(path);
      if (!img) {
        img = new Image();
        img.src = path;
      }
      p.spells[i].image = img;
    }
    return p;
  })
  return players
}

// Export initAssets

function drawEntities(og) {
  og.entities = og.entities.sort((a, b) => a.pos.r - b.pos.r); //sort so the front ones are not behind the back line
  og.entities.forEach((e) => {
    if (e.image) drawPerso(e, og);
  });
}

function drawPerso(entity, og) {
  //   console.log(entity);
  let pPerso;
  pPerso = layout.hexToPixel(entity.pos);

  if (entity.moving) {
    // Moving towards the goal
    entity.xDirection = entity.goal.x - entity.lastPos.x;
    entity.yDirection = entity.goal.y - entity.lastPos.y;
    entity.movingPos.x += entity.xDirection / 10;
    entity.movingPos.y += entity.yDirection / 10;
    pPerso = Anim.stopAtGoal(entity);
  }

  if (entity.isEthereal && entity.isEthereal()) {
    ctx.globalAlpha = 0.5
  }
  // outline
  if (entity.isPlaying || (og.isPickPhase && entity.selected))
    drawWithOutline(
      (og.isPickPhase || TEAM == og.currentPlayer.entity.team) ? "WHITE" : "BLACK",
      THICKNESS + 3,
    );
  else if (entity.hovered) drawWithOutline("WHITE", THICKNESS + 1);
  if (entity.team) drawWithOutline(entity.team, THICKNESS);
  else {
    ctx.drawImage(
      entity.image,
      pPerso.x - SIZE_PERSO / 2,
      pPerso.y - (SIZE_PERSO * 3) / 4,
      SIZE_PERSO,
      SIZE_PERSO,
    );
  }


  function drawWithOutline(color, thick) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = thick;
    // Multi-pass shadow for intensity without n^2 draw calls
    // Drawing at 4 corners is enough to create a strong outline effect
    const offsets = [
      { x: -thick, y: 0 },
      { x: thick, y: 0 },
      { x: 0, y: -thick },
      { x: 0, y: thick },
    ];

    offsets.forEach(offset => {
      ctx.shadowOffsetX = offset.x; // Use shadow offset instead of moving the image
      ctx.shadowOffsetY = offset.y;
      ctx.drawImage(
        entity.image,
        pPerso.x - SIZE_PERSO / 2,
        pPerso.y - (SIZE_PERSO * 3) / 4,
        SIZE_PERSO,
        SIZE_PERSO,
      );
    });

    ctx.restore();
  }

  //draw shield
  if (entity.armor) {
    ctx.beginPath();
    ctx.arc(pPerso.x, pPerso.y - SIZE_PERSO / 4, SIZE_PERSO / 2, 0, 2 * Math.PI);
    if (entity.armorColor) ctx.fillStyle = ARRAY_GLYPH_COLOR[entity.armorColor];
    else ctx.fillStyle = ARRAY_GLYPH_COLOR["GLYPH_ORANGE"];
    ctx.fill();
  }


  //draw hp bar : 
  if (!og.isPickPhase && entity?.maxHP && (displayAllHP || hoverInfo.help)) {
    drawHPBar(entity, hoverInfo.help);
  }

  //draw ethereal icon
  if (entity.isEthereal && entity.isEthereal()) {
    ctx.drawImage(
      etherealIcon,
      pPerso.x - SIZE_PERSO / 2,
      pPerso.y - (SIZE_PERSO * 3) / 4,
      SIZE_PERSO,
      SIZE_PERSO,
    );
    ctx.globalAlpha = 1
  }
}


let canvasLeft, canvasTop;

// Create our image
// lava = new Image();
// lava.src = "./pics/lavasmall.png";

function drawMap(og) {
  // console.log(og)

  // Cache layout to avoid recreating it 60 times/sec if phase hasn't changed
  if (!layout || layout.isPickPhase !== og.isPickPhase) {
    layout = makeLayout(og.isPickPhase);
    layout.isPickPhase = og.isPickPhase;
  }

  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformation matrix
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Scale the content of the canvas to match the canvas size
  ctx.scale(canvas.width / c.CANVAS.WIDTH, canvas.height / c.CANVAS.HEIGHT);

  if (og.map) {
    ctx.lineWidth = 1;
    ctx.fillStyle = ORANGE;
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(lava, 0, 0, c.CANVAS.WIDTH, c.CANVAS.HEIGHT);
    ctx.fillStyle = "rgb(0, 0, 0, .15)";
    ctx.fillRect(0, 0, c.CANVAS.WIDTH, c.CANVAS.HEIGHT);

    og.map.forEach((h) => {
      ctx.save()

      // draw Hexagon
      ctx.beginPath();
      let pts = layout.polygonCorners(h);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.stroke();
      ctx.clip();
      // if (h.floor) paintCell(h, EARTH)
      if (h.floor) drawFloor(h);
      if (h.rangeMove) paintCell(h, MOVE_RANGE);
      if (h.rangeSpell) paintCell(h, SPELL_RANGE);
      if (h.hit) paintCell(h, SPELL_HIT);

      if (h.aoe.length) {
        h.aoe.forEach((spell) => {
          paintCell(
            h,
            ARRAY_GLYPH_COLOR[spell.color],
            spell.image,
          );
        });
      }

      if (h.hoverMove) paintCell(h, MOVE_HOVER);
      if (h.hoverSpell) paintCell(h, SPELL_HOVER);

      // highlight glyphs of unit currently hovered
      if (h.aoe.some((eff) => eff.source?.entity.hovered)) {
        paintCell(h, ARRAY_GLYPH_COLOR["GLYPH_HIGHLIGHT"]);
      }
      // console.log(og.isPickPhase)
      if (og.isPickPhase) drawSpawns(h, og);
      ctx.restore()
    });
    drawEntities(og);
    drawProjectiles();
    drawParticles();

    // Removed legacy HUD calls (drawAOEtips, drawClock, drawHelpCircle, drawSpells, etc.)
    // Only keeping HP Bars for now as they are attached to units
    if (!og.isPickPhase && hoverInfo.entity?.maxHP) {
      drawHPBar(hoverInfo.entity);
    }

    if (hoverInfo.aoe || hoverInfo.entity || hoverInfo.element || hoverInfo.help) document.getElementById("canvas").style.cursor = 'pointer';
    else document.getElementById("canvas").style.cursor = 'auto';
  }
}

// function drawPopup(og) { REMOVED }
function drawPopup(og) { }

// function displayPickCharacterHUD(og) { REMOVED }
function displayPickCharacterHUD(og) { }

// function displayStars(num) { REMOVED }

// function drawNames(og) { REMOVED }
function drawNames(og) { }
// function drawHelpCircle() { REMOVED }
function drawHelpCircle() { }

function drawPlayingEntityTopLeft(entity, x, y, size) {
  ctx.drawImage(lava, x, y, size, size,);
  ctx.drawImage(entity.image, x, y, size, size,);

  ctx.strokeStyle = entity.team ? entity.team : "orange";
  ctx.lineWidth = 10;
  ctx.strokeRect(x, y, size, size);
}

// function drawSpells(og, buttonSpell, player, bottomRow,) { REMOVED }
function drawSpells(og, buttonSpell, player, bottomRow) { }

// function drawClock() { REMOVED }
function drawClock() { }

// function drawAOEtips(aoes) { REMOVED }
function drawAOEtips(aoes) { }

function drawHPBar(entity, showOrder) {
  showOrder = showOrder && entity.types.includes(c.TYPES.PLAYABLE) ? 1 : 0;
  let posBar = {
    x: layout.hexToPixel(entity.pos).x - 50,
    y: layout.hexToPixel(entity.pos).y - SIZE_PERSO
  };
  if (posBar.y < 0) posBar.y += 30
  ctx.lineWidth = 2;
  ctx.strokeStyle = entity.team;
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();
  if (ctx.roundRect)
    // ca bug firefox
    ctx.roundRect(
      posBar.x - showOrder * 20,
      posBar.y,
      100 + showOrder * 20,
      40,
      20,
    );
  else
    ctx.fillRect(
      posBar.x - showOrder * 20,
      posBar.y,
      100 + showOrder * 20,
      40,
    );
  ctx.stroke();
  ctx.fill();

  //hp bar
  ctx.strokeStyle = "rgb(0, 0, 0)";
  for (let i = 0; i < entity.maxHP; i++) {
    if (i < entity.currentHP) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
    } else {
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    }
    ctx.fillRect(
      posBar.x + 10 + i * 20,
      posBar.y + 10,
      20,
      20,
    );
    ctx.strokeRect(
      posBar.x + 10 + i * 20,
      posBar.y + 10,
      20,
      20);
  }

  ctx.font = "bold 36px 'Russo One', sans-serif";
  ctx.fillStyle = "white";
  if (showOrder && entity.currentOrder) {  //write order
    ctx.fillText(
      entity.currentOrder,
      posBar.x - 15,
      posBar.y + 32,
    );
  } else if (showOrder && entity.currentOrder == 0) {
    ctx.fillText(
      '⭐️',
      posBar.x - 30,
      posBar.y + 32,
    );
  }
}

function drawFloor(h) {
  pPerso = layout.hexToPixel(h);
  // tileImage[Math.floor(Math.random() * 4)] //kek
  ctx.drawImage(
    tileImage[h.rand4],
    pPerso.x - SIZE_TILE / 2,
    pPerso.y - SIZE_TILE / 2,
    SIZE_TILE,
    SIZE_TILE,
  );
}

function drawSpawns(h, og) {
  if (h.floor) {
    if (og.currentTeamPicking == c.CONSTANTS.TEAM_BLUE) {
      if (h.r >= 3) paintCell(h, SPAWN_BLUE_ACTIVE);
      if (h.r <= -3) paintCell(h, SPAWN_RED);
    } else {
      if (h.r >= 3) paintCell(h, SPAWN_BLUE);
      if (h.r <= -3) paintCell(h, SPAWN_RED_ACTIVE);
    }
  }
}

function paintCell(mapCell, color, glyphIcon) {
  if (glyphIcon) {
    let pGlyph = layout.hexToPixel(mapCell);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(
      glyphIcon,
      pGlyph.x - SIZE_GLYPH / 2,
      pGlyph.y - SIZE_GLYPH / 2,
      SIZE_GLYPH,
      SIZE_GLYPH,
    );
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
}

const drawProjectiles = () => {
  // console.log("projectiles", projectiles);
  if (projectiles) {
    projectiles.forEach((e) => {
      if ((e.glyphIcon || e.text) && e.moving) drawProjectile(e);
    });
  }
};

const drawProjectile = (projectile) => {
  let posProjectile = projectile.goal;

  // Moving towards the goal
  projectile.xDirection = projectile.goal.x - projectile.lastPos.x;
  projectile.yDirection = projectile.goal.y - projectile.lastPos.y;
  projectile.movingPos.x += projectile.xDirection / 10;
  projectile.movingPos.y += projectile.yDirection / 10;

  // Check if the projectile has gone past the goal
  posProjectile = projectile.stopAtGoal
    ? Anim.stopAtGoal(projectile)
    : projectile.movingPos;

  if (projectile.type == "picture") {
    for (var x = -THICKNESS; x <= THICKNESS; x++) {
      for (var y = -THICKNESS; y <= THICKNESS; y++) {
        ctx.shadowOffsetX = x;
        ctx.shadowOffsetY = y;
        ctx.drawImage(
          ARRAY_ICONS[projectile.glyphIcon],
          posProjectile.x - SIZE_TILE / 2,
          posProjectile.y - SIZE_TILE / 2,
          SIZE_TILE,
          SIZE_TILE,
        );
      }
    }
  } else if (projectile.type == "text") {
    ctx.globalAlpha = 1.0;
    ctx.font = "bold 48px serif";
    ctx.fillStyle = "black";
    ctx.fillText(projectile.text, posProjectile.x, posProjectile.y);
    // ctx.fillText(
    //   projectile.text,
    //   posProjectile.x - ctx.measureText(projectile.text).width / 2,
    //   posProjectile.y - 90,
    // );
  }
};

const drawParticles = () => {
  if (particles) {
    particles.forEach((p, i) => {
      if (p.randomAppearance && Math.random() > 0.5) return;
      if (p.randomPos) {
        p.x = p.randomx();
        p.y = p.randomy();
      }
      p.x += p.speed * Math.cos((p.rotation * Math.PI) / 180);
      p.y += p.speed * Math.sin((p.rotation * Math.PI) / 180);

      p.opacity += p.opacitySpeed;
      p.speed *= p.friction;
      p.radius *= p.friction;
      p.yVel += p.gravity;
      p.y += p.yVel;
      if (p.opacity < 0 || p.radius < 0) return;

      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      if (p.shape == "circle") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
        ctx.fill();
      } else if (p.shape == "rectangle") {
        ctx.beginPath();
        if (p.fill) {
          ctx.strokeRect(
            p.randomPos ? p.randomx() : p.x - p.radius / 2,
            p.randomPos ? p.randomy() : p.y - p.radius / 2,
            Math.random() * p.radius,
            Math.random() * p.radius,
          );
        } else {
          ctx.fillRect(
            p.randomPos ? p.randomx() : p.x - p.radius / 2,
            p.randomPos ? p.randomy() : p.y - p.radius / 2,
            Math.random() * p.radius,
            Math.random() * p.radius,
          );
        }

        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    });
  }
  ctx.globalAlpha = 1;

  particles = particles.filter((p) => p.moving);
};


function findHexFromEvent(eventX, eventY) {
  const rect = canvas.getBoundingClientRect();
  const x = eventX - rect.left;
  const y = eventY - rect.top;

  const scaleX = canvas.width / c.CANVAS.WIDTH;
  const scaleY = canvas.height / c.CANVAS.HEIGHT;

  return layout.pixelToHex(new Point(x / scaleX, y / scaleY));
}

module.exports = {
  drawMap,
  findHexFromEvent,
  loadImages,
  loadIconsForDraft,
  origin,
  layout,
  makeLayout,
  canvas,
  ctx,
  initAssets,
  setCanvas
};
