"use client";

import { useEffect, useRef, useState } from "react";
import GameInfoBar from './UI/GameInfoBar';
import SpellDock from './UI/SpellDock';
import TopBar from './UI/TopBar';
import UnitFrame from './UI/UnitFrame';
import DraftScreen from './UI/DraftScreen';
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

declare global {
    interface Window {
        og: any;
        particles: any[];
        projectiles: any[];
        ARRAY_ICONS: any;
        interface: any;
        hoverInfo: any;
        storedData: any;
        displayAllHP: any;
        enemy: any;
        pickPhase: any;
        buttonSpell1: any;
        buttonSpell2: any;
        TEAM: any;
    }
}

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
            const savedName = typeof localStorage !== 'undefined' ? localStorage.getItem("lava_username") : null;
            // @ts-ignore
            window.storedData = { username: savedName || "Guest", level: 1, elo: 1000 };
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
            // Force production server as requested
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                host = 'p01--lava-chess--wd56yy4hk9cj.code.run';
            }

            let wsProtocol = host.includes("code.run") ? "wss://" : "ws://";
            // Port logic: only add :4000 if we are NOT on the production domain
            const isProd = host.includes("code.run");
            let port = (!isProd && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? ':4000' : '';

            host = host.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
            let wsUrl = `${wsProtocol}${host}${port}`;

            socket = new WebSocket(wsUrl);
            socket.onopen = () => {
                console.log("Socket Connected");
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
            if (ongoingGame) {
                // Anim.mainLoop(ongoingGame); // REMOVED: Legacy loop, replaced by React & EffectsLayer
                // We still rely on EffectsLayer for particle looping
            }
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

    // Layout State Logic
    const isPickPhase = ongoingGame && ongoingGame.isPickPhase;

    return (
        <div className="w-full h-full flex flex-col md:flex-row relative bg-gray-900 overflow-hidden">

            {/* LEFT SIDEBAR (HUD) */}
            <div className="w-full md:w-[350px] md:h-full flex flex-col bg-black/80 md:border-r border-gray-700 z-20 shrink-0 overflow-y-auto relative p-2 gap-2">

                {/* 1. Global Status / Info */}
                <GameInfoBar ongoingGame={ongoingGame} />

                {/* 2. Dynamic Content (Draft or Game) */}
                {ongoingGame && (isPickPhase ? (
                    <DraftScreen ongoingGame={ongoingGame} />
                ) : (
                    <>
                        {/* Player Info & Timer - Stacked */}
                        <div className="relative w-full min-h-[150px]">
                            <TopBar ongoingGame={ongoingGame} />
                        </div>

                        {/* Spacer/Flex Grow */}
                        <div className="flex-grow"></div>

                        {/* Unit Info */}
                        <div className="flex justify-center w-full">
                            <UnitFrame ongoingGame={ongoingGame} />
                        </div>
                    </>
                ))}
            </div>

            {/* RIGHT GAME AREA */}
            <div className="relative flex-grow h-[50vh] md:h-full flex flex-col justify-end items-center overflow-hidden bg-gray-950">

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-0">
                    {/* React Game Board */}
                    {ongoingGame && <GameBoard og={ongoingGame} gameStateVersion={gameStateVersion} />}

                    {!status.includes("Started") && !status.includes("Draft") && (
                        <div className="absolute top-10 text-white font-mono z-10 bg-black/50 p-2 rounded">
                            Status: {status} <br />
                            Server: {isConnected ? "Connected" : "Disconnected"}
                        </div>
                    )}
                </div>

                {/* Spell Dock - Bottom of Game Area, Overlay */}
                <div className="absolute bottom-1 left-0 w-full flex justify-center pb-2 z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        {ongoingGame && !ongoingGame.isPickPhase && (
                            <SpellDock ongoingGame={ongoingGame} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
