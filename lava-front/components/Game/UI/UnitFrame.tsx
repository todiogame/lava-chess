import React from 'react';

export default function UnitFrame({ ongoingGame }: { ongoingGame: any }) {
    if (!ongoingGame) return null;

    // Find selected or hovered entity
    const selected = ongoingGame.entities.find((e: any) => e.selected);
    const hovered = ongoingGame.entities.find((e: any) => e.hovered);
    const target = selected || hovered;

    if (!target) return null;

    // Attempt to find the Player object associated with this entity (for spells, move points, etc.)
    const player = ongoingGame.PLAYERS?.find((p: any) => p.entity.id === target.id);
    const spells = player?.spells || target.spells || [];
    const movePoints = player?.movePoint;

    const teamColor = target.team === 'BLUE' ? 'border-blue-500' : target.team === 'RED' ? 'border-red-500' : 'border-yellow-500';

    return (
        <div className="flex flex-col items-start bg-black/70 p-4 rounded-xl border-2 border-gray-600 w-64 pointer-events-auto shadow-2xl backdrop-blur-sm">

            <div className="flex w-full mb-3">
                <div className={`relative w-20 h-20 border-4 ${teamColor} rounded shadow-lg overflow-hidden shrink-0 bg-gray-900`}>
                    <img src="./pics/lavasmall.webp" alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <img
                        src={target.image?.src || `./pics/${target.id.toLowerCase()}.webp`}
                        alt={target.name}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                </div>
                <div className="ml-3 flex flex-col justify-center overflow-hidden w-full">
                    <div className="text-white font-bold text-lg font-[Russo One] stroke-black truncate drop-shadow-md">{target.name}</div>
                    {movePoints !== undefined && (
                        <div className="text-sm text-blue-300 font-semibold drop-shadow-sm">Moves: {movePoints}</div>
                    )}
                    <div className="text-xs text-gray-400 capitalize">{target.team ? `${target.team} Team` : 'Neutral'}</div>
                </div>
            </div>

            <div className="w-full bg-gray-800 h-5 mt-1 rounded border border-gray-600 relative overflow-hidden shadow-inner">
                <div
                    className="bg-gradient-to-r from-green-700 to-green-500 h-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (target.currentHP / target.maxHP) * 100))}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white shadow-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {Math.max(0, target.currentHP)} / {target.maxHP} HP
                </div>
            </div>

            {/* Spells Row */}
            {spells.length > 0 && (
                <div className="flex mt-3 space-x-2 w-full flex-wrap">
                    {spells.map((spell: any, idx: number) => (
                        <div key={idx} className="relative group">
                            <div className="w-10 h-10 border border-gray-500 rounded overflow-hidden cursor-help bg-black hover:border-yellow-400 transition-colors">
                                <img
                                    src={spell.image?.src || "./pics/spells/spell_placeholder.webp"}
                                    alt={spell.name}
                                    className={`w-full h-full object-cover ${spell.currentCD > 0 ? 'grayscale opacity-50' : ''}`}
                                />
                                {spell.currentCD > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs bg-black/40">
                                        {spell.currentCD}
                                    </div>
                                )}
                            </div>
                            {/* Tooltip */}
                            <div className="absolute top-full left-0 mt-2 w-52 bg-gray-900 border border-yellow-500 p-3 rounded z-50 hidden group-hover:block text-xs shadow-xl pointer-events-none transform translate-y-1">
                                <div className="text-yellow-400 font-bold mb-1 text-sm border-b border-gray-700 pb-1">{spell.name}</div>
                                <div className="text-gray-300 mb-2 leading-tight">{spell.description}</div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                                    {spell.cooldown > 0 && <span>CD: {spell.cooldown} turns</span>}
                                    {spell.currentCD > 0 && <span className="text-red-400 font-bold">READY IN {spell.currentCD}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Status Effects / Auras */}
            {target.auras && target.auras.filter((a: any) => a.isAura || a.ttl !== undefined).length > 0 && (
                <div className="mt-3 w-full border-t border-gray-600 pt-2">
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Status Effects</div>
                    <div className="flex flex-wrap gap-1.5">
                        {target.auras.filter((a: any) => a.isAura || a.ttl !== undefined).map((aura: any, idx: number) => (
                            <div key={idx} className="relative group">
                                <div className={`flex items-center justify-center px-1.5 py-0.5 rounded border border-opacity-50 cursor-help transition-all hover:scale-105 ${aura.isAura ? 'bg-amber-900/60 border-amber-500 text-amber-200' :
                                    (aura.name === 'silence' || aura.name === 'root' || aura.name === 'stun') ? 'bg-red-900/60 border-red-500 text-red-200' :
                                        'bg-purple-900/60 border-purple-500 text-purple-200'
                                    }`}>
                                    {aura.image ? (
                                        <img src={aura.image.src || aura.image} alt={aura.name} className="w-3.5 h-3.5 mr-1" />
                                    ) : null}
                                    <span className="text-[10px] font-bold capitalize tracking-wide">{aura.name}</span>
                                    {aura.ttl !== undefined && (
                                        <span className="ml-1 text-[9px] opacity-75 font-mono">({aura.ttl})</span>
                                    )}
                                </div>

                                {/* Aura Tooltip */}
                                <div className="absolute top-full left-0 mt-1 min-w-[140px] max-w-[220px] bg-gray-900 border border-gray-600 p-2 rounded z-50 hidden group-hover:block text-xs shadow-xl pointer-events-none">
                                    <div className="font-bold text-white mb-0.5 capitalize">{aura.name}</div>
                                    {aura.description && <div className="text-gray-300 mb-1 leading-tight">{aura.description}</div>}
                                    {aura.ttl !== undefined && (
                                        <div className="text-gray-500 font-mono text-[10px]">Duration: {aura.ttl} turns</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
