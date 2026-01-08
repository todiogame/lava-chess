import React, { useEffect, useState } from 'react';
import TopBar from './TopBar';
import SpellDock from './SpellDock';
import UnitFrame from './UnitFrame';
import DraftScreen from './DraftScreen';

interface GameHUDProps {
    ongoingGame: any;
    gameStateVersion: number; // Increment to force re-render
}

export default function GameHUD({ ongoingGame, gameStateVersion }: GameHUDProps) {
    if (!ongoingGame) return null;

    const isPickPhase = ongoingGame.isPickPhase;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Overlay Container - pointer-events-none lets clicks pass through to canvas by default */}
            {/* Child elements must have pointer-events-auto to be clickable */}

            {isPickPhase ? (
                <DraftScreen ongoingGame={ongoingGame} />
            ) : (
                <>
                    <TopBar ongoingGame={ongoingGame} />

                    {/* Main Gameplay Layout */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="flex justify-between items-start mt-20">
                            {/* Left: Unit Frame */}
                            <div className="pointer-events-auto">
                                <UnitFrame ongoingGame={ongoingGame} />
                            </div>

                            {/* Right: Notifications/Logs (Future) */}
                            <div className="pointer-events-auto">
                            </div>
                        </div>

                        {/* Bottom: Spell Dock */}
                        <div className="flex justify-center mb-4 pointer-events-auto">
                            <SpellDock ongoingGame={ongoingGame} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
