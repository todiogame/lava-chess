import React from 'react';
// @ts-ignore
import * as consts from '@/lib/const';

export default function DraftScreen({ ongoingGame }: { ongoingGame: any }) {
    if (!ongoingGame) return null;

    const TEAM = (window as any).TEAM;
    const isMyTurn = ongoingGame.currentTeamPicking === TEAM;
    const pickOrBanIndex = ongoingGame.pickOrBanIndex;
    const currentAction = consts.CONSTANTS.PICK_BAN_ORDER[pickOrBanIndex] || '...';

    // Find highlighted entity
    const selected = ongoingGame.entities.find((e: any) => e.selected);
    const hovered = ongoingGame.entities.find((e: any) => e.hovered);
    const target = selected || hovered;

    const displayStars = (num: number) => "⭐️".repeat(num);

    return (
        <div className="absolute inset-0 pointer-events-none p-4">
            {/* Turn Banner - REMOVED (Moved to GameInfoBar) */}
            {/* Turn Banner - REMOVED (Moved to GameInfoBar) */}

            {/* Sidebar Details */}
            {target && (
                <div className="absolute inset-0 md:top-40 md:left-0 md:bottom-auto md:right-auto md:w-[450px] md:h-[730px] bg-black/95 md:bg-black/90 border-r-0 md:border-r-4 border-orange-600 rounded-none md:rounded-r-3xl p-4 md:p-6 pointer-events-auto overflow-y-auto flex flex-col justify-center md:block z-50">
                    <div className="flex items-start">
                        {/* Avatar */}
                        <div className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0 border-4 border-orange-500 rounded-lg overflow-hidden mr-4 bg-gray-900">
                            <img
                                src={target.image?.src || `./pics/${target.id.toLowerCase()}.webp`}
                                alt={target.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Header */}
                        <div>
                            <h2 className="text-2xl md:text-4xl font-[Russo One] text-orange-500 mb-1">{target.name}</h2>
                            <h3 className="text-lg md:text-2xl font-[Russo One] text-orange-400 mb-2">{target.title}</h3>
                            <div className="text-yellow-500 text-sm md:text-base">
                                Difficulty: {displayStars(target.difficulty)}
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-orange-200 text-sm md:text-lg leading-relaxed font-[Russo One]">
                        {target.description}
                    </p>

                    {/* Spells List */}
                    <div className="mt-6 space-y-4">
                        {target.spellsDisplay?.map((spell: any, idx: number) => (
                            <div key={idx} className="flex bg-gray-900/50 p-2 rounded border border-gray-700">
                                <div className="w-20 h-20 flex-shrink-0 border-2 border-orange-500 rounded overflow-hidden mr-3">
                                    <img
                                        src={spell.image?.src || `./pics/spells/${target.id.toLowerCase()}_${idx + 1}.webp`}
                                        onError={(e) => (e.currentTarget.src = "./pics/spells/spell_placeholder.webp")}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="text-orange-500 font-bold text-lg md:text-xl font-[Russo One]">
                                        {spell.name} {spell.cooldown && <span className="text-xs md:text-sm text-gray-400">(CD: {spell.cooldown})</span>}
                                    </div>
                                    <div className="text-orange-200 text-xs md:text-sm leading-tight mt-1">
                                        {spell.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
