class Anim {
  // static mainLoop() {
  //     drawMap();
  //     requestAnimationFrame(Anim.mainLoop);
  // }

  // main thread

  static mainLoop() {
    drawMap();
    requestAnimationFrame(Anim.mainLoop);
  }

  static move(entity, cell) {
    entity.lastPos = layout.hexToPixel(entity.pos);
    entity.movingPos = layout.hexToPixel(entity.pos); //entity.lastPos;
    entity.goal = layout.hexToPixel(cell);
    entity.moving = true;

    setTimeout(() => {
      entity.moving = false;
    }, 1000);
  }

  static projectile(summoned, casterEntity, cell) {
    summoned.pos = casterEntity.pos;
    summoned.lastPos = layout.hexToPixel(casterEntity.pos);
    Anim.move(summoned, cell);
    summoned.pos = cell.copy();
  }

  static splash(pos, text = "") {
    {
      // console.log('splash', entity, text)
      const coords = layout.hexToPixel(pos); // {x,y}
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
      const coords = layout.hexToPixel(pos); // {x,y}
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
      const coords = layout.hexToPixel(pos); // {x,y}
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
      const coords = layout.hexToPixel(pos); // {x,y}
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
      const coords = layout.hexToPixel(pos); // {x,y}
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
}
