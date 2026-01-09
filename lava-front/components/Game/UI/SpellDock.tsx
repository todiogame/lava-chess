import React, { useState } from 'react';
// @ts-ignore
import * as interfaceLogic from '@/lib/client/interface';
// @ts-ignore
import * as consts from '@/lib/const';

export default function SpellDock({ ongoingGame }: { ongoingGame: any }) {
    const [hoveredSpell, setHoveredSpell] = useState<any>(null);

    const TEAM = (window as any).TEAM;
    const currentPlayer = ongoingGame.currentPlayer; // Playable
    const myTurn = currentPlayer?.entity?.team === TEAM;

    // Logic to determine which player's spells to show
    const getDisplayedPlayer = () => {
        // If it's my turn, show the current player (if it's me)
        if (currentPlayer?.entity?.team === TEAM && !currentPlayer.dead) {
            return currentPlayer;
        }

        // Otherwise, find the next player in my team who will play
        const allPlayers = ongoingGame.PLAYERS || [];
        const currentIndex = ongoingGame.idCurrentPlayer;

        // Search from current index to end
        const upcoming = allPlayers.slice(currentIndex);
        let next = upcoming.find((p: any) => !p.dead && p.entity.team === TEAM);

        // If not found, wrap around and search from start
        if (!next) {
            next = allPlayers.find((p: any) => !p.dead && p.entity.team === TEAM);
        }

        return next;
    };

    const displayedPlayer = getDisplayedPlayer();

    if (!displayedPlayer) return null; // No alive players?

    const isMyTurn = displayedPlayer === currentPlayer && displayedPlayer.entity.team === TEAM;
    const isSummoned = displayedPlayer.isSummoned;

    const handleMoveClick = () => {
        if (!isMyTurn) return;
        interfaceLogic.clickMove(displayedPlayer, ongoingGame);
    };

    const handleSpellClick = (index: number) => {
        if (!isMyTurn) return;
        interfaceLogic.clickSpell(displayedPlayer, index, ongoingGame);
    };

    const handlePassClick = () => {
        if (!isMyTurn) return;
        interfaceLogic.clickPassTurnOrRiseLava(displayedPlayer, ongoingGame);
    };

    return (
        <div className="relative flex flex-wrap justify-center items-end gap-1 md:gap-2 bg-black/80 p-2 rounded-xl border border-gray-700 mx-2 mb-0">
            {/* Tooltip Popup */}
            {hoveredSpell && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-slate-900 border border-yellow-600 text-white p-3 rounded shadow-xl z-50">
                    <div className="font-bold text-lg text-yellow-500">{hoveredSpell.name}</div>
                    <div className="text-xs text-gray-400 mb-2">
                        {hoveredSpell.cooldown ? `CD: ${hoveredSpell.currentCD}/${hoveredSpell.cooldown}` : 'Passive/No CD'}
                    </div>
                    <div className="text-sm">{hoveredSpell.description}</div>
                </div>
            )}

            {/* Move Button */}
            <div className="relative group">
                <button
                    onClick={handleMoveClick}
                    disabled={!isMyTurn || displayedPlayer.movePoint <= 0}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded border-2 overflow-hidden transition-all cursor-pointer ${isMyTurn && displayedPlayer.movePoint > 0 ? 'border-yellow-500 hover:scale-105' : 'border-gray-600 grayscale brightness-50'
                        }`}
                >
                    <img src="./pics/spells/move.webp" alt="Move" className="w-full h-full object-cover" />
                </button>
                <div className="absolute bottom-0 right-0 md:bottom-1 md:right-1 text-white font-black text-sm md:text-xl drop-shadow-md">
                    {displayedPlayer.movePoint}
                </div>
            </div>

            {/* Spells */}
            {displayedPlayer.spells.map((spell: any, index: number) => {
                const onCooldown = spell.currentCD > 0;
                const isPassive = spell.passive;
                // Check for silence aura on the player entity
                const isSilenced = displayedPlayer.entity.auras?.some((a: any) => a.name === 'silence');

                const isDisabled = !isMyTurn || onCooldown || isPassive || isSilenced;

                return (
                    <div
                        key={index}
                        className="relative group"
                        onMouseEnter={() => setHoveredSpell(spell)}
                        onMouseLeave={() => setHoveredSpell(null)}
                    >
                        <button
                            onClick={() => handleSpellClick(index)}
                            disabled={isDisabled}
                            className={`w-12 h-12 md:w-16 md:h-16 rounded border-2 overflow-hidden transition-all cursor-pointer relative 
                                ${!isDisabled ? 'border-yellow-500 hover:scale-105' : 'border-gray-600'}
                                ${isSilenced ? 'border-purple-500' : ''}
                            `}
                        >
                            <img
                                src={spell.image?.src || "./pics/spells/spell_placeholder.webp"}
                                alt={spell.name}
                                className={`w-full h-full object-cover transition-all 
                                    ${isDisabled && !isSilenced ? 'grayscale brightness-50' : ''} 
                                    ${isSilenced ? 'grayscale brightness-75 sepia hue-rotate-[250deg]' : ''}
                                `}
                            />

                            {/* Overlays */}
                            {isSilenced && (
                                <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center">
                                    <img src="./pics/silence.webp" alt="Silenced" className="w-2/3 h-2/3 opacity-90" />
                                </div>
                            )}

                            {onCooldown && !isSilenced && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <img src="./pics/spells/cd_icon.webp" alt="CD" className="absolute w-2/3 h-2/3 opacity-60" />
                                    <span className="relative text-white font-bold text-xl md:text-3xl drop-shadow-md">{spell.currentCD}</span>
                                </div>
                            )}

                            {isPassive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 ring-1 ring-inset ring-gray-600">
                                    <span className="text-xs text-gray-300 font-bold uppercase">Passive</span>
                                </div>
                            )}
                        </button>
                    </div>
                );
            })}

            {/* Pass/Lava Button */}
            <div className="relative group"
                onMouseEnter={() => setHoveredSpell({
                    name: isSummoned ? "Pass Turn" : "Raise Lava",
                    description: isSummoned ? "End your turn." : "Raise the lava level, shrinking the map."
                })}
                onMouseLeave={() => setHoveredSpell(null)}
            >
                <button
                    onClick={handlePassClick}
                    disabled={!isMyTurn}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${isMyTurn ? 'bg-red-900 border-red-500 hover:bg-red-800' : 'bg-gray-900 border-gray-600 grayscale'}
                `}
                >
                    <img
                        src={isSummoned ? "./pics/spells/pass.webp" : "./pics/spells/lavapass.webp"}
                        alt="End Turn"
                    />
                </button>
            </div>

        </div>
    );
}
