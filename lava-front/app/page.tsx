"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    // Generate random guest name on client-side mount
    const randomName = "Guest_" + Math.floor(Math.random() * 10000);
    setNickname(randomName);
  }, []);

  const handlePlay = () => {
    if (!nickname) return;
    // Save to localStorage for GameCanvas to read
    localStorage.setItem("lava_username", nickname);
    router.push("/game");
  };

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-7xl mx-auto w-full">
      {/* Navigation */}
      <header className="flex justify-between items-center py-6 mb-10">
        <div className="font-extrabold text-2xl tracking-widest bg-clip-text text-transparent bg-gradient-to-tr from-white to-gray-400 font-display">
          LAVA CHESS
        </div>
        <div className="flex gap-4 items-center font-bold text-sm uppercase">
          <a
            href="https://discord.gg/y6Gum8MSAN"
            target="_blank"
            className="text-[#7289da] hover:text-white transition-colors"
          >
            Discord
          </a>
          <a
            href="https://www.reddit.com/r/LavaChess/"
            target="_blank"
            className="text-[#ff4500] hover:text-white transition-colors"
          >
            Reddit
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center mb-16 animate-in slide-in-from-bottom-5 fade-in duration-1000">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-display">
          Lava Chess
        </h1>
        <p className="text-ember font-semibold text-xl tracking-widest uppercase mb-12">
          Forged in Fire. Played on Hexagons.
        </p>

        <div className="flex flex-col items-center gap-6">
          {/* Nickname Input Placeholder */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Enter Nickname"
              maxLength={10}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-white/5 border border-magma/50 rounded-xl px-6 py-4 text-center text-xl font-bold w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-magma shadow-lg backdrop-blur-sm transition-all text-white placeholder:text-white/30"
            />
          </div>

          <button
            onClick={handlePlay}
            className="bg-gradient-to-br from-magma to-[#D03000] text-white text-2xl font-black px-16 py-6 rounded-full shadow-[0_0_25px_rgba(255,69,0,0.4)] hover:shadow-[0_0_40px_rgba(255,69,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 uppercase tracking-wider border-b-4 border-[#8B2500]">
            Play Now
          </button>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Leaderboard Card */}
        <div className="col-span-1 md:col-span-2 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-magma/30 transition-colors">
          <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm border-b border-white/5 pb-2 mb-4">
            Top Strategists
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-sm uppercase">
                  <th className="p-3 border-b border-white/10">#</th>
                  <th className="p-3 border-b border-white/10">Name</th>
                  <th className="p-3 border-b border-white/10 text-right">Elo</th>
                </tr>
              </thead>
              <tbody className="font-mono text-amber-500">
                {/* Mock Data */}
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 border-b border-white/5">#{i + 1}</td>
                    <td className={`p-3 border-b border-white/5 ${i === 0 ? 'text-ember font-bold' : ''}`}>
                      {["GrandMaster", "HexaKing", "MagmaLord", "PawnStar", "RookIE"][i]}
                    </td>
                    <td className="p-3 border-b border-white/5 text-right">{2000 - i * 50}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auth / Profile Card */}
        <div className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 hover:border-magma/30 transition-colors">
          <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm border-b border-white/5 pb-2">
            Authentication
          </h3>

          <form className="flex flex-col gap-3">
            <input type="email" placeholder="Email Address" className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-magma outline-none transition-colors" />
            <input type="password" placeholder="Password" className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-magma outline-none transition-colors" />
            <button type="button" className="border border-magma text-magma font-bold uppercase py-2 rounded-lg hover:bg-magma hover:text-white transition-all">
              Log In
            </button>
          </form>

          <div className="text-center text-gray-600 text-sm">&mdash; OR &mdash;</div>

          <button className="w-full border border-ember/50 text-ember font-bold uppercase py-2 rounded-lg hover:bg-ember/10 transition-all">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
