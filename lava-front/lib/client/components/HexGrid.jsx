
import React, { useMemo } from 'react';
import { Layout } from '../../Hex';
import c from '../../const';
import AssetManager from '../AssetManager';

// Constants for colors (ported from drawing.js)
const COLORS = {
    MOVE_HOVER: "rgba(30, 75, 0, 0.5)",
    MOVE_RANGE: "rgba(30, 205, 0, 0.5)",
    SPELL_HOVER: "rgba(255, 0, 0, 0.5)",
    SPELL_RANGE: "rgba(255, 100, 100, 0.4)",
    SPELL_HIT: "rgba(255, 50, 50, 0.5)",
    SPAWN_BLUE: "rgba(0,200,200, 0.2)",
    SPAWN_RED: "rgba(255, 0, 0, 0.2)",
    SPAWN_BLUE_ACTIVE: "rgba(0,200,200, 0.7)",
    SPAWN_RED_ACTIVE: "rgba(255, 0, 0, 0.7)",
    GLYPH_BAN: "rgba(200, 0, 0, 0.1)",
    GLYPH_BLUE: "rgba(50, 150, 255, 0.2)",
    GLYPH_BROWN: "rgba(150, 50, 30, 0.5)",
    GLYPH_DARK: "rgba(12, 30, 12, 0.5)",
    GLYPH_ORANGE: "rgba(255, 65, 0, 0.5)",
    GLYPH_PURPLE: "rgba(255,0,255, 0.3)",
    GLYPH_FLOWER: "rgba(30, 205, 50, 0.3)",
    GLYPH_GAZ: "rgba(100, 255, 150, 0.3)",
    GLYPH_WATER: "rgba(0, 0, 150, 0.3)",
    GLYPH_PREVIEW: "rgba(255, 65, 0, 0.2)",
    GLYPH_HIGHLIGHT: "rgba(255, 255, 200, 0.2)"
};

