const { Point, Hex, Layout } = require("../Hex");
const hud = require("./hud");
const c = require("../const");
const text = require("./text")

const SCALE = 60;
const SIZE_GLYPH = 64;
const SIZE_PERSO = 120;
const SIZE_TILE = 144;
const THICKNESS = 1;

let origin = new Point(c.CANVAS.WIDTH / 2, c.CANVAS.HEIGHT / 2);
const layout = new Layout(Layout.pointy, new Point(SCALE, SCALE), origin);
// Create the grid container
var canvas, ctx;
const aspectRatio = c.CANVAS.WIDTH / c.CANVAS.HEIGHT;

function resizeCanvas() {
  canvas.height = window.innerHeight - 50;
  canvas.width = canvas.height * aspectRatio;
}

if (typeof window) {
  canvas = document.getElementById("canvas");
  resizeCanvas();
  ctx = canvas.getContext("2d");
  window.addEventListener("resize", resizeCanvas);
}

clockImage = new Image();
clockImage.src = "pics/clock.png";

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
tombstoneIcon.src = "pics/tombstone.png";

placeholderSpell = new Image();
placeholderSpell.src = "pics/spells/spell_placeholder.png";

cdIcon = new Image();
cdIcon.src = "pics/spells/cd_icon.png";
move = new Image();
move.src = "pics/spells/move.png";
lavapass = new Image();
lavapass.src = "pics/spells/lavapass.png";
pass = new Image();
pass.src = "pics/spells/pass.png";
cooldown = new Image();
cooldown.src = "pics/spells/cooldown.png";
let colorSpellPassive = "rgb(120,120,120, 0.5)"
let colorSpellSilenced = "rgb(120,0,120, 0.5)"
let colorSpellDisabled = "rgb(0,0,75, 0.5)"
colorSpellSilenced
ARRAY_ICONS = {
  banIcon: banIcon,
  damageIcon: damageIcon,
  rootIcon: rootIcon,
  silenceIcon: silenceIcon,
  gasIcon: gasIcon,
  boulderIcon: boulderIcon,
  // "flowerIcon": flowerIcon,
  tombstoneIcon: tombstoneIcon,
};

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
  GLYPH_BROWN: "rgb(150, 50, 30, 0.4)",
  GLYPH_DARK: "rgb(12, 30, 12, 0.5)",
  GLYPH_ORANGE: "rgb(255, 65, 0, 0.5)",
  GLYPH_PURPLE: "rgb(255,0,255, 0.3)",
  GLYPH_FLOWER: "rgb(30, 205, 50, 0.3)",
  GLYPH_GAZ: "rgb(100, 255, 150, 0.3)",
  GLYPH_PREVIEW: "rgb(255, 65, 0, 0.2)",
  GLYPH_HIGHLIGHT: "rgb(255, 255, 200, 0.2)",
};

function loadImages(players) {
  players.map(p => {
    console.log(p)
    for (let i = 0; i < p.spells.length; i++) {
      const image = new Image();
      image.src = `./pics/spells/${p.entity.name.toLowerCase()}_${i + 1}.png`;
      p.spells[i].image = image;
    }
    return p;
  })
  return players
}

function drawEntities() {
  entities = entities.sort((a, b) => a.pos.r - b.pos.r); //sort so the front ones are not behind the back line
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
    drawWithOutline(
      entity.selected || TEAM == currentTeam ? "WHITE" : "BLACK",
      THICKNESS + 2,
    );
  else if (entity.hovered) drawWithOutline("WHITE", THICKNESS + 1);
  if (entity.team) drawWithOutline(entity.team, THICKNESS);
  else
    ctx.drawImage(
      entity.image,
      pPerso.x - SIZE_PERSO / 2,
      pPerso.y - (SIZE_PERSO * 3) / 4,
      SIZE_PERSO,
      SIZE_PERSO,
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
          SIZE_PERSO,
        );
      }
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  //draw shield
  if (entity.armor) {
    ctx.beginPath();
    ctx.arc(pPerso.x, pPerso.y - SIZE_PERSO / 4, 50, 0, 2 * Math.PI);
    if (entity.armorColor) ctx.fillStyle = ARRAY_GLYPH_COLOR[entity.armorColor];
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
  ctx.scale(canvas.width / c.CANVAS.WIDTH, canvas.height / c.CANVAS.HEIGHT);

  if (map) {
    ctx.lineWidth = 1;
    ctx.fillStyle = ORANGE;
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(lava, 0, 0, c.CANVAS.WIDTH, c.CANVAS.HEIGHT);

    map.forEach((h) => {
      // draw Hexagon
      ctx.beginPath();
      let pts = layout.polygonCorners(h);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.stroke();
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
            ARRAY_ICONS[spell.glyphIcon],
          );
        });
      }

      if (h.hoverMove) paintCell(h, MOVE_HOVER);
      if (h.hoverSpell) paintCell(h, SPELL_HOVER);

      // highlight glyphs of unit currently hovered
      if (h.aoe.some((eff) => eff.source?.entity.hovered)) {
        paintCell(h, ARRAY_GLYPH_COLOR["GLYPH_HIGHLIGHT"]);
      }

      if (isPickPhase) drawSpawns(h);
    });
    drawEntities();
    drawProjectiles();
    drawParticles();

    // if (isPickPhase) hud.displayPickCharacterHUD();
    // else hud.displayCharacterHUD(currentPlayer);

    if (currentPlayer) drawPlayingEntityTopLeft(currentPlayer.entity);

    if (hoverInfo.aoe?.length) {
      drawAOEtips(hoverInfo.aoe);
    }
    if (!isPickPhase && hoverInfo.entity?.maxHP) {
      drawHPBar(hoverInfo.entity);
    }
  }

  // if (!isPickPhase) 
  drawClock();

  if (currentPlayer) drawSpells()
}

