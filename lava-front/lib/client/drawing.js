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
let origin;

var layout = makeLayout();
// Create the grid container
var canvas, ctx;
const aspectRatio = c.CANVAS.WIDTH / c.CANVAS.HEIGHT;




function makeLayout(isPickPhase) {
  origin = new Point(c.CANVAS.WIDTH / 2, c.CANVAS.HEIGHT / 2);
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
  // Moved to UnitLayer.jsx
}

function drawMap(og) {
  // Legacy rendering removed in favor of React Sandwich Architecture.
  // Layout updates are handled in GameBoard.jsx

  // Cache layout (legacy compat for Anim.js)
  if (!layout || layout.isPickPhase !== og.isPickPhase) {
    layout = makeLayout(og.isPickPhase);
    layout.isPickPhase = og.isPickPhase;
  }
}

function findHexFromEvent(eventX, eventY) {
  // This needs canvas reference, but we removed setCanvas. 
  // We need to ensure React passes the rect or we find the canvas element dynamically if needed.
  // Or better: GameCanvas.tsx passes the event which has clientX/Y.
  // We'll rely on global canvas if it's set, or look it up.
  // Since we removed setCanvas, we should probably look up the canvas designated for input.
  // But wait, GameCanvas.tsx calls setCanvas no more.
  // So 'canvas' variable is undefined here.
  // We need to make this pure or take canvas as arg. 
  // But changing signature breaks callers like pickPhase.
  // For now, let's grab the canvas by ID 'canvas' (defined in GameCanvas.tsx).

  // React "Sandwich" Architecture Coordinate Mapping
  // The GameBoard is scaled via CSS transform.
  // The container 'game-board-container' listens for events.
  // We need to map client coordinates back to the internal 1920x1080 resolution.

  const container = document.getElementById("game-board-container");
  if (!container) return { q: 0, r: 0, s: 0 };

  const rect = container.getBoundingClientRect();

  // Calculate relative X/Y within the container
  const relX = eventX - rect.left;
  const relY = eventY - rect.top;

  // Calculate grid scale relative to the container 
  // (Internal Width / Container Width)
  const scaleX = c.CANVAS.WIDTH / rect.width;
  const scaleY = c.CANVAS.HEIGHT / rect.height;

  // Apply scale to get internal coordinates
  const internalX = relX * scaleX;
  const internalY = relY * scaleY;

  return layout.pixelToHex(new Point(internalX, internalY));
}

module.exports = {
  drawMap,
  findHexFromEvent,
  loadImages,
  loadIconsForDraft,
  origin,
  layout,
  makeLayout,
  initAssets,
  // Removed legacy exports
};
