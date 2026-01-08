import GameCanvas from "@/components/Game/GameCanvas";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col p-4 max-w-7xl mx-auto w-full">
            {/* Navigation */}
            <header className="flex justify-between items-center py-6 mb-10">
                <div className="font-extrabold text-2xl tracking-widest bg-clip-text text-transparent bg-gradient-to-tr from-white to-gray-400 font-display">
                    LAVA CHESS
                </div>
            </header>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] border border-white/10 rounded-xl bg-surface/50 backdrop-blur-sm p-4">
                <GameCanvas />
            </div>

        </div>
    );
}