function drawPlayingEntityTopLeft(entity) {
  let size = SIZE_PERSO * 3
  let coord = 10;
  ctx.drawImage(lava, coord, coord, size, size,);
  ctx.drawImage(entity.image, coord, coord, size, size,);

  ctx.strokeStyle = entity.team;
  ctx.lineWidth = 10;
  ctx.strokeRect(coord, coord, size, size);
}

function drawSpells() {
  //draw move button
  let x = buttonSpell.w_offset - (buttonSpell.width) - 10;
  let y = buttonSpell.h_offset - buttonSpell.height;
  ctx.drawImage(move, x, y, buttonSpell.width, buttonSpell.height);
  ctx.strokeStyle = buttonSpell.borderColor;
  ctx.lineWidth = buttonSpell.borderWidth;
  ctx.strokeRect(x, y, buttonSpell.width, buttonSpell.height);

  if (currentPlayer.movePoint <= 0) {
    ctx.fillStyle = colorSpellDisabled;
    ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
  }
  //write move points
  ctx.font = "bold 36px 'Russo One', sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(
    currentPlayer.movePoint,
    x + (buttonSpell.width) - 28 ,
    y + 32 ,
  );
  //draw spell buttons
  for (let i = 0; i < currentPlayer.spells.length; i++) {
    x = buttonSpell.w_offset + i * (buttonSpell.width + 10);

    const spellImage = currentPlayer.spells[i].image;
    if (!spellImage || !spellImage.naturalWidth || !spellImage.naturalHeight) {
      ctx.drawImage(placeholderSpell, x, y, buttonSpell.width, buttonSpell.height);
    } else {
      ctx.drawImage(spellImage, x, y, buttonSpell.width, buttonSpell.height);
    }
    ctx.strokeStyle = buttonSpell.borderColor;
    ctx.lineWidth = buttonSpell.borderWidth;
    ctx.strokeRect(x, y, buttonSpell.width, buttonSpell.height);
    //color spell if unavailable
    if (currentPlayer.spells[i].passive) {
      ctx.fillStyle = colorSpellPassive;
      ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
    } else if (currentPlayer.entity.auras.length && currentPlayer.entity.auras.some(a => a.name == "silence")) {
      ctx.drawImage(silenceIcon, x, y, buttonSpell.width, buttonSpell.height);
      ctx.fillStyle = colorSpellSilenced;
      ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
    } else if (currentPlayer.spells[i].currentCD > 0) {
      ctx.drawImage(cooldown, x, y, buttonSpell.width, buttonSpell.height);
      ctx.fillStyle = colorSpellDisabled;
      ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
    }
  }
  //draw rise lava and pass buttons
  x = c.CANVAS.WIDTH * 7 / 10
  if (currentPlayer.isSummoned)
    ctx.drawImage(pass, x, y, buttonSpell.width, buttonSpell.height);
  else
    ctx.drawImage(lavapass, x, y, buttonSpell.width, buttonSpell.height);
  ctx.strokeStyle = buttonSpell.borderColor;
  ctx.lineWidth = buttonSpell.borderWidth;
  ctx.strokeRect(x, y, buttonSpell.width, buttonSpell.height);

  //draw tooltips
  if (hoverInfo.element) {
    //draw rectangle
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 10;

    x = buttonSpell.w_offset - (buttonSpell.width) - 10;
    y = buttonSpell.h_offset - buttonSpell.height * 2 - 10;
    ctx.beginPath();
    ctx.fillRect(
      x,
      y - 40,
      430,
      100 + 40,
      20,
    );
    ctx.stroke();
    ctx.fill();
    //write spell name
    ctx.font = "bold 26px 'Russo One', sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(
      hoverInfo.element.name,
      x + 10,
      y + 30 - 40 ,
    );
    //write cooldown
    if (hoverInfo.element.cooldown) {
      ctx.drawImage(
        cdIcon,
        x + 430 - 100,
        y - 40,
        50, 50);
      ctx.fillText(
        hoverInfo.element.currentCD + "/" + hoverInfo.element.cooldown,
        x + 430 - 100 + 55,
        y + 30 - 40 ,
      );
    }
    //write description
    ctx.font = "20px 'Russo One', sans-serif";
    let descriptionArr = [hoverInfo.element.description]
    let n = 1;
    while (descriptionArr.some(line => ctx.measureText(line).width > 410)) {
      n++
      descriptionArr = text.format(hoverInfo.element.description, n)
    }
    console.log("split text in ", n)

    descriptionArr.forEach((line, i) => {
      ctx.fillText(
        line,
        x + 10,
        y + 25 + 30 * i,
      );
    })
  }

}