const HexGrid = ({ map, layout, onHexClick, onHexHover, isPickPhase, currentTeamPicking, gameStateVersion }) => {

    // Helper to convert array of points to SVG polygon string
    const getPoints = (hex) => {
        const corners = layout.polygonCorners(hex);
        return corners.map(p => `${p.x},${p.y}`).join(' ');
    };

    // Memoize the grid generation as requested
    // We compute the rendering data (points, baseFill) once when map/layout changes.
    // The DYNAMIC overlays (highlights) are still checked during render, but we map over this prepared data.
    // Actually, extracting the *structure* is what useMemo is good for.
    const gridData = useMemo(() => {
        if (!map) return [];
        return map.map((hex) => {
            const points = layout.polygonCorners(hex).map(p => `${p.x},${p.y}`).join(' ');
            const center = layout.hexToPixel(hex);
            const tileHref = hex.floor ? `pics/tile${hex.rand4 || 0}.webp` : null;

            return {
                hex,
                points,
                center,
                tileHref,
                key: `${hex.q},${hex.r},${hex.s}`
            };
        });
    }, [map, layout, gameStateVersion]);

    // Touch Handling Logic
    const lastHoveredHex = React.useRef(null);

    const handleTouch = (e) => {
        // Prevent default to stop scrolling while interacting with the grid
        // e.preventDefault(); // Commented out to allow some scrolling, but might need it if dragging checks fail

        const touch = e.touches[0] || e.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        if (element) {
            // Traverse up to find the group or polygon with data-hex-id (if we added one)
            // Or simpler: The polygon has the onClick handler. We can try to map back to hex.
            // Since we don't have easy lookup from DOM -> Hex, we rely on the fact that
            // we are iterating gridData.
            // Let's attach data attributes to the polygons!

            const hexData = element.getAttribute('data-hex-id');
            if (hexData) {
                const [q, r, s] = hexData.split(',').map(Number);
                // Find hex in map - strictly strictly matching coordinates
                // Since 'map' objects are persistent references, we try to find the match
                const foundHex = map.find(h => h.q === q && h.r === r && h.s === s);

                if (foundHex && foundHex !== lastHoveredHex.current) {
                    // Pass the touch object/event as second arg
                    onHexHover(foundHex, touch);
                    lastHoveredHex.current = foundHex;
                } else if (foundHex) {
                    // Continuous hover update for vector targeting even if hex is same!
                    // This is CRITICAL for "Wall" spell which needs to track movement *within* the hex or across neighbors
                    onHexHover(foundHex, touch);
                }
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (lastHoveredHex.current) {
            // Pass the touch event (from changedTouches usually) or just the event
            const touch = e.changedTouches[0] || e.touches[0];
            onHexClick(lastHoveredHex.current, touch || e);
            lastHoveredHex.current = null;
        }
    };

    return (
        <svg
            className="hex-grid-layer"
            width="100%"
            height="100%"
            style={{ overflow: 'visible', touchAction: 'none' }} // touch-action: none is critical
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onTouchEnd={handleTouchEnd}
        >
            <g>
                {gridData.map(({ hex, points, center, tileHref, key }) => (
                    <g key={key}>
                        {/* Floor Tile Image */}
                        {tileHref && (
                            <image
                                href={tileHref}
                                x={center.x - 72} // 144 / 2
                                y={center.y - 72}
                                width="144"
                                height="144"
                                style={{ pointerEvents: 'none' }}
                                clipPath={`url(#clip-${key})`}
                            />
                        )}

                        {/* ClipPath Definition for this Hex */}
                        <defs>
                            <clipPath id={`clip-${key}`}>
                                <polygon points={points} />
                            </clipPath>
                        </defs>

                        {/* Interactive Polygon (Hitbox & Overlays) */}
                        <polygon
                            points={points}
                            fill="white"
                            fillOpacity="0"
                            stroke={tileHref ? "none" : "rgba(255,255,255,0.1)"} // Debug/Fallback grid
                            strokeWidth="1"
                            data-hex-id={`${hex.q},${hex.r},${hex.s}`} // Added for Touch Logic
                            onClick={(e) => onHexClick(hex, e)}
                            onMouseMove={(e) => onHexHover(hex, e)} // CHANGED from onMouseEnter to onMouseMove to track continuous movement
                            style={{ cursor: (hex.hoverMove || hex.hoverSpell) ? 'pointer' : 'default' }}
                        />

                        {/* Dynamic Overlays */}
                        {hex.rangeMove && <polygon points={points} fill={COLORS.MOVE_RANGE} pointerEvents="none" />}
                        {hex.rangeSpell && <polygon points={points} fill={COLORS.SPELL_RANGE} pointerEvents="none" />}
                        {hex.hit && <polygon points={points} fill={COLORS.SPELL_HIT} pointerEvents="none" />}
                        {hex.hoverMove && <polygon points={points} fill={COLORS.MOVE_HOVER} pointerEvents="none" />}
                        {hex.hoverSpell && <polygon points={points} fill={COLORS.SPELL_HOVER} pointerEvents="none" />}

                        {/* AOE/Glyphs */}
                        {/* AOE/Glyphs */}
                        {hex.aoe && hex.aoe.length > 0 && hex.aoe.map((spell, idx) => {
                            // Color resolution: check if color is a key in COLORS, else use raw value
                            const fillColor = COLORS[spell.color] || spell.color || "rgba(255,255,255,0.2)";
                            const glyphSrc = spell.image?.src || (spell.glyphIcon ? `pics/${spell.glyphIcon}.webp` : null); // legacy drawing assumed logic

                            return (
                                <React.Fragment key={idx}>
                                    {/* Glyphs: If icon exists, render ONLY icon with opacity. Else render color fill. */}
                                    {glyphSrc ? (
                                        <image
                                            href={glyphSrc}
                                            x={center.x - 57.5}
                                            y={center.y - 57.5}
                                            width="115"
                                            height="115"
                                            style={{ pointerEvents: 'none', opacity: 0.3 }}
                                            clipPath={`url(#clip-${key})`}
                                        />
                                    ) : (
                                        <polygon points={points} fill={fillColor} pointerEvents="none" />
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* Pick Phase Spawns */}
                        {isPickPhase && hex.floor && (
                            <>
                                {(currentTeamPicking === c.CONSTANTS.TEAM_BLUE && hex.r >= 3) &&
                                    <polygon points={points} fill={COLORS.SPAWN_BLUE_ACTIVE} pointerEvents="none" />}
                                {(currentTeamPicking === c.CONSTANTS.TEAM_BLUE && hex.r <= -3) &&
                                    <polygon points={points} fill={COLORS.SPAWN_RED} pointerEvents="none" />}

                                {(currentTeamPicking !== c.CONSTANTS.TEAM_BLUE && hex.r >= 3) &&
                                    <polygon points={points} fill={COLORS.SPAWN_BLUE} pointerEvents="none" />}
                                {(currentTeamPicking !== c.CONSTANTS.TEAM_BLUE && hex.r <= -3) &&
                                    <polygon points={points} fill={COLORS.SPAWN_RED_ACTIVE} pointerEvents="none" />}
                            </>
                        )}
                    </g>
                ))}
            </g>
        </svg>
    );
};

export default HexGrid;
