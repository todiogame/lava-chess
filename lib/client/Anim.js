const drawing = require("./drawing")
const {Point, Hex, Layout} = require("../Hex");
module.exports = class Anim {
    // static mainLoop() {
    //     drawMap();
    //     requestAnimationFrame(Anim.mainLoop);
    // }

// main thread

static mainLoop() {
    drawing.drawMap()
    requestAnimationFrame(Anim.mainLoop);
}

// mainLoop();


    static animateMove(entity, toCell, duration) {
        if (!duration) duration = 5000;

        const fromP = layout.hexToPixel(entity.pos);
        const toP = layout.hexToPixel(toCell)
        Anim.animateImage(entity, fromP.x, fromP.y, toP.x, toP.y, duration)
    }
    // Parameters:
    // - image: the image object to animate
    // - startX: the starting x position of the image
    // - startY: the starting y position of the image
    // - targetX: the target x position of the image
    // - targetY: the target y position of the image
    // - duration: the duration of the animation in milliseconds
    // - canvas: the canvas to draw the image on
    static animateImage(entity, startX, startY, targetX, targetY, duration) {
        let intervalId;
        let image = entity.image;
        let startTime = Date.now();
        let endTime = startTime + duration;
        let currentX = startX;
        let currentY = startY;

        function update() {
            let time = Date.now();
            if (time >= endTime) {
                currentX = targetX;
                currentY = targetY;
                entity.hide = false;
                clearInterval(intervalId);
            } else {
                entity.hide = true;
                let progress = (time - startTime) / duration;
                currentX = startX + (targetX - startX) * progress;
                currentY = startY + (targetY - startY) * progress;
            }
            drawMap()
            ctx.drawImage(image, currentX - SIZE_PERSO / 2, currentY - SIZE_PERSO / 2, SIZE_PERSO, SIZE_PERSO);
        }
        intervalId = setInterval(update, 16);
    }

    static splash(pos, text) {
        {
            // console.log('splash', entity, text)
            const coords = layout.hexToPixel(pos); // {x,y}
            const colors = ['#ffc000', '#ff3b3b', '#ff8400'];
            const bubbles = 25;
    
            const explode = (x, y, text) => {
                let particles = [];
                let ratio = window.devicePixelRatio;
                let c = document.createElement('canvas');
                let ctx = c.getContext('2d');
    
                c.style.position = 'absolute';
                c.style.left = x - 100 + 'px';
                c.style.top = y - 100 + 'px';
                c.style.pointerEvents = 'none';
                c.style.width = 200 + 'px';
                c.style.height = 200 + 'px';
                c.style.zIndex = 100;
                c.width = 200 * ratio;
                c.height = 200 * ratio;
                c.style.zIndex = "9999999"
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
                        gravity: 0.1
                    });
    
                }
    
                render(particles, ctx, c.width, c.height, text);
                setTimeout(() => document.body.removeChild(c), 1000);
            };
    
            const render = (particles, ctx, width, height, text) => {
                requestAnimationFrame(() => render(particles, ctx, width, height, text));
                ctx.clearRect(0, 0, width, height);
                ctx.globalAlpha = 1.0;
                ctx.font = 'bold 48px serif';
                ctx.fillStyle = 'black';
                ctx.fillText(text, width / 4, ctx.textY);
                ctx.textY += height / 100;
                particles.forEach((p, i) => {
                    p.x += p.speed * Math.cos(p.rotation * Math.PI / 180);
                    p.y += p.speed * Math.sin(p.rotation * Math.PI / 180);
    
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
    
            const r = (a, b, c) => parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0));
            explode(coords.x, coords.y, text);
        }
    }
}

