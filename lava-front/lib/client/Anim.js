const drawing = require("./drawing");

// Generates a random floating-point number within a specified range
const r = (a, b, c) =>
  parseFloat(
    (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
      c ? c : 0,
    ),
  );

module.exports = class Anim {
  // main thread
  static requestID;

  static mainLoop(og) {
    drawing.drawMap(og);
    if (!og.gameHasEnded) {
      Anim.requestID = requestAnimationFrame((time) => Anim.mainLoop(og));
    } else {
      cancelAnimationFrame(Anim.requestID);
    }
  }


  static move(entity, cell) {
    entity.lastPos = drawing.layout.hexToPixel(entity.pos);
    entity.movingPos = drawing.layout.hexToPixel(entity.pos);
    entity.goal = drawing.layout.hexToPixel(cell);
    entity.moving = true;

    setTimeout(() => {
      entity.moving = false;
    }, 1000);
  }
  static stopAtGoal(movingObject) {
    // Check if the entity or projectile has gone past the goal

    if (
      (movingObject.xDirection > 0 &&
        movingObject.movingPos.x > movingObject.goal.x) ||
      (movingObject.xDirection < 0 &&
        movingObject.movingPos.x < movingObject.goal.x)
    ) {
      movingObject.movingPos.x = movingObject.goal.x;
    }
    if (
      (movingObject.yDirection > 0 &&
        movingObject.movingPos.y > movingObject.goal.y) ||
      (movingObject.yDirection < 0 &&
        movingObject.movingPos.y < movingObject.goal.y)
    ) {
      movingObject.movingPos.y = movingObject.goal.y;
    }
    return movingObject.movingPos;
  }

  static launched(summoned, casterEntity, cell) {
    summoned.pos = casterEntity.pos;
    summoned.lastPos = drawing.layout.hexToPixel(casterEntity.pos);
    Anim.move(summoned, cell);
    summoned.pos = cell.copy();
  }
  static fall(spell, cell) {
    const projectile = {
      type: "picture",
      moving: true,
      glyphIcon: spell.glyphIcon,
      goal: drawing.layout.hexToPixel(cell),
      movingPos: { x: drawing.layout.hexToPixel(cell).x, y: 0 },
      lastPos: { x: drawing.layout.hexToPixel(cell).x, y: 0 },
      stopAtGoal: true,
    };
    projectiles.push(projectile);
    setTimeout(() => {
      projectile.moving = false;
    }, 700);
  }

  static textDamage(cell, text) {
    const coords = drawing.layout.hexToPixel(cell);
    const canvasHeight = document.getElementById("canvas").height;

    const projectile = {
      type: "text",
      moving: true,
      text: text,
      goal: { x: coords.x, y: coords.y + 0.065 * canvasHeight },
      movingPos: coords,
      lastPos: coords,
    };
    projectiles.push(projectile);
    setTimeout(() => {
      projectile.moving = false;
    }, 700);
  }

  static damageParticles(cell, text = "") {
    if (text) Anim.textDamage(cell, text);
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colors = ["#ffc000", "#ff3b3b", "#ff8400"];
    const bubbles = 25;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        x: coords.x,
        y: coords.y,
        radius: r(20, 30),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: r(0, 360, true),
        speed: r(8, 12),
        friction: 0.9,
        opacity: r(0, 0.5, true),
        opacitySpeed: -0.01,
        yVel: 0,
        gravity: 0.1,
        shape: "circle",
        moving: true,
      };
      setTimeout(() => {
        particle.moving = false;
      }, 700);
      particles.push(particle);
    }
  }

  static flashParticles(cell, text = "") {
    if (text) Anim.textDamage(cell, text);
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colors = ["#fff"];
    const bubbles = 20;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        x: coords.x,
        y: coords.y,
        radius: r(20, 30),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: r(0, 360, true),
        speed: r(12, 16),
        friction: 0.9,
        opacity: 1,
        opacitySpeed: -0.01,
        yVel: 0,
        gravity: 0,
        shape: "rectangle",
        moving: true,
      };
      setTimeout(() => {
        particle.moving = false;
      }, 700);
      particles.push(particle);
    }
  }

  static lavaParticles(cell) {
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colors = ["#FC791C", "#E34000", "#A62002", "#d3a625", "#821E00"];
    const bubbles = 30;
    const canvasHeight = document.getElementById("canvas").height;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        x: r(coords.x + 0.045 * canvasHeight, coords.x - 0.045 * canvasHeight),
        y: r(coords.y + 0.055 * canvasHeight, coords.y - 0.055 * canvasHeight),
        radius: r(15),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: r(0, 360, true),
        speed: r(0.1, 0.5),
        friction: 1,
        opacity: r(0.5, 1, true),
        opacitySpeed: -0.01,
        yVel: 0,
        gravity: -0.01,
        randomAppearance: false,
        shape: "circle",
        moving: true,
        randomPos: true,
        randomx: () =>
          r(coords.x + 0.045 * canvasHeight, coords.x - 0.045 * canvasHeight),
        randomy: () =>
          r(coords.y + 0.055 * canvasHeight, coords.y - 0.055 * canvasHeight),
      };
      setTimeout(() => {
        particle.moving = false;
      }, 700);
      particles.push(particle);
    }
  }
  static summonParticles(cell) {
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colors = ["#394053", "#4E4A59", "#6E6362", "#839073", "#7CAE7A"];
    const bubbles = 30;
    const canvasHeight = document.getElementById("canvas").height;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        x: r(coords.x + 0.045 * canvasHeight, coords.x - 0.045 * canvasHeight),
        y: r(coords.y + 0.055 * canvasHeight, coords.y - 0.055 * canvasHeight),
        radius: r(15, 30),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: r(0, 360, true),
        speed: r(0.1, 0.5),
        friction: 1,
        opacity: r(0.8, 1, true),
        opacitySpeed: -0.01,
        yVel: 0,
        gravity: 0,
        randomAppearance: false,
        shape: "rectangle",
        moving: true,
        randomPos: true,
        randomx: () =>
          r(coords.x + 0.055 * canvasHeight, coords.x - 0.055 * canvasHeight),
        randomy: () =>
          r(coords.y + 0.065 * canvasHeight, coords.y - 0.065 * canvasHeight),
      };
      setTimeout(() => {
        particle.moving = false;
      }, 700);
      particles.push(particle);
    }
  }
  static debuffParticles(cell, text, debuff) {
    if (text) Anim.textDamage(cell, text);
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colorsPM = ["#42612B", "#569629", "#59EB2D", "#9FFF6B", "#7DFF81"];
    const colorsPA = ["#65AFFF", "#335C81", "#274060", "#5899E2", "#1B2845"];
    const colors = debuff == "PM" ? colorsPM : colorsPA;
    const bubbles = 15;
    const canvasHeight = document.getElementById("canvas").height;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        x: r(coords.x + 0.045 * canvasHeight, coords.x - 0.045 * canvasHeight),
        y: r(coords.y + 0.035 * canvasHeight, coords.y - 0.055 * canvasHeight),
        radius: r(10),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: r(0, 360, true),
        speed: r(0.1, 0.5),
        friction: 1,
        opacity: r(0.5, 0.9, true),
        opacitySpeed: 0,
        yVel: 0,
        gravity: 0.05,
        randomAppearance: false,
        shape: "circle",
        moving: true,
        randomPos: false,
        randomx: () =>
          r(coords.x + 0.045 * canvasHeight, coords.x - 0.045 * canvasHeight),
        randomy: () =>
          r(coords.y + 0.055 * canvasHeight, coords.y - 0.055 * canvasHeight),
      };
      setTimeout(() => {
        particle.moving = false;
      }, 700);
      particles.push(particle);
    }
  }

  static shadowParticles(cell, text = "") {
    if (text) Anim.textDamage(cell, text);
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colors = ["#000000"];
    const bubbles = 30;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        x: coords.x,
        y: coords.y,
        radius: r(30, 40),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: r(0, 360, true),
        speed: r(12, 16),
        friction: 0.9,
        opacity: 1,
        opacitySpeed: -0.01,
        yVel: 0,
        gravity: 0,
        shape: "rectangle",
        moving: true,
      };
      setTimeout(() => {
        particle.moving = false;
      }, 700);
      particles.push(particle);
    }
  }

  static blueParticles(cell, text = "") {
    if (text) Anim.textDamage(cell, text);
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colors = ["#003366", "#006699", "#3399CC", "#66B2FF", "#99CCFF"]
    const bubbles = 30;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        x: coords.x,
        y: coords.y,
        radius: r(30, 40),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: r(0, 360, true),
        speed: r(12, 16),
        friction: 0.9,
        opacity: 1,
        opacitySpeed: -0.01,
        yVel: 0,
        gravity: 0,
        shape: "circle",
        moving: true,
      };
      setTimeout(() => {
        particle.moving = false;
      }, 700);
      particles.push(particle);
    }
  }
};
