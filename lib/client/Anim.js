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

  static mainLoop() {
    drawing.drawMap();
    requestAnimationFrame(Anim.mainLoop);
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
        xOrigin: coords.x,
        yOrigin: coords.y,
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
  static lavaParticles(cell) {
    const coords = drawing.layout.hexToPixel(cell); // {x,y}
    const colors = ["#FC791C", "#E34000", "#A62002", "#d3a625", "#821E00"];
    const bubbles = 30;
    const canvasHeight = document.getElementById("canvas").height;
    for (var i = 0; i < bubbles; i++) {
      let particle = {
        xOrigin: coords.x,
        yOrigin: coords.y,
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
        xOrigin: coords.x,
        yOrigin: coords.y,
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
        xOrigin: coords.x,
        yOrigin: coords.y,
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

  static splash(pos, text = "") {
    {
      // console.log('splash', entity, text)
      const coords = drawing.layout.hexToPixel(pos); // {x,y}
      const colors = ["#ffc000", "#ff3b3b", "#ff8400"];
      const bubbles = 25;

      const explode = (x, y, text) => {
        let particles = [];
        let c = document.createElement("canvas");
        let ctx = c.getContext("2d");

        c.style.position = "absolute";
        c.style.left = x - 100 + "px";
        c.style.top = y - 100 + "px";
        c.style.pointerEvents = "none";
        c.style.width = 200 + "px";
        c.style.height = 200 + "px";
        c.style.zIndex = 100;
        c.width = 200;
        c.height = 200;
        c.style.zIndex = "9999999";
        ctx.textY = c.height / 2;
        document.body.appendChild(c);

        for (var i = 0; i < bubbles; i++) {
          particles.push({
            x: c.width / 2,
            y: c.height / 2,
            radius: r(20, 30),
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: r(0, 360, true),
            speed: r(8, 12),
            friction: 0.9,
            opacity: r(0, 0.5, true),
            yVel: 0,
            gravity: 0.1,
          });
        }

        render(particles, ctx, c.width, c.height, text);
        setTimeout(() => document.body.removeChild(c), 1000);
      };

      const render = (particles, ctx, width, height, text) => {
        requestAnimationFrame(() =>
          render(particles, ctx, width, height, text),
        );
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
        ctx.font = "bold 48px serif";
        ctx.fillStyle = "black";
        ctx.fillText(text, width / 4, ctx.textY);
        ctx.textY += height / 100;
        particles.forEach((p, i) => {
          p.x += p.speed * Math.cos((p.rotation * Math.PI) / 180);
          p.y += p.speed * Math.sin((p.rotation * Math.PI) / 180);

          p.opacity -= 0.01;
          p.speed *= p.friction;
          p.radius *= p.friction;
          p.yVel += p.gravity;
          p.y += p.yVel;

          if (p.opacity < 0 || p.radius < 0) return;

          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
          ctx.fill();
        });

        return ctx;
      };

      const r = (a, b, c) =>
        parseFloat(
          (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
            c ? c : 0,
          ),
        );
      explode(coords.x, coords.y, text);
    }
  }

  static splash_invo(pos) {
    {
      const coords = drawing.layout.hexToPixel(pos); // {x,y}
      const colors = ["#394053", "#4E4A59", "#6E6362", "#839073", "#7CAE7A"];
      const bubbles = 50;

      const explode = (x, y) => {
        let particles = [];
        let c = document.createElement("canvas");
        let ctx = c.getContext("2d");

        c.style.position = "absolute";
        c.style.left = x - 100 + "px";
        c.style.top = y - 100 + "px";
        c.style.pointerEvents = "none";
        c.style.width = 200 + "px";
        c.style.height = 200 + "px";
        c.style.zIndex = 100;
        c.width = 200;
        c.height = 200;
        c.style.zIndex = "9999999";
        let startY = (c.height * 6) / 10;
        ctx.textY = startY;
        document.body.appendChild(c);

        for (var i = 0; i < bubbles; i++) {
          particles.push({
            x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
            y: r(startY * 0.9, startY * 1.2),
            radius: r(20, 40),
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: r(2, 3),
            opacity: r(0.5, 1, true),
          });
        }

        render(particles, ctx, c.width, c.height);
        setTimeout(() => document.body.removeChild(c), 1000);
      };

      const render = (particles, ctx, width, height) => {
        requestAnimationFrame(() => render(particles, ctx, width, height));
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, i) => {
          var x = p.x;
          var y = p.y;
          var width = p.radius;
          var height = p.radius;

          p.y -= p.speed;
          //p.x += p.speed * Math.sin(p.rotation * Math.PI / 180);

          p.opacity -= 0.01;

          if (p.opacity < 0 || p.radius < 0) return;

          ctx.save();
          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          var topCurveHeight = height * 0.3;
          ctx.moveTo(x, y + topCurveHeight);

          ctx.beginPath();
          ctx.strokeRect(r(50, 140), r(50, 140), r(1, 20), r(1, 20));

          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        });

        return ctx;
      };

      const r = (a, b, c) =>
        parseFloat(
          (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
            c ? c : 0,
          ),
        );
      explode(coords.x, coords.y);
    }
  }
  static splash_flash(pos) {
    {
      const coords = drawing.layout.hexToPixel(pos); // {x,y}
      const colors = ["#fff"];
      const bubbles = 20;

      const explode = (x, y) => {
        let particles = [];
        let c = document.createElement("canvas");
        let ctx = c.getContext("2d");

        c.style.position = "absolute";
        c.style.left = x - 100 + "px";
        c.style.top = y - 100 + "px";
        c.style.pointerEvents = "none";
        c.style.width = 200 + "px";
        c.style.height = 200 + "px";
        c.style.zIndex = 100;
        c.width = 200;
        c.height = 200;
        c.style.zIndex = "9999999";
        let startY = (c.height * 6) / 10;
        ctx.textY = startY;
        document.body.appendChild(c);

        for (var i = 0; i < bubbles; i++) {
          particles.push({
            x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
            y: r(startY * 0.9, startY * 1.2),
            radius: r(20, 40),
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: r(2, 3),
            opacity: r(0.5, 1, true),
          });
        }

        render(particles, ctx, c.width, c.height);
        setTimeout(() => document.body.removeChild(c), 1000);
      };

      const render = (particles, ctx, width, height) => {
        requestAnimationFrame(() => render(particles, ctx, width, height));
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, i) => {
          var x = p.x;
          var y = p.y;
          var width = p.radius;
          var height = p.radius;

          p.y -= p.speed;
          //p.x += p.speed * Math.sin(p.rotation * Math.PI / 180);

          p.opacity -= 0.01;

          if (p.opacity < 0 || p.radius < 0) return;

          ctx.save();
          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          var topCurveHeight = height * 0.3;
          ctx.moveTo(x, y + topCurveHeight);

          ctx.beginPath();
          ctx.strokeRect(r(60, 140), r(50, 140), r(1, 6), r(1, 6));

          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        });

        return ctx;
      };

      const r = (a, b, c) =>
        parseFloat(
          (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
            c ? c : 0,
          ),
        );
      explode(coords.x, coords.y);
    }
  }

  static splash_debuff(pos, text, debuff) {
    {
      const coords = drawing.layout.hexToPixel(pos); // {x,y}
      const colorsPM = ["#42612B", "#569629", "#59EB2D", "#9FFF6B", "#7DFF81"];
      const colorsPA = ["#65AFFF", "#335C81", "#274060", "#5899E2", "#1B2845"];
      const colors = debuff == "PM" ? colorsPM : colorsPA;
      const bubbles = 10;

      const explode = (x, y, text) => {
        let particles = [];
        let c = document.createElement("canvas");
        let ctx = c.getContext("2d");

        c.style.position = "absolute";
        c.style.left = x - 100 + "px";
        c.style.top = y - 100 + "px";
        c.style.pointerEvents = "none";
        c.style.width = 200 + "px";
        c.style.height = 200 + "px";
        c.style.zIndex = 100;
        c.width = 200;
        c.height = 200;
        c.style.zIndex = "9999999";
        let startY = (c.height * 6) / 10;
        ctx.textY = startY;
        document.body.appendChild(c);

        for (var i = 0; i < bubbles; i++) {
          particles.push({
            x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
            y: r(startY * 0.9, startY * 1.2),
            radius: r(20, 40),
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: r(2, 3),
            opacity: r(0.5, 1, true),
          });
        }

        render(particles, ctx, c.width, c.height, text);
        setTimeout(() => document.body.removeChild(c), 1000);
      };

      const render = (particles, ctx, width, height, text) => {
        requestAnimationFrame(() =>
          render(particles, ctx, width, height, text),
        );
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
        ctx.font = "bold 30px serif";
        ctx.fillStyle = "#273919";
        ctx.fillText(text, width / 4, ctx.textY);
        ctx.textY -= height / 100;
        particles.forEach((p, i) => {
          var x = p.x;
          var y = p.y;
          var width = p.radius;
          var height = p.radius;

          p.y -= p.speed;
          //p.x += p.speed * Math.sin(p.rotation * Math.PI / 180);

          p.opacity -= 0.01;

          if (p.opacity < 0 || p.radius < 0) return;

          ctx.save();
          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          var topCurveHeight = height * 0.3;
          ctx.moveTo(x, y + topCurveHeight);

          ctx.beginPath();

          ctx.arc(r(60, 140), r(85, 125), r(3, 10), 0, 2 * Math.PI);

          ctx.stroke();
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        });

        return ctx;
      };

      const r = (a, b, c) =>
        parseFloat(
          (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
            c ? c : 0,
          ),
        );
      explode(coords.x, coords.y, text);
    }
  }
  static splash_lava(pos, text = "") {
    {
      const coords = drawing.layout.hexToPixel(pos); // {x,y}
      const colors = ["#FC791C", "#E34000", "#A62002", "#d3a625", "#821E00"];
      const bubbles = 20;

      const explode = (x, y, text) => {
        let particles = [];
        let c = document.createElement("canvas");
        let ctx = c.getContext("2d");

        c.style.position = "absolute";
        c.style.left = x - 100 + "px";
        c.style.top = y - 100 + "px";
        c.style.pointerEvents = "none";
        c.style.width = 200 + "px";
        c.style.height = 200 + "px";
        c.style.zIndex = 100;
        c.width = 200;
        c.height = 200;
        c.style.zIndex = "9999999";
        let startY = (c.height * 6) / 10;
        ctx.textY = startY;
        document.body.appendChild(c);

        for (var i = 0; i < bubbles; i++) {
          particles.push({
            x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
            y: r(startY * 0.9, startY * 1.2),
            radius: r(20, 40),
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: r(2, 3),
            opacity: r(0.5, 1, true),
          });
        }

        render(particles, ctx, c.width, c.height, text);
        setTimeout(() => document.body.removeChild(c), 1000);
      };

      const render = (particles, ctx, width, height, text) => {
        requestAnimationFrame(() =>
          render(particles, ctx, width, height, text),
        );
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
        ctx.font = "bold 35px serif";
        ctx.fillStyle = "black";
        ctx.fillText(text, width / 4, ctx.textY);
        ctx.textY -= height / 100;
        particles.forEach((p, i) => {
          var x = p.x;
          var y = p.y;
          var width = p.radius;
          var height = p.radius;

          p.y -= p.speed;

          p.opacity -= 0.01;

          if (p.opacity < 0 || p.radius < 0) return;

          ctx.save();
          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          var topCurveHeight = height * 0.3;
          ctx.moveTo(x, y + topCurveHeight);

          ctx.beginPath();

          ctx.arc(r(80, 120), r(25, 125), r(3, 10), 0, 2 * Math.PI);

          ctx.stroke();
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        });

        return ctx;
      };

      const r = (a, b, c) =>
        parseFloat(
          (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
            c ? c : 0,
          ),
        );
      explode(coords.x, coords.y, text);
    }
  }
};
