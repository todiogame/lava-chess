
import React, { useState, useEffect, useRef } from 'react';
import HexGrid from './HexGrid';
import UnitLayer from './UnitLayer';
import EffectsLayer from './EffectsLayer';
import { Layout, Point } from '../../Hex'; // Check path
import c from '../../const';
import drawing from '../drawing'; // Legacy drawing for layout helpers (makeLayout)

const SCALE = 60;

const GameBoard = ({ og, gameStateVersion }) => {
    // State for layout (depends on pick phase)
    const [layout, setLayout] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: c.CANVAS.WIDTH, height: c.CANVAS.HEIGHT });

    // Handlers
    // Force re-render on game state mutation
    const [, forceUpdate] = useState(0);

    // Handlers
    const handleHexClick = (hex, e) => {
        if (window.interface && !og.isPickPhase) {
            window.interface.onMouseClicGame(hex, og);
        } else if (window.pickPhase && og.isPickPhase) {
            window.pickPhase.onMouseClicDraft(hex, og);
        }
        forceUpdate(n => n + 1);
    };

    const handleHexHover = (hex) => {
        if (window.interface && !og.isPickPhase) {
            window.interface.onMouseHoverGame(hex, og);
        } else if (window.pickPhase && og.isPickPhase) {
            window.pickPhase.onMouseHoverDraft(hex, og);
        }
        forceUpdate(n => n + 1);
    };

    // Resize Logic (simplified from drawing.js)
    useEffect(() => {
        const handleResize = () => {
            const height = window.innerHeight - 130;
            const width = height * (c.CANVAS.WIDTH / c.CANVAS.HEIGHT);
            setCanvasSize({ width, height });
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update Layout when phase changes
    useEffect(() => {
        // Replicate makeLayout logic
        const isPick = og.isPickPhase;
        const origin = new Point(c.CANVAS.WIDTH / 2 + (isPick ? 200 : 0), c.CANVAS.HEIGHT / 2);
        const newLayout = new Layout(Layout.pointy, new Point(SCALE, SCALE), origin);
        setLayout(newLayout);

        // Keep legacy drawing.layout in sync for Anim.js usage!
        if (drawing) {
            drawing.layout = newLayout;
            drawing.origin = origin;
        }

        console.log("DEBUG: Layout Created", {
            origin,
            size: newLayout.size,
            sampleHex: og.map?.[0],
            samplePixel: og.map?.[0] ? newLayout.hexToPixel(og.map[0]) : "N/A"
        });
    }, [og.isPickPhase]);

    if (!layout) return null;
    if (!og.map) return <div>Loading Map...</div>;

    return (
        <div
            id="game-board-container"
            style={{
                position: 'relative',
                width: canvasSize.width,
                height: canvasSize.height,
                margin: '0 auto', // Center
                // Scale rendering to fit the container? 
                // drawing.js used ctx.scale.
                // In React DOM, we might need to rely on the SVG viewBox and CSS transform for the DOM layer.
                // SVG: viewBox="0 0 1920 1080" (c.CANVAS values)
                // Container size: calculated by resize.
                // We'll wrap items in a scaler div.
            }}
        >
            <div
                className="scaler-content"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: c.CANVAS.WIDTH,
                    height: c.CANVAS.HEIGHT,
                    transformOrigin: 'top left',
                    transform: `scale(${canvasSize.width / c.CANVAS.WIDTH})`
                }}
            >
                {/* 1. Bottom: SVG Grid */}
                <HexGrid
                    map={og.map}
                    layout={layout}
                    onHexClick={handleHexClick}
                    onHexHover={handleHexHover}
                    isPickPhase={og.isPickPhase}
                    currentTeamPicking={og.currentTeamPicking}
                    gameStateVersion={gameStateVersion}
                />

                {/* 2. Middle: DOM Unit Layer */}
                <UnitLayer
                    entities={og.entities}
                    layout={layout}
                    isPickPhase={og.isPickPhase}
                />

                {/* 3. Top: Canvas Effects */}
                <EffectsLayer
                    width={c.CANVAS.WIDTH}
                    height={c.CANVAS.HEIGHT}
                />
            </div>
        </div>
    );
};

export default GameBoard;
