
import React, { useRef, useEffect } from 'react';
import c from '../../const';
import AssetManager from '../AssetManager';
import Anim from '../Anim'; // Ensure this path is correct based on structure

const THICKNESS = 1;
const SIZE_TILE = 144;

// Helper to access globals if they are not passed
// logic from drawing.js
const EffectsLayer = ({ width, height }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    // Projectile/Particle arrays are expected to be global as per existing architecture (Anim.js pushes to them)
    // If they are passed as props, use props. But Anim.js writes to global 'particles' and 'projectiles'.
    // We will reference window.particles / window.projectiles or access them from the scope if possible.
    // For safety, we check window.

    const getGlobals = () => {
        const parts = window.particles || [];
        const projs = window.projectiles || [];
        return { parts, projs };
    };

    const updateGlobals = (newParts, newProjs) => {
        if (window.particles) window.particles = newParts;
        if (window.projectiles) window.projectiles = newProjs;
    }

    const drawProjectiles = (ctx) => {
        const { projs } = getGlobals();
        if (!projs) return;

        projs.forEach((projectile) => {
            if ((projectile.glyphIcon || projectile.text) && projectile.moving) {

                // Logic from drawing.js drawProjectile
                let posProjectile = projectile.goal;

                // Move logic
                projectile.xDirection = projectile.goal.x - projectile.lastPos.x;
                projectile.yDirection = projectile.goal.y - projectile.lastPos.y;
                projectile.movingPos.x += projectile.xDirection / 10;
                projectile.movingPos.y += projectile.yDirection / 10;

                // Stop at goal check
                posProjectile = projectile.stopAtGoal
                    ? Anim.stopAtGoal(projectile)
                    : projectile.movingPos;

                if (projectile.type === "picture") {
                    // Draw Icon with shadow
                    // AssetManager check
                    // drawing.js uses ARRAY_ICONS global... we might need to access AssetManager directly
                    // or recreate ARRAY_ICONS map. 
                    // drawing.js initAssets -> ARRAY_ICONS keys are variable names...
                    // e.g. projectile.glyphIcon = 'banIcon'
                    // We'll trust the projectile object to have the image or we fetch from AssetManager if we can map it.
                    // Recreating simple map for now based on strings usually passed:
                    const img = AssetManager.getAsset(projectile.glyphIcon) || (window.ARRAY_ICONS ? window.ARRAY_ICONS[projectile.glyphIcon] : null);

                    if (img) {
                        ctx.save();
                        for (var x = -THICKNESS; x <= THICKNESS; x++) {
                            for (var y = -THICKNESS; y <= THICKNESS; y++) {
                                ctx.shadowColor = "black"; // Guessing shadow color logic from context
                                ctx.shadowOffsetX = x;
                                ctx.shadowOffsetY = y;
                                ctx.drawImage(
                                    img,
                                    posProjectile.x - SIZE_TILE / 2,
                                    posProjectile.y - SIZE_TILE / 2,
                                    SIZE_TILE,
                                    SIZE_TILE
                                );
                            }
                        }
                        ctx.restore();
                    }
                } else if (projectile.type === "text") {
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    ctx.font = "bold 48px serif";
                    ctx.fillStyle = "black";
                    ctx.fillText(projectile.text, posProjectile.x, posProjectile.y);
                    ctx.restore();
                }
            }
        });
    };

    const drawParticles = (ctx) => {
        let { parts } = getGlobals();
        if (!parts) return;

        parts.forEach((p) => {
            // Physics Update
            if (p.randomAppearance && Math.random() > 0.5) return;
            if (p.randomPos && p.randomx && p.randomy) {
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

            // Draw
            if (p.opacity < 0 || p.radius < 0) return;

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;

            if (p.shape === "circle") {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
                ctx.fill();
            } else if (p.shape === "rectangle") {
                ctx.beginPath();
                const rectX = p.randomPos && p.randomx ? p.randomx() : p.x - p.radius / 2;
                const rectY = p.randomPos && p.randomy ? p.randomy() : p.y - p.radius / 2;
                const dim = Math.random() * p.radius;

                if (p.fill) {
                    ctx.strokeRect(rectX, rectY, dim, dim);
                } else {
                    ctx.fillRect(rectX, rectY, dim, dim);
                }
                ctx.closePath();
                ctx.fill(); // fillStyle set above
            }
            ctx.restore();
        });

        // Cleanup dead particles
        const activeParts = parts.filter((p) => p.moving && p.opacity > 0 && p.radius > 0);
        updateGlobals(activeParts, window.projectiles); // Sync back to global
    };

    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw
        drawEntitiesOverlay(ctx); // Use placeholders if needed, but per request ONLY particles/projectiles
        drawParticles(ctx);
        drawProjectiles(ctx);

        requestRef.current = requestAnimationFrame(render);
    };

    // Helper placeholder to match signature if needed, but currently drawing.js just calls drawParticles/drawProjectiles
    const drawEntitiesOverlay = (ctx) => {
        // Intentionally empty logic for entities (moved to UnitLayer)
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={width || c.CANVAS.WIDTH}
            height={height || c.CANVAS.HEIGHT}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            }}
        />
    );
};

export default EffectsLayer;
