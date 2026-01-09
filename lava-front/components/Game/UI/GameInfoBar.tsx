import React from 'react';
// @ts-ignore
import * as consts from '@/lib/const';

export default function GameInfoBar({ ongoingGame }: { ongoingGame: any }) {
    if (!ongoingGame) return null;

    const TEAM = (window as any).TEAM;
    const isPickPhase = ongoingGame.isPickPhase;

    // Determine Turn Status Logic
    let statusText = "";
    let isMyTurn = false;

    if (isPickPhase) {
        isMyTurn = ongoingGame.currentTeamPicking === TEAM;
        const pickOrBanIndex = ongoingGame.pickOrBanIndex;
        const currentAction = consts.CONSTANTS.PICK_BAN_ORDER[pickOrBanIndex] || '...';
        statusText = `${isMyTurn ? "Your Turn" : "Enemy's Turn"} to ${currentAction}`;
    } else {
        const myTeam = TEAM;
        isMyTurn = ongoingGame.currentPlayer?.entity?.team === myTeam;
        statusText = isMyTurn ? "YOUR TURN" : "ENEMY TURN";
    }

    return (
        <div className="w-full flex flex-col items-center pointer-events-none mt-4 z-50 relative">
            {/* Only show big status text during Pick Phase. During Game, TopBar handles it. */}
            {isPickPhase && (
                <div className={`bg-black/90 font-[Russo One] text-3xl px-12 py-3 rounded-b-xl border-x-4 border-b-4 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md transform transition-all duration-300 ${isMyTurn ? 'border-green-500 text-green-400 shadow-green-900/20' : 'border-red-500 text-red-500 shadow-red-900/20'}`}>
                    {statusText}
                </div>
            )}
        </div>
    );
}
