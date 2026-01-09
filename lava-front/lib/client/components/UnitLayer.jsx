
import React from 'react';
import c from '../../const';

const SIZE_PERSO = 120;

const UnitLayer = ({ entities, layout, isPickPhase }) => {
    return (
        <div className="unit-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {entities.map((unit) => {
                // Calculate Position
                const pixel = layout.hexToPixel(unit.pos);
                // Offset logic from drawing.js: pPerso.x - SIZE_PERSO / 2, pPerso.y - (SIZE_PERSO * 3) / 4
                const x = pixel.x - SIZE_PERSO / 2;
                const y = pixel.y - (SIZE_PERSO * 3) / 4;

                // Z-Index based on row (lower row = higher z-index usually in iso, or just higher Y = higher Z)
                // drawing.js sorts by pos.r. Let's replicate this simply via zIndex.
                // Assuming r increases downwards? No, hex coords are tricky. 
                // drawing.js implementation: og.entities.sort((a, b) => a.pos.r - b.pos.r);
                // This implies raw 'r' determines draw order.
                const zIndex = unit.pos.r + 50; // offset to avoid negative z-index

                // Animations for movement
                // entity.moving is true during move logic in game, but for React we just want to target the 'pos'.
                // We rely on CSS transition to interpolate.

                // Ethereal check
                const isEthereal = unit.isEthereal && unit.isEthereal();
                const opacity = isEthereal ? 0.5 : 1;

                // Image Src
                // drawing.js uses preloaded Image objects. taking .src from them.
                const imgSrc = unit.image ? unit.image.src : `pics/${unit.id.toLowerCase()}.webp`;

                // Outline / Shadows
                // drawing.js uses ctx.shadowColor. We can use drop-shadow filter.
                let filter = "";
                if (unit.isPlaying || (isPickPhase && unit.selected)) {
                    const color = (isPickPhase || unit.team === c.CONSTANTS.TEAM_BLUE) ? "white" : "black"; // Example logic
                    filter = `drop-shadow(0 0 5px ${color})`;
                } else if (unit.hovered) {
                    filter = `drop-shadow(0 0 3px white)`;
                } else if (unit.team) {
                    // Basic team outline if needed, or rely on base image
                    // drawing.js: "drawWithOutline(entity.team, THICKNESS)"
                    filter = `drop-shadow(0 0 2px ${unit.team})`;
                }

                const uniqueKey = `${unit.id}_${unit.pos.q}_${unit.pos.r}_${unit.pos.s}`;

                return (
                    <div
                        key={uniqueKey} // Fixed duplicate key issue for "wall" or "totem" using position
                        className="unit-container"
                        style={{
                            position: 'absolute',
                            transform: `translate(${x}px, ${y}px)`,
                            width: SIZE_PERSO,
                            height: SIZE_PERSO,
                            zIndex: zIndex,
                            transition: 'transform 0.3s ease-out', // The core requested requirement
                            opacity: opacity,
                            filter: filter,
                            pointerEvents: 'none' // Crucial: allow clicks to pass through to HexGrid
                        }}
                    >
                        {/* Unit Image */}
                        <img
                            src={imgSrc}
                            alt={unit.id}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />

                        {/* Shield/Armor */}
                        {unit.armor && (
                            <div style={{
                                position: 'absolute',
                                top: '25%', left: '0', width: '100%', height: '50%', // approximate
                                borderRadius: '50%',
                                border: `2px solid ${unit.armorColor || 'orange'}`,
                                backgroundColor: 'rgba(255, 100, 0, 0.3)',
                                pointerEvents: 'none'
                            }} />
                        )}

                        {/* HP Bar */}
                        {(!isPickPhase && unit.maxHP) && (
                            <HPBar unit={unit} />
                        )}

                        {/* Ethereal Icon Overlay */}
                        {isEthereal && (
                            <img src="pics/ethereal_icon.webp" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.8 }} />
                        )}

                    </div>
                );
            })}
        </div>
    );
};

// Sub-component for HP Bar
const HPBar = ({ unit }) => {
    // Logic from drawHPBar
    // 20px per HP chunk?
    const hpWidth = 20;
    const padding = 10;
    const totalWidth = unit.maxHP * hpWidth + padding;

    // Centering HP bar above unit
    // drawing.js: y - SIZE_PERSO (which is roughly top of unit) + offsets
    const topOffset = -40;

    return (
        <div style={{
            position: 'absolute',
            top: `${topOffset}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '5px',
            borderRadius: '10px',
            border: `2px solid ${unit.team}`,
            whiteSpace: 'nowrap'
        }}>
            {Array.from({ length: unit.maxHP }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: '15px',
                        height: '15px',
                        margin: '0 2px',
                        backgroundColor: i < unit.currentHP ? "rgba(0, 255, 0, 0.8)" : "rgba(255, 0, 0, 0.8)",
                        border: '1px solid black'
                    }}
                />
            ))}
            {/* Order Indicator */}
            {(unit.currentOrder !== undefined && unit.currentOrder !== null) && (
                <div style={{
                    position: 'absolute',
                    left: '-25px',
                    top: '5px',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 0 #000'
                }}>
                    {unit.currentOrder === 0 ? '⭐️' : unit.currentOrder}
                </div>
            )}
        </div>
    );
};

export default UnitLayer;
