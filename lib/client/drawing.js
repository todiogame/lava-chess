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
  canvas.height = window.innerHeight - 20;
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
helpCircleImage = new Image();
helpCircleImage.src = "pics/help.png";

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
waveIcon = new Image();
waveIcon.src = "pics/waveIcon.png";
etherealIcon = new Image();
etherealIcon.src = "pics/ethereal_icon.png";

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
let colorSpellPassive = "rgb(120,120,120, 0.3)"
let colorSpellSilenced = "rgb(120,0,120, 0.3)"
let colorSpellDisabled = "rgb(0,0,75, 0.3)"
let colorSpellEnemyTurn = "rgb(120, 120, 120, .6)";
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
  waveIcon: waveIcon,
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
    // console.log(p)
    for (let i = 0; i < p.spellsDisplay.length; i++) {
      const image = new Image();
      image.src = `./pics/spells/${p.id.toLowerCase()}_${i + 1}.png`;
      p.spells[i].image = image;
    }
    return p;
  })
  return entities
}

function loadImages(players) {
  players.map(p => {
    console.log(p)
    for (let i = 0; i < p.spells.length; i++) {
      const image = new Image();
      image.src = `./pics/spells/${p.entity.id.toLowerCase()}_${i + 1}.png`;
      p.spells[i].image = image;
    }
    return p;
  })
  return players
}

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
    ctx.shadowColor = color;
    ctx.shadowBlur = 1;
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

let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
let canvasTop = canvas.offsetTop + canvas.clientTop;

// Create our image
lava = new Image();
lava.src = "./pics/lavasmall.png";

function drawMap(og) {
  // console.log(og)

  layout = makeLayout(og.isPickPhase);

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

    if (hoverInfo.aoe?.length) {
      drawAOEtips(hoverInfo.aoe);
    }
    if (!og.isPickPhase && hoverInfo.entity?.maxHP) {
      drawHPBar(hoverInfo.entity);
    }

    if (hoverInfo.aoe || hoverInfo.entity || hoverInfo.element || hoverInfo.help) document.getElementById("canvas").style.cursor = 'pointer';
    else document.getElementById("canvas").style.cursor = 'auto';
  }

  if (!og.isPickPhase) drawClock();
  if (!og.isPickPhase) {
    drawHelpCircle();
    let usersNextPLayer = utils.findNextPlayer(og, TEAM);
    if (usersNextPLayer) drawSpells(og, buttonSpell1, usersNextPLayer, true) //bottom row

    let selectedEntity = og.entities.find(e => e.selected)
    let foundSelectedPlayer = utils.findPlayerFromEntity(selectedEntity, og);
    let selectedPlayer = foundSelectedPlayer ? foundSelectedPlayer : og.currentPlayer;
    if (selectedPlayer) drawSpells(og, buttonSpell2, selectedPlayer, false) //top left
  } else {
    //draw HUD presentation characters
    displayPickCharacterHUD(og)
  }
  drawNames(og)

  // // Add popup
  drawPopup(og);

}

function drawPopup(og) {
  if (og.popupTime > 0) {
    const opacity = Math.min(1, og.popupTime / og.popupDuration);
    og.popupTime -= 30;
    ctx.font = 'bold 100px Arial';
    // const popupWidth = 600;
    const popupHeight = 200;
    const popupWidth = ctx.measureText(og.popupContent).width + 20;
    // const popupHeight = ctx.measureText(og.popupContent).height + 20;
    const x = (c.CANVAS.WIDTH - popupWidth) / 2;
    const y = (c.CANVAS.HEIGHT - popupHeight) / 2;

    // Draw popup background
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
    ctx.fillRect(x, y, popupWidth, popupHeight);

    // Draw popup text
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(og.popupContent, c.CANVAS.WIDTH / 2, c.CANVAS.HEIGHT / 2);
  }

  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
}

