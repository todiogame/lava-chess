const { Point, Hex, Layout } = require("../Hex");
const hud = require("./hud");
const c = require("../const");

const SCALE = 40;
const SIZE_GLYPH = 64;
const SIZE_PERSO = 80;
const SIZE_TILE = 95;
const THICKNESS = 1;

let origin = new Point(350, 300);
const layout = new Layout(Layout.pointy, new Point(SCALE, SCALE), origin);
// Create the grid container
var canvas, ctx;
const aspectRatio = 700 / 600;

function resizeCanvas() {
    canvas.height = window.innerHeight - 50;
    canvas.width = canvas.height * aspectRatio;
}

if (typeof window) {
    canvas = document.getElementById('canvas');
    resizeCanvas()
    ctx = canvas.getContext('2d');
}

tile0Image = new Image();
tile0Image.src = "pics/tile0.png";
tile1Image = new Image();
tile1Image.src = "pics/tile1.png";
tile2Image = new Image();
tile2Image.src = "pics/tile2.png";
tile3Image = new Image();
tile3Image.src = "pics/tile3.png";
tileImage = [tile0Image, tile1Image, tile2Image, tile3Image];

//glyphs
banIcon = new Image();
banIcon.src = "pics/ban.png";
damageIcon = new Image();
damageIcon.src = "pics/fire_icon.png";
rootIcon = new Image();
rootIcon.src = "pics/net.png";
silenceIcon = new Image();
silenceIcon.src = "pics/silence.png";
lavaIcon = new Image();
lavaIcon.src = "pics/rising.png";
gasIcon = new Image();
gasIcon.src = "pics/gas.png";
boulderIcon = new Image();
boulderIcon.src = "pics/boulder.png";
// flowerIcon = new Image();
// flowerIcon.src = "pics/flower.png"
tombstoneIcon = new Image();
tombstoneIcon.src = "pics/tombstone.png"

ARRAY_ICONS = {
    "banIcon": banIcon,
    "damageIcon": damageIcon,
    "rootIcon": rootIcon,
    "silenceIcon": silenceIcon,
    'gasIcon': gasIcon,
    "boulderIcon": boulderIcon,
    // "flowerIcon": flowerIcon,
    "tombstoneIcon": tombstoneIcon,
}

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
    "GLYPH_BAN": "rgb(200, 0, 0, 0.1)",
    "GLYPH_BLUE": "rgb(50, 150, 255, 0.2)",
    "GLYPH_BROWN": "rgb(150, 50, 30, 0.4)",
    "GLYPH_DARK": "rgb(12, 30, 12, 0.5)",
    "GLYPH_ORANGE": "rgb(255, 65, 0, 0.5)",
    "GLYPH_PURPLE": "rgb(255,0,255, 0.3)",
    "GLYPH_FLOWER": "rgb(30, 205, 50, 0.3)",
    "GLYPH_GAZ": "rgb(100, 255, 150, 0.3)",
    "GLYPH_PREVIEW": "rgb(255, 65, 0, 0.2)",
};

function drawEntities() {
  entities.forEach((e) => {
    if (e.image) drawPerso(e);
  });
}

function drawPerso(entity) {
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

  // outline
  if (entity.selected)
      drawWithOutline((entity.selected || TEAM == currentTeam) ? "WHITE" : "BLACK", THICKNESS + 2);
  else if (entity.hovered)
      drawWithOutline("WHITE", THICKNESS + 1);
  if (entity.team) drawWithOutline(entity.team, THICKNESS);
  else ctx.drawImage(
      entity.image,
      pPerso.x - SIZE_PERSO / 2,
      pPerso.y - (SIZE_PERSO * 3) / 4,
      SIZE_PERSO,
      SIZE_PERSO
  );

  function drawWithOutline(color, thick) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 0;
      for (var x = -thick; x <= thick; x++) {
          for (var y = -thick; y <= thick; y++) {
              ctx.shadowOffsetX = x;
              ctx.shadowOffsetY = y;
              ctx.drawImage(
                  entity.image,
                  pPerso.x - SIZE_PERSO / 2,
                  pPerso.y - (SIZE_PERSO * 3) / 4,
                  SIZE_PERSO,
                  SIZE_PERSO
              );
          }
      }
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
  }

  //draw shield
  if (entity.armor) {
      ctx.beginPath();
      ctx.arc(pPerso.x, pPerso.y - (SIZE_PERSO) / 4, 50, 0, 2 * Math.PI);
      if (entity.armorColor) ctx.fillStyle = ARRAY_GLYPH_COLOR[entity.armorColor]
      else ctx.fillStyle = ARRAY_GLYPH_COLOR["GLYPH_ORANGE"];
      ctx.fill();
  }
}

let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
let canvasTop = canvas.offsetTop + canvas.clientTop;

