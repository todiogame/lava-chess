class Anim {
    // static mainLoop() {
    //     drawMap();
    //     requestAnimationFrame(Anim.mainLoop);
    // }

// main thread

static mainLoop() {
    drawMap()
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
}