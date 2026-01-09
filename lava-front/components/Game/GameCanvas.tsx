"use client";

import { useEffect, useRef, useState } from "react";
import GameHUD from './UI/GameHUD';
import GameInfoBar from './UI/GameInfoBar';
import GameBoard from '@/lib/client/components/GameBoard';

// Legacy global variables mocks
let drawing: any;
let AssetManager: any;
let Network: any;
let config: any;
let Entity: any;
let Playable: any;
let Anim: any;
let logic: any;
let hud: any;
let pickPhase: any;
let turnOrder: any;
let utils: any;
let interfaceLogic: any;
let OngoingGame: any;
let consts: any;

// Game State Globals (Module Scope)
let socket: WebSocket | null = null;
let ongoingGame: any = null;
let TEAM: string = "";

function recreatePlayers(data: any[]) {
    return data.map((p) => {
        let en = new Entity(
            p.entity.id,
            p.entity.name,
            p.entity.team,
            p.entity.auras,
            p.entity.types,
            p.entity.pos,
            p.entity.maxHP,
        );
        return new Playable(en, p.spells);
    });
}

export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState("Initializing...");
    const [isConnected, setIsConnected] = useState(false);
    const [gameStateVersion, setGameStateVersion] = useState(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            window.hoverInfo = {};
            // @ts-ignore
            window.storedData = { username: "Guest", level: 1, elo: 1000 };
            // @ts-ignore
            window.displayAllHP = false;
            // @ts-ignore
            window.enemy = {};
            // @ts-ignore
            window.projectiles = [];
            // @ts-ignore
            window.particles = [];

            // @ts-ignore
            drawing = require("@/lib/client/drawing");
            // @ts-ignore
            AssetManager = require("@/lib/client/AssetManager");
            // @ts-ignore
            Network = require("@/lib/Network");
            // @ts-ignore
            config = require("@/config");
            // @ts-ignore
            Entity = require("@/lib/Entity");
            // @ts-ignore
            Playable = require("@/lib/Playable");
            // @ts-ignore
            Anim = require("@/lib/client/Anim");
            // @ts-ignore
            logic = require("@/lib/gameLogic");
            // @ts-ignore
            hud = { switchToGameMode: () => { }, displayProfiles: () => { }, displayCharacterHUD: () => { }, displayPickCharacterHUD: () => { }, switchToEndGame: () => { }, displayTimeline: () => { }, displayGauge: () => { } };
            // @ts-ignore
            pickPhase = require("@/lib/client/pickPhase");
            // @ts-ignore
            window.pickPhase = pickPhase;
            // @ts-ignore
            turnOrder = require("@/lib/turnOrder");
            // @ts-ignore
            utils = require("@/lib/gameUtils");
            // @ts-ignore
            interfaceLogic = require("@/lib/client/interface");
            // @ts-ignore
            window.interface = interfaceLogic;
            // @ts-ignore
            OngoingGame = require("@/lib/OngoingGame");
            // @ts-ignore
            consts = require("@/lib/const");
            // @ts-ignore
            window.buttonSpell1 = { width: 100, height: 100, w_offset: consts.CANVAS.WIDTH / 10 - 110, h_offset: consts.CANVAS.HEIGHT - 30, borderColor: "yellow", borderColorEnemyTurn: "grey", borderWidth: 5 };
            // @ts-ignore
            window.buttonSpell2 = { width: 50, height: 50, w_offset: consts.CANVAS.WIDTH / 10 - 105, h_offset: 350, borderColor: "yellow", borderColorEnemyTurn: "grey", borderWidth: 5 };
        }

        if (typeof window === "undefined") return;

        setStatus("Loading Assets...");
        AssetManager.downloadAll(() => {
            console.log("Assets loaded within React!");
            drawing.initAssets();
            setStatus("Connecting...");
            connect();
        });

        function connect() {
            if (socket) socket.close();
            let host = config.EXTERNAL_IP_ADDRESS;
            // if (window.location.hostname === 'localhost') host = 'p01--lava-chess--wd56yy4hk9cj.code.run';
            let wsProtocol = host.includes("code.run") ? "wss://" : "ws://";
            let port = (window.location.hostname === 'localhost' && !host.includes("code.run")) ? ':4000' : '';
            host = host.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
            let wsUrl = `${wsProtocol}${host}${port}`;

            socket = new WebSocket(wsUrl);
            socket.onopen = () => {
                console.log("DEBUG: Socket Connected!");
                setIsConnected(true);
                setStatus("Searching for opponent...");
                Network.clientSocket = socket;
            };
            socket.onmessage = (event) => {
                const received = Network.decode(event.data);
                console.log("DEBUG: Socket Message:", received.type);
                if (received.type === "TEAM") { TEAM = received.data;  /* @ts-ignore */ window.TEAM = TEAM; }
                if (received.type === "GAME_MODE" && received.data === consts.GAME_MODE.DRAFT) goGamePickBan();
                if (received.type === "PLAYERS") startGameAfterDraft(ongoingGame, recreatePlayers(received.data));
                if (received.type === "PICKBAN") pickPhase.playAction(received.data, ongoingGame);
                if (received.type === "ACTION") logic.playAction(received.data, ongoingGame);
                if (received.type === "END_GAME") setStatus("Game Over");
            };
            socket.onclose = (event) => {
                console.log("DEBUG: Socket Closed", event.code, event.reason);
                setIsConnected(false);
                setStatus("Disconnected");
            };
            socket.onerror = (error) => {
                console.error("DEBUG: Socket Error", error);
            };
        }

        function goGamePickBan() {
            setStatus("Draft Phase");
            ongoingGame = new OngoingGame(true);
            // @ts-ignore
            window.og = ongoingGame;
            pickPhase.initPickPhase(ongoingGame);
            hud.switchToGameMode();
            if (!ongoingGame.isAnimed) { ongoingGame.isAnimed = true; Anim.mainLoop(ongoingGame); }
        }

        function startGameAfterDraft(og: any, players: any) {
            setStatus("Game Started");
            og.setPLAYERS(players);
            og.PLAYERS = drawing.loadImages(og.PLAYERS);
            turnOrder.beginTurn(og);
            og.popupContent = 'GAME STARTS';
            og.popupTime = og.popupDuration = 2000;
        }

        return () => { if (socket) socket.close(); };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => { if (ongoingGame) setGameStateVersion(v => v + 1); }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center gap-4">

            {/* Game Info Bar - Outside the Arena */}
            <GameInfoBar ongoingGame={ongoingGame} />

            <div className="relative w-full h-full flex flex-col justify-start items-center overflow-hidden bg-black rounded-xl border border-white/10 shadow-2xl">

                <style jsx>{`
                    @keyframes lava-scroll {
                        0% { background-position: 0% 0%; }
                        100% { background-position: 50% 50%; }
                    }
                    @keyframes heat-glow {
                        0%, 100% { opacity: 0.1; }
                        50% { opacity: 0.3; }
                    }
                `}</style>

                {/* REALISTIC LAVA BACKGROUND */}
                {/* Base Texture Layer - Tiled & Moving Slowly */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: "url('./pics/lava_bg_seamless.png')",
                        backgroundSize: '1200px 1200px', // Larger scale for better detail
                        animation: 'lava-scroll 120s linear infinite',
                        filter: 'brightness(1.2) contrast(1.1) saturate(1.5)' // Vivid magma look
                    }}
                />

                {/* Heat/Glow Overlay - Pulsing Orange */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none bg-orange-600 mix-blend-overlay"
                    style={{
                        animation: 'heat-glow 5s ease-in-out infinite'
                    }}
                />

                {/* Vignette for depth */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(transparent_40%,#000000_100%)] opacity-90" />

                {/* Content Container */}
                <div className="relative z-10 w-full h-full flex flex-col items-center">

                    {/* React Game Board */}
                    {ongoingGame && <GameBoard og={ongoingGame} gameStateVersion={gameStateVersion} />}

                    {!status.includes("Started") && !status.includes("Draft") && (
                        <div className="absolute top-10 text-white font-mono z-10 bg-black/50 p-2 rounded">
                            Status: {status} <br />
                            Server: {isConnected ? "Connected" : "Disconnected"}
                        </div>
                    )}
                    {/* Legacy Canvas Removed in favor of GameBoard */}
                    {ongoingGame && <GameHUD ongoingGame={ongoingGame} gameStateVersion={gameStateVersion} />}

                </div>
            </div>
        </div>
    );
}
