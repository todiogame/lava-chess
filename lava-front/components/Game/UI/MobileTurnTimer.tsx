import React, { useEffect, useState } from 'react';

// Access globals
const getTeam = () => (window as any).TEAM;

export default function MobileTurnTimer({ ongoingGame }: { ongoingGame: any }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const myTeam = getTeam();

    useEffect(() => {
        const interval = setInterval(() => {
            if (ongoingGame?.turnTimer?.turnStartTime) {
                const consts = (window as any).consts;
                const limit = consts ? consts.CONSTANTS.TIME_TURN_MS : 30000;

                const elapsed = Date.now() - ongoingGame.turnTimer.turnStartTime;
                const remaining = Math.ceil((limit - elapsed) / 1000);
                setTimeLeft(remaining > 0 ? remaining : 0);
            } else {
                setTimeLeft(0);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [ongoingGame]);

    const isMyTurn = ongoingGame.currentPlayer?.entity?.team === myTeam;

    if (!ongoingGame) return null;

    return (
        <div className="flex flex-col items-center justify-center -mt-2 mb-2 md:hidden pointer-events-none z-40">
            <div className="relative">
                {/* Timer Number */}
                <div className={`text-center text-3xl font-[Russo One] drop-shadow-md ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft}
                </div>
                {/* Status Pill */}
                <div className={`px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg ${isMyTurn ? 'bg-green-600 text-white border border-green-400' : 'bg-red-600 text-white border border-red-400'}`}>
                    {isMyTurn ? "YOUR TURN" : "ENEMY TURN"}
                </div>
            </div>
        </div>
    );
}
