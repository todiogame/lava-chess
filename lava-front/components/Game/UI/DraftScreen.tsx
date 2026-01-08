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
            {/* <div className="absolute top-4 left-20 pointer-events-auto">
                <div className="bg-black/80 text-white font-[Russo One] text-2xl px-6 py-2 rounded-t-lg border-b-2 border-gray-600 w-fit">
                    You are TEAM <span className={TEAM === 'BLUE' ? 'text-blue-400' : 'text-red-500'}>{TEAM}</span>
                </div>
                <div className={`bg-black/90 font-[Russo One] text-2xl px-6 py-4 rounded-b-lg w-fit border-l-8 ${isMyTurn ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500'}`}>
                    {isMyTurn ? "Your Turn" : "Enemy's Turn"} to {currentAction}
                </div>
            </div> */}

            {/* Sidebar Details */}
            {target && (
                <div className="absolute top-40 left-0 w-[450px] h-[730px] bg-black/90 border-r-4 border-orange-600 rounded-r-3xl p-6 pointer-events-auto overflow-y-auto">
                    <div className="flex items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 flex-shrink-0 border-4 border-orange-500 rounded-lg overflow-hidden mr-4 bg-gray-900">
                            <img
                                src={target.image?.src || `./pics/${target.id.toLowerCase()}.webp`}
                                alt={target.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Header */}
                        <div>
                            <h2 className="text-4xl font-[Russo One] text-orange-500 mb-1">{target.name}</h2>
                            <h3 className="text-2xl font-[Russo One] text-orange-400 mb-2">{target.title}</h3>
                            <div className="text-yellow-500">
                                Difficulty: {displayStars(target.difficulty)}
                            </div>
                        </div>
                    </div>

                    <p className="mt-4 text-orange-200 text-lg leading-relaxed font-[Russo One]">
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
                                    <div className="text-orange-500 font-bold text-xl font-[Russo One]">
                                        {spell.name} {spell.cooldown && <span className="text-sm text-gray-400">(CD: {spell.cooldown})</span>}
                                    </div>
                                    <div className="text-orange-200 text-sm leading-tight mt-1">
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