function displayPickCharacterHUD(og) {
  // Draw background ctx.strokeStyle = "rgb(0, 0, 0)";
  // Draw picking team
  // console.log(og.pickOrBanIndex)
  let lineMyTeam = "You are TEAM " + TEAM.toUpperCase();
  let line = (og.currentTeamPicking == TEAM ? 'Your turn' : "Enemy's turn") + ' to ' +
    (og.pickOrBanIndex < c.CONSTANTS.PICK_BAN_ORDER.length ? c.CONSTANTS.PICK_BAN_ORDER[og.pickOrBanIndex] : '...');
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.lineWidth = 10;

  ctx.font = 'bold 40px "Russo One", sans-serif';
  let xx = (ctx.measureText(lineMyTeam).width)
  ctx.beginPath();
  ctx.fillRect(100, 20, xx + 20, 50);
  ctx.stroke();
  ctx.fill();

  xx = (ctx.measureText(line).width)
  ctx.beginPath();
  ctx.fillRect(100, 90, xx + 20, 50);
  ctx.stroke();
  ctx.fill();

  ctx.font = 'bold 40px "Russo One", sans-serif';
  ctx.fillStyle = TEAM;
  ctx.fillText(lineMyTeam, 110, 57);
  ctx.fillStyle = og.currentTeamPicking;
  ctx.fillText(line, 110, 127);

  // Draw character info
  let yTopPanel = 190

  let currentEntity = og.entities.find((e) => e.selected);
  if (!currentEntity) currentEntity = og.entities.find((e) => e.hovered);
  if (currentEntity) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.fillRect(20, yTopPanel - 30, 550, 730);
    ctx.fill();
    //picture
    drawPlayingEntityTopLeft(currentEntity, 30, yTopPanel, 160);
    // Draw character name
    ctx.font = 'bold 36px "Russo One", sans-serif';
    ctx.fillStyle = '#ff6600';
    ctx.fillText(currentEntity.name, 210, yTopPanel + 40);

    // Draw character title
    ctx.font = '24px "Russo One", sans-serif';
    ctx.fillStyle = '#ff6600';
    ctx.fillText(currentEntity.title, 210, yTopPanel + 90);

    // Draw character difficulty stars
    ctx.fillStyle = '#ff6600';
    ctx.fillText('Difficulty: ' + displayStars(currentEntity.difficulty), 210, yTopPanel + 140);

    // Draw character description
    ctx.font = "20px 'Russo One', sans-serif";
    ctx.fillStyle = '#ffc107';
    // ctx.fillText(currentEntity.description, 20, 220);

    let descriptionArr = [currentEntity.description]
    let n = 1;
    while (descriptionArr.some(line => ctx.measureText(line).width > 550 - 20)) {
      n++
      descriptionArr = text.format(currentEntity.description, n)
    }
    // console.log("split text in ", n)

    descriptionArr.forEach((line, i) => {
      ctx.fillText(line, 20 + 10, yTopPanel + 190 + 30 * i);
    })
    let xSpells = 20 + 100 + 10;
    // Draw spells
    for (let i = 0; i < currentEntity.spellsDisplay.length; i++) {
      let spell = currentEntity.spellsDisplay[i];
      if (spell) {
        //Draw spell image
        let spellImage = spell.image;
        if (!spellImage || !spellImage.naturalWidth || !spellImage.naturalHeight) {
          spellImage = placeholderSpell;
        }
        ctx.drawImage(spellImage, 20, yTopPanel + 330 + i * 120, 100, 100);
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 5;
        ctx.strokeRect(20, yTopPanel + 330 + i * 120, 100, 100);
        // Draw spell name and cooldown
        ctx.font = 'bold 22px "Russo One", sans-serif';
        ctx.fillStyle = '#ff6600';
        ctx.fillText(
          spell.name + (spell.cooldown ? ' (CD: ' + spell.cooldown + ')' : ''),
          xSpells,
          yTopPanel + 345 + i * 120
        );

        // Draw spell description
        ctx.font = '20px "Russo One", sans-serif';
        ctx.fillStyle = '#ffc107';
        // ctx.fillText(spell.description, 20, 430 + i * 60);
        let descriptionArr = [spell.description]
        let n = 1;
        while (descriptionArr.some(line => ctx.measureText(line).width > 550 - 20 - 100)) {
          n++
          descriptionArr = text.format(spell.description, n)
        }
        // console.log("split text in ", n)
        if (n == 1) descriptionArr.unshift("")
        descriptionArr.forEach((line, j) => {
          ctx.fillText(
            line,
            xSpells + 10,
            yTopPanel + 370 + i * 120 + 25 * j,
          );
        })
      }
    }
  }
}

function displayStars(num) {
  let stars = '';
  for (let i = 0; i < num; i++) {
    stars += '⭐️';
  }
  return stars;
}