function drawClock() {
  let timeleft;
  if (turnTimer.turnStartTime) {
    timeleft = Math.ceil(
      (c.CONSTANTS.TIME_TURN_MS - (Date.now() - turnTimer.turnStartTime)) /
      1000,
    );
    if (timeleft <= 0) timeleft = 0;
  } else timeleft = 9;
  ctx.drawImage(clockImage, c.CANVAS.WIDTH - 160, 10, 150, 150);
  ctx.font = "bold 80px 'Russo One', sans-serif";
  ctx.fillStyle = "orange";
  ctx.fillText(timeleft, c.CANVAS.WIDTH - 160 + 30 + (timeleft <= 9 ? 24 : 0), 110);
  // }
}

function drawAOEtips(aoes) {
  ctx.lineWidth = 1;
  ctx.font = "bold 26px 'Russo One', sans-serif";
  //calculate width
  let maxLength = 0;
  for (let i = 0; i < aoes.length; i++) {
    if (ctx.measureText(aoes[i].name).width > maxLength) {
      maxLength = ctx.measureText(aoes[i].name).width;
    }
  }
  let width = maxLength + 10;

  //draw rectangle
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();
  if (ctx.roundRect)
    // ca bug firefox
    ctx.roundRect(
      layout.hexToPixel(hoverInfo.cell).x - width / 2,
      layout.hexToPixel(hoverInfo.cell).y - SIZE_PERSO - 30 - 30 * aoes.length,
      width,
      10 + 30 * aoes.length,
      20,
    );
  else
    ctx.fillRect(
      layout.hexToPixel(hoverInfo.cell).x - width / 2,
      layout.hexToPixel(hoverInfo.cell).y - SIZE_PERSO - 30 - 30 * aoes.length,
      width,
      10 + 30 * aoes.length,
      20,
    );

  ctx.stroke();
  ctx.fill();

  //write text
  ctx.fillStyle = "orange";

  for (let i = 0; i < aoes.length; i++) {
    if (aoes[i].dealSpell == "damage") ctx.fillStyle = "red";
    if (aoes[i].dealSpell == "root") ctx.fillStyle = "green";
    if (aoes[i].dealSpell == "silence") ctx.fillStyle = "blue";
    ctx.fillText(
      aoes[i].name,
      layout.hexToPixel(hoverInfo.cell).x - ctx.measureText(aoes[i].name).width / 2,
      layout.hexToPixel(hoverInfo.cell).y - SIZE_PERSO - 30 - 30 * i,
    );
  }
}

function drawHPBar(entity) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();
  if (ctx.roundRect)
    // ca bug firefox
    ctx.roundRect(
      layout.hexToPixel(hoverInfo.cell).x - 50,
      layout.hexToPixel(hoverInfo.cell).y - SIZE_PERSO,
      100,
      40,
      20,
    );
  else
    ctx.fillRect(
      layout.hexToPixel(hoverInfo.cell).x - 50,
      layout.hexToPixel(hoverInfo.cell).y - SIZE_PERSO,
      100,
      40,
    );

  ctx.stroke();
  ctx.fill();

  for (let i = 0; i < entity.maxHP; i++) {
    if (i < entity.currentHP) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
    } else {
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    }
    ctx.fillRect(
      layout.hexToPixel(hoverInfo.cell).x - 40 + i * 20,
      layout.hexToPixel(hoverInfo.cell).y - SIZE_PERSO + 10,
      20,
      20,
    );
    ctx.strokeRect(layout.hexToPixel(hoverInfo.cell).x - 40 + i * 20,
      layout.hexToPixel(hoverInfo.cell).y - SIZE_PERSO + 10,
      20,
      20);
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
      SIZE_GLYPH,
    );
    ctx.globalAlpha = 1;
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
  return layout.pixelToHex(new Point(eventX - canvasLeft, eventY - canvasTop));
}

function highlightGlyphs(entity) {
  let listCells = map.filter(
    (h) => h.aoe.length && h.aoe.some((eff) => eff.source?.entity == entity),
  );
}

module.exports = {
  drawMap,
  findHexFromEvent,
  loadImages,
  origin,
  layout,
  canvas,
  ctx,
};