// Create our image
lava = new Image();
lava.src = "./pics/lavasmall.png";

function drawMap() {
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformation matrix
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Scale the content of the canvas to match the canvas size
  ctx.scale(canvas.width / 700, canvas.height / 600);

  if (map) {
      ctx.lineWidth = 1;
      ctx.fillStyle = ORANGE
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(lava, 0, 0, 700, 600);


      map.forEach(h => {
          // draw Hexagon
          ctx.beginPath();
          let pts = layout.polygonCorners(h)
          pts.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.stroke();
          // if (h.floor) paintCell(h, EARTH)
          if (h.floor) drawFloor(h)
          if (h.rangeMove) paintCell(h, MOVE_RANGE)
          if (h.rangeSpell) paintCell(h, SPELL_RANGE)
          if (h.hit) paintCell(h, SPELL_HIT)

          if (h.aoe.length) {
              h.aoe.forEach(spell => {
                  paintCell(h, ARRAY_GLYPH_COLOR[spell.color], ARRAY_ICONS[spell.glyphIcon])
              })
          }

          if (h.hoverMove) paintCell(h, MOVE_HOVER)
          if (h.hoverSpell) paintCell(h, SPELL_HOVER)

          if (isPickPhase) drawSpawns(h)

      })
      drawEntities();
      drawProjectiles();
      drawParticles();
      if (isPickPhase) hud.displayPickCharacterHUD()
      else hud.displayCharacterHUD(currentPlayer)

      if (hoverInfo.aoe?.length) {
          drawAOEtips(hoverInfo.aoe)
      }
      if (
          !isPickPhase &&
          hoverInfo.entity?.maxHP) {
          drawHPBar(hoverInfo.entity)
      }
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
    SIZE_TILE
  );
}

function drawSpawns(h) {
  if (h.floor) {
    if (currentTeam == c.CONSTANTS.TEAM_BLUE) {
      if (h.r >= 3) paintCell(h, SPAWN_BLUE_ACTIVE);
      if (h.r <= -3) paintCell(h, SPAWN_RED);
    } else {
      if (h.r >= 3) paintCell(h, SPAWN_BLUE);
      if (h.r <= -3) paintCell(h, SPAWN_RED_ACTIVE);
    }
  }
}

function paintCell(mapCell, color, glyphIcon) {
  ctx.fillStyle = color;
  ctx.fill();
  if (glyphIcon) {
    let pGlyph = layout.hexToPixel(mapCell);
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      glyphIcon,
      pGlyph.x - SIZE_GLYPH / 2,
      pGlyph.y - SIZE_GLYPH / 2,
      SIZE_GLYPH,
      SIZE_GLYPH
    );
    ctx.globalAlpha = 1;
  }
}

const drawProjectiles = () => {
  // console.log("projectiles", projectiles);
  if (projectiles) {
    projectiles.forEach((e) => {
      if (e.glyphIcon && e.moving) drawProjectile(e);
    });
  }
};

const drawProjectile = (projectile) => {
  let posProjectile = layout.hexToPixel(projectile.goal);

  // Moving towards the goal
  projectile.xDirection = projectile.goal.x - projectile.lastPos.x;
  projectile.yDirection = projectile.goal.y - projectile.lastPos.y;
  projectile.movingPos.x += projectile.xDirection / 10;
  projectile.movingPos.y += projectile.yDirection / 10;

  // Check if the projectile has gone past the goal
  posProjectile = Anim.stopAtGoal(projectile);

  for (var x = -THICKNESS; x <= THICKNESS; x++) {
    for (var y = -THICKNESS; y <= THICKNESS; y++) {
      ctx.shadowOffsetX = x;
      ctx.shadowOffsetY = y;
      ctx.drawImage(
        ARRAY_ICONS[projectile.glyphIcon],
        posProjectile.x - SIZE_TILE / 2,
        posProjectile.y - SIZE_TILE / 2,
        SIZE_TILE,
        SIZE_TILE
      );
    }
  }
};

const drawParticles = () => {

  if (particles) {
    particles.forEach((p, i) => {

      if (p.moving) {
        p.x += p.speed * Math.cos((p.rotation * Math.PI) / 180);
        p.y += p.speed * Math.sin((p.rotation * Math.PI) / 180);

        p.opacity -= 0.01;
        p.speed *= p.friction;
        p.radius *= p.friction;
        p.yVel += p.gravity;
        p.y += p.yVel;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
        ctx.fill();
      }
    });
  }
};

function findHexFromEvent(eventX, eventY) {
  return layout.pixelToHex(new Point(eventX - canvasLeft, eventY - canvasTop));
}

module.exports = {
  drawMap,
  findHexFromEvent,
  origin,
  layout,
  canvas,
  ctx,
};