function drawNames(og) {

  //draw rectangle
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.lineWidth = 10;
  ctx.font = "bold 26px 'Russo One', sans-serif";
  let meText = storedData ? "[" + storedData.level + "] " + storedData.username + " - " + Math.floor(storedData.elo) : "You"
  let enemyText = enemy.userInfo ? "[" + enemy.userInfo.level + "] " + enemy.userInfo.username + " - " + Math.floor(enemy.userInfo.elo) : "Enemy"

  const divWidth = Math.max(ctx.measureText(meText).width, ctx.measureText(enemyText).width)
  // + 20;
  const divHeight = 100;
  ctx.beginPath();
  ctx.fillRect(c.CANVAS.WIDTH - 330, 10, divWidth, divHeight);
  ctx.stroke();
  ctx.fill();

  ctx.fillStyle = TEAM;
  ctx.fillText(meText, c.CANVAS.WIDTH - 330 + 15, 40);

  ctx.fillStyle = TEAM == c.CONSTANTS.TEAM_BLUE ? c.CONSTANTS.TEAM_RED : c.CONSTANTS.TEAM_BLUE;
  ctx.fillText(enemyText, c.CANVAS.WIDTH - 330 + 15, 90);
}

function drawHelpCircle() {
  ctx.globalAlpha = 0.5;
  ctx.drawImage(helpCircleImage, c.CANVAS.WIDTH - 330, 110, 150, 150);
  ctx.globalAlpha = 1;
}

function drawPlayingEntityTopLeft(entity, x, y, size) {
  ctx.drawImage(lava, x, y, size, size,);
  ctx.drawImage(entity.image, x, y, size, size,);

  ctx.strokeStyle = entity.team ? entity.team : "orange";
  ctx.lineWidth = 10;
  ctx.strokeRect(x, y, size, size);
}

function drawSpells(og, buttonSpell, player, bottomRow,) {
  let x = buttonSpell.w_offset;
  let y = buttonSpell.h_offset - buttonSpell.height;

  if (bottomRow || player != og.currentPlayer || player.entity.team != TEAM) { //dont draw top row spells if we are playing
    //draw move button
    x = buttonSpell.w_offset;
    y = buttonSpell.h_offset - buttonSpell.height;
    ctx.drawImage(move, x, y, buttonSpell.width, buttonSpell.height);
    ctx.strokeStyle = (player.entity.team == TEAM) ? buttonSpell.borderColor : buttonSpell.borderColorEnemyTurn;
    ctx.lineWidth = buttonSpell.borderWidth;
    ctx.strokeRect(x, y, buttonSpell.width, buttonSpell.height);

    if (player.movePoint <= 0) {
      ctx.fillStyle = colorSpellDisabled;
      ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
    }
    //color move if unavailable
    if (bottomRow && player != og.currentPlayer) {
      ctx.fillStyle = colorSpellEnemyTurn;
      ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
    }
    //write move points
    ctx.font = "bold 36px 'Russo One', sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText(
      player.movePoint,
      x + (buttonSpell.width) - 28,
      y + 32 ,
    );
    //draw spell buttons
    for (let i = 0; i < player.spells.length; i++) {
      x = buttonSpell.w_offset + (i + 1) * (buttonSpell.width + 10);

      let spellImage = player.spells[i].image;
      if (!spellImage || !spellImage.naturalWidth || !spellImage.naturalHeight) {
        spellImage = placeholderSpell;
      }
      ctx.drawImage(spellImage, x, y, buttonSpell.width, buttonSpell.height);

      ctx.strokeStyle = (player.entity.team == TEAM) ? buttonSpell.borderColor : buttonSpell.borderColorEnemyTurn;
      ctx.lineWidth = buttonSpell.borderWidth;
      ctx.strokeRect(x, y, buttonSpell.width, buttonSpell.height);
      //color spell if unavailable
      if (bottomRow && player != og.currentPlayer) {
        ctx.fillStyle = colorSpellEnemyTurn;
        ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
      }
      //grey out passive
      if (player.spells[i].passive) {
        ctx.fillStyle = colorSpellPassive;
        ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
        //grey out silence
      } else if (player.entity.auras.length && player.entity.auras.some(a => a.name == "silence")) {
        ctx.drawImage(silenceIcon, x, y, buttonSpell.width, buttonSpell.height);
        ctx.fillStyle = colorSpellSilenced;
        ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
        //grey out cd
      } else if (player.spells[i].currentCD > 0) {
        ctx.drawImage(cooldown, x, y, buttonSpell.width, buttonSpell.height);
        ctx.fillStyle = colorSpellDisabled;
        ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
        //write current CD
        ctx.font = "bold " + parseInt(buttonSpell.height / 2 + 20) + "px 'Russo One', sans-serif";
        ctx.fillStyle = "white";
        ctx.fillText(
          player.spells[i].currentCD,
          x + buttonSpell.width / 3 + 2, y + buttonSpell.height / 2 + 20,
        );
      }

    }
  } else { //toprow, current player belongs to user : write YOUR TURN
    //draw rectangle
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 10;

    x = buttonSpell.w_offset;
    y = buttonSpell.h_offset - buttonSpell.height;
    ctx.beginPath();
    ctx.fillRect(
      x,
      y,
      SIZE_PERSO * 2,
      60,
    );
    ctx.stroke();
    ctx.fill();

    ctx.font = "bold 26px 'Russo One', sans-serif";
    ctx.fillStyle = TEAM;
    ctx.fillText(
      "YOUR TURN",
      x + 40,
      y + 40 ,
    );
  }
  if (bottomRow) {
    //draw rise lava and pass buttons
    x = c.CANVAS.WIDTH * 7 / 10
    if (og.currentPlayer.isSummoned)
      ctx.drawImage(pass, x, y, buttonSpell.width, buttonSpell.height);
    else
      ctx.drawImage(lavapass, x, y, buttonSpell.width, buttonSpell.height);
    ctx.strokeStyle = (og.currentPlayer.entity.team == TEAM) ? buttonSpell.borderColor : buttonSpell.borderColorEnemyTurn;
    ctx.lineWidth = buttonSpell.borderWidth;
    ctx.strokeRect(x, y, buttonSpell.width, buttonSpell.height);
    //color spell if unavailable
    if (player != og.currentPlayer) {
      ctx.fillStyle = colorSpellEnemyTurn;
      ctx.fillRect(x, y, buttonSpell.width, buttonSpell.height);
    }

    //draw tooltips
    if (hoverInfo.element) {
      //draw rectangle
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 10;

      x = buttonSpell1.w_offset - (buttonSpell1.width) - 10 + 110;
      y = buttonSpell1.h_offset - buttonSpell1.height * 2 - 10;
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
      //write cooldown in description
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
      // console.log("split text in ", n)

      descriptionArr.forEach((line, i) => {
        ctx.fillText(
          line,
          x + 10,
          y + 25 + 30 * i,
        );
      })
    } else drawPlayingEntityTopLeft(player.entity, buttonSpell.w_offset, buttonSpell.h_offset - buttonSpell.height - 130, SIZE_PERSO * (bottomRow ? 1 : 2));
  } else {
    drawPlayingEntityTopLeft(player.entity, buttonSpell.w_offset, 50, SIZE_PERSO * (bottomRow ? 1 : 2));
  }


}

