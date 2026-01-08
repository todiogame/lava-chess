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

    // If it's not my turn, or I'm not the current player (e.g. spectator?), we still show the dock but disabled?
    // Legacy behavior: "color spell enemy turn".
    // Also, we need to find "usersNextPlayer" if we are not currently playing? 
    // Legacy: `let usersNextPLayer = utils.findNextPlayer(og, TEAM);`
    // If I correspond to the current player, show active.

    // Simplification: In this game, there are sequential turns.
    // If `ongoingGame.currentPlayer` is ME, then I am active.
    // If `ongoingGame.currentPlayer` is NOT ME, I might still want to see MY spells?
    // Legacy `drawSpells`: "if (bottomRow || player != og.currentPlayer...)".
    // "usersNextPlayer" is passed to drawSpells.
    // We should find the player object that belongs to ME (TEAM).

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

    // Actions should target the displayed player (which is either current or next)
    // NOTE: In legacy, can you cast spells if it's not your turn? No.
    // So if !isMyTurn, buttons should be disabled or "preview only".

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
        <div className="relative flex items-end space-x-2 bg-black/80 p-3 rounded-xl border border-gray-700">
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
                    className={`w-20 h-20 rounded border-2 overflow-hidden transition-all cursor-pointer ${isMyTurn && displayedPlayer.movePoint > 0 ? 'border-yellow-500 hover:scale-105' : 'border-gray-600 grayscale brightness-50'
                        }`}
                >
                    <img src="./pics/spells/move.webp" alt="Move" className="w-full h-full object-cover" />
                </button>
                <div className="absolute bottom-1 right-1 text-white font-black text-xl drop-shadow-md">
                    {displayedPlayer.movePoint}
                </div>
            </div>

            {/* Spells */}
            {displayedPlayer.spells.map((spell: any, index: number) => {
                const onCooldown = spell.currentCD > 0;
                const isPassive = spell.passive;
                // isSilenced logic?

                return (
                    <div
                        key={index}
                        className="relative group"
                        onMouseEnter={() => setHoveredSpell(spell)}
                        onMouseLeave={() => setHoveredSpell(null)}
                    >
                        <button
                            onClick={() => handleSpellClick(index)}
                            disabled={!isMyTurn || onCooldown || isPassive}
                            className={`w-20 h-20 rounded border-2 overflow-hidden transition-all cursor-pointer ${isMyTurn && !onCooldown && !isPassive ? 'border-yellow-500 hover:scale-105' : 'border-gray-600 grayscale brightness-50'
                                }`}
                        >
                            <img
                                src={spell.image?.src || "./pics/spells/spell_placeholder.webp"}
                                alt={spell.name}
                                className="w-full h-full object-cover"
                            />
                            {onCooldown && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-3xl">
                                    {spell.currentCD}
                                </div>
                            )}
                            {isPassive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-gray-300 font-bold uppercase">Passive</div>
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
                    className={`w-20 h-20 rounded border-2 overflow-hidden transition-all cursor-pointer ${isMyTurn ? 'border-yellow-500 hover:scale-105' : 'border-gray-600 grayscale brightness-50'
                        }`}
                >
                    {/* Check if summoned: Pass vs Lava */}
                    {/* Note: Legacy logic checks `og.currentPlayer.isSummoned` */}
                    <img
                        src={isSummoned ? "./pics/spells/pass.webp" : "./pics/spells/lavapass.webp"}
                        alt="End Turn"
                        className="w-full h-full object-cover"
                    />
                </button>
            </div>

        </div>
    );
}
