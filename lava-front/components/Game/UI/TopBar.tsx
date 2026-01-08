import React, { useEffect, useState } from 'react';

// Interfaces for Global Data
interface UserInfo {
    username: string;
    level: number;
    elo: number;
}

// Access globals
const getStoredData = () => (window as any).storedData as UserInfo || { username: 'You', level: 1, elo: 1000 };
const getEnemyData = () => (window as any).enemy?.userInfo as UserInfo || { username: 'Enemy', level: 1, elo: 1000 };
const getTeam = () => (window as any).TEAM;

export default function TopBar({ ongoingGame }: { ongoingGame: any }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const myData = getStoredData();
    const enemyData = getEnemyData();
    const myTeam = getTeam();
    const enemyTeam = myTeam === 'BLUE' ? 'RED' : 'BLUE';

    useEffect(() => {
        const interval = setInterval(() => {
            if (ongoingGame?.turnTimer?.turnStartTime) {
                // CONSTANTS.TIME_TURN_MS is usually 30000 or similar. Needs import or hardcode.
                // client.js: c.CONSTANTS.TIME_TURN_MS.
                // We'll read from window.consts or assume 90s/30s?
                // Let's assume 30s for now or try to get it from ongoingGame?
                // Actually `ongoingGame` might not have constants.
                // Let's rely on logic: consts are required.
                const TIME_TURN_MS = 30000; // Hardcoded fallback or import? 
                // Better: import consts from @/lib/const if possible, or use window.consts if I exposed it.
                // I exposed `window.consts` in GameCanvas!
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

    return (
        <div className="absolute top-0 left-0 w-full flex justify-between items-start pointer-events-none p-4">
            {/* My Info */}
            <div className={`flex flex-col items-start bg-black/60 p-2 rounded-br-xl border-l-4 ${myTeam === 'BLUE' ? 'border-blue-500' : 'border-red-500'} pointer-events-auto`}>
                <div className="text-xl font-bold text-white font-[Russo One]">{myData.username}</div>
                <div className="text-sm text-gray-300">Lvl {myData.level} • {Math.floor(myData.elo)} ELO</div>
            </div>

            {/* Timer & Turn Status */}
            <div className="flex flex-col items-center">
                <div className={`text-4xl font-[Russo One] drop-shadow-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft}
                </div>
                <div className={`mt-1 px-4 py-1 rounded-full text-sm font-bold tracking-wider ${isMyTurn ? 'bg-green-600/80 text-white' : 'bg-red-600/80 text-white'}`}>
                    {isMyTurn ? "YOUR TURN" : "ENEMY TURN"}
                </div>
            </div>

            {/* Enemy Info */}
            <div className={`flex flex-col items-end bg-black/60 p-2 rounded-bl-xl border-r-4 ${enemyTeam === 'BLUE' ? 'border-blue-500' : 'border-red-500'} pointer-events-auto`}>
                <div className="text-xl font-bold text-white font-[Russo One]">{enemyData?.username || "Opponent"}</div>
                <div className="text-sm text-gray-300">Lvl {enemyData?.level || "?"} • {Math.floor(enemyData?.elo || 1000)} ELO</div>
            </div>
        </div>
    );
}
