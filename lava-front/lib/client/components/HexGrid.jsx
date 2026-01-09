
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
    }, [map, layout]);

    return (
        <svg className="hex-grid-layer" width="100%" height="100%" style={{ overflow: 'visible' }}>
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
                            />
                        )}

                        {/* Interactive Polygon (Hitbox & Overlays) */}
                        <polygon
                            points={points}
                            fill="white"
                            fillOpacity="0"
                            stroke={tileHref ? "none" : "rgba(255,255,255,0.1)"} // Debug/Fallback grid
                            strokeWidth="1"
                            onClick={(e) => onHexClick(hex, e)}
                            onMouseEnter={() => onHexHover(hex)}
                            style={{ cursor: (hex.hoverMove || hex.hoverSpell) ? 'pointer' : 'default' }}
                        />

                        {/* Dynamic Overlays */}
                        {hex.rangeMove && <polygon points={points} fill={COLORS.MOVE_RANGE} pointerEvents="none" />}
                        {hex.rangeSpell && <polygon points={points} fill={COLORS.SPELL_RANGE} pointerEvents="none" />}
                        {hex.hit && <polygon points={points} fill={COLORS.SPELL_HIT} pointerEvents="none" />}
                        {hex.hoverMove && <polygon points={points} fill={COLORS.MOVE_HOVER} pointerEvents="none" />}
                        {hex.hoverSpell && <polygon points={points} fill={COLORS.SPELL_HOVER} pointerEvents="none" />}

                        {/* AOE/Glyphs */}
                        {hex.aoe && hex.aoe.length > 0 && hex.aoe.map((spell, idx) => (
                            <React.Fragment key={idx}>
                                {spell.color && (
                                    <polygon points={points} fill={spell.color} fillOpacity="0.3" pointerEvents="none" />
                                )}
                            </React.Fragment>
                        ))}

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