function drawClock() {
  let timeleft;
  if (og.turnTimer.turnStartTime) {
    timeleft = Math.ceil(
      (c.CONSTANTS.TIME_TURN_MS - (Date.now() - og.turnTimer.turnStartTime)) /
      1000,
    );
    if (timeleft <= 0) timeleft = 0;
  } else timeleft = 9;
  ctx.drawImage(clockImage, c.CANVAS.WIDTH - 160, 110, 150, 150);
  ctx.font = "bold 80px 'Russo One', sans-serif";
  ctx.fillStyle = "orange";
  ctx.fillText(timeleft, c.CANVAS.WIDTH - 160 + 30 + (timeleft <= 9 ? 24 : 0), 210);
  // }
}

function drawAOEtips(aoes) {
  //draw bottom right
  //draw rectangle
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.lineWidth = 10;

  let posx = x = c.CANVAS.WIDTH * 7 / 10;
  let posy = buttonSpell1.h_offset - buttonSpell1.height - 20 - aoes.length * 60 - 10;
  ctx.beginPath();
  ctx.fillRect(
    posx,
    posy,
    430,
    20 + aoes.length * 60,
    20,
  );
  ctx.stroke();
  ctx.fill();
  //write spell effect picture and name
  ctx.font = "bold 40px 'Russo One', sans-serif";
  for (let i = 0; i < aoes.length; i++) {
    ctx.fillStyle = "orange";
    if (aoes[i].dealSpell == "damage") ctx.fillStyle = "red";
    if (aoes[i].dealSpell == "root") ctx.fillStyle = "green";
    if (aoes[i].dealSpell == "silence") ctx.fillStyle = "blue";
    if (aoes[i].image) {
      ctx.drawImage(
        aoes[i].image,
        posx + 20,
        posy + 10 + 60 * i,
        50, 50);
    }
    ctx.fillText(
      aoes[i].name,
      posx + 60 + 20,
      posy + 50 + 60 * i,
    );
  }
}

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
  ctx.fillStyle = color;
  ctx.fill();
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
};
