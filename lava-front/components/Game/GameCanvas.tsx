"use client";

import { useEffect, useRef, useState } from "react";

// Legacy global variables mocks
// In the legacy code, these were globals. We attach them to window or keep them module-scoped here if possible.
// Because "client.js" was a top-level script, its vars were pseudo-global.
// We will try to keep them scoped to this component's module for now, 
// but "drawing.js" and others might expect them globally if they were relying on window.
// Based on "client.js", "ongoingGame", "socket", "me", "enemy" seem to be used across files if implicitly passed or global.

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
let storedData: any = null; // Mock for now

// Helper to recreate players (copied from client.js)
function recreatePlayers(data: any[]) {
    // console.log("recreatePlayers", data);
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

    useEffect(() => {
        // --- 1. Dynamic Imports of Legacy Logic ---
        if (typeof window !== "undefined") {
            // @ts-ignore
            window.hoverInfo = {}; // Global expectation from interface.js/drawing.js
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
            // Mock HUD to prevent DOM errors until we rebuild UI in React
            hud = {
                switchToGameMode: () => { console.log("HUD: switchToGameMode") },
                displayProfiles: () => { },
                displayCharacterHUD: () => { },
                displayPickCharacterHUD: () => { },
                switchToEndGame: () => { },
                displayTimeline: () => { },
                displayGauge: () => { }
            };
            // @ts-ignore
            pickPhase = require("@/lib/client/pickPhase");
            // @ts-ignore
            turnOrder = require("@/lib/turnOrder");
            // @ts-ignore
            utils = require("@/lib/gameUtils");
            // @ts-ignore
            interfaceLogic = require("@/lib/client/interface");
            // @ts-ignore
            OngoingGame = require("@/lib/OngoingGame");
            // @ts-ignore
            consts = require("@/lib/const");

            // Define global buttonSpells that interface.js expects
            // @ts-ignore
            window.buttonSpell1 = {
                width: 100,
                height: 100,
                w_offset: consts.CANVAS.WIDTH / 10 - 110,
                h_offset: consts.CANVAS.HEIGHT - 30,
                borderColor: "yellow",
                borderColorEnemyTurn: "grey",
                borderWidth: 5,
            };
            // @ts-ignore
            window.buttonSpell2 = {
                width: 50,
                height: 50,
                w_offset: consts.CANVAS.WIDTH / 10 - 105,
                h_offset: 350,
                borderColor: "yellow",
                borderColorEnemyTurn: "grey",
                borderWidth: 5,
            };

        }

        if (!canvasRef.current) return;

        // --- 2. Setup Canvas & Assets ---
        drawing.setCanvas(canvasRef.current);

        setStatus("Loading Assets...");
        AssetManager.downloadAll(() => {
            console.log("Assets loaded within React!");
            drawing.initAssets();
            setStatus("Connecting...");
            connect();
        });

        // --- 3. Connect Logic (Ported from client.js) ---
        function connect() {
            if (socket) socket.close();

            // Determine Host
            let host = config.EXTERNAL_IP_ADDRESS;
            // Force localhost if running locally for dev
            if (window.location.hostname === 'localhost') {
                host = 'localhost';
            }

            let wsProtocol = 'ws://';
            let port = window.location.hostname === 'localhost' ? ':3001' : ''; // Default Next.js dev port or derived? 
            // Wait, legacy server runs on 8080/80 usually. We need to proxy or connect directly?
            // The config says WEBSOCKET_PORT: 80 or env.
            // For now, let's try to connect to the backend server which we assume is running.
            // If the user hasn't started the backend server, this will fail.
            // Assumption: User is running "node server.js" in the root directory separately, OR we connect to the production server?
            // "config.js" says EXTERNAL_IP_ADDRESS is 'p01--lava-chess...code.run' in prod.
            // Since we are running "npm run dev", we are in dev. EXTERNAL_IP_ADDRESS defaults to 'localhost'.
            // However, the *backend* server needs to be running.
            // Let's assume the user wants to connect to the existing backend logic if they "start" the legacy app?
            // Or maybe we should default to the Prod backend for testing if local backend isn't up?

            // For this step, let's hardcode connecting to the prod backend if localhost fails, or just use config.  
            // Actually, let's respect config.js but note that 'port' might be needed.
            if (host === 'localhost') {
                // FORCE PROD BACKEND for Testing Frontend Logic
                host = 'p01--lava-chess--wd56yy4hk9cj.code.run';
                wsProtocol = 'wss://';
                port = '';
            }

            // Using the existing config logic roughly
            if (config.EXTERNAL_IP_ADDRESS === 'localhost' || config.EXTERNAL_IP_ADDRESS === '127.0.0.1') {
                // Try to connect to generic localhost port 80?
                // Or we could try the production URL if we want to test the frontend immediately.
                // Let's try production for instant gratification if local fails?
                // Be safer: Stick to config.
            }

            // OVERRIDE FOR TESTING: Connect to PROD to verify the frontend works without local backend
            // host = 'p01--lava-chess--wd56yy4hk9cj.code.run';
            // wsProtocol = 'wss://';
            // port = '';

            // Restore legacy logic:
            let wsUrl = `${wsProtocol}${host}${port}`;
            // Detect "p01" to switch to wss
            if (host.includes("code.run")) {
                wsProtocol = "wss://";
                port = "";
                host = host.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
                wsUrl = `${wsProtocol}${host}`;
            }

            console.log("Connecting to: " + wsUrl);

            socket = new WebSocket(wsUrl);

            socket.onopen = (event) => {
                console.log("Connected to server");
                setIsConnected(true);
                setStatus("Searching for opponent...");
                Network.clientSocket = socket;
                // if (storedData) Network.clientSendInfo({ userInfo: storedData });

                // Immediately ask for a quick match to see gameplay
                // Wait for connection to settle?
                // Emulate "Quick Match" button click
                setTimeout(() => {
                    // Need to send QUICK_MATCH or similar?
                    // client.js: document.getElementById("quick-match").addEventListener... -> quickMatch() -> connect()
                    // Actually connect() IS called by quickMatch.
                    // Once connected, the server puts you in matchmaking queue automagically?
                    // Need to check server.js logic? 
                    // Usually just connecting puts you in the lobby.
                    // To start a game we might need to send a message.
                    // But let's see what happens on connect.
                }, 500);
            };

            socket.onmessage = (event) => {
                const received = Network.decode(event.data);
                console.log("received", received.type);

                if (received.type === "TEAM") {
                    TEAM = received.data;
                    // @ts-ignore
                    window.TEAM = TEAM; // Global for drawing/interface
                    console.log("We are team", TEAM);
                }

                if (received.type === "GAME_MODE") {
                    // Default draft
                    if (received.data === consts.GAME_MODE.DRAFT) {
                        goGamePickBan();
                    }
                }

                if (received.type === "PLAYERS") {
                    let players = recreatePlayers(received.data);
                    startGameAfterDraft(ongoingGame, players);
                }

                if (received.type === "PICKBAN") {
                    pickPhase.playAction(received.data, ongoingGame);
                }

                if (received.type === "ACTION") {
                    logic.playAction(received.data, ongoingGame);
                }

                if (received.type === "END_GAME") {
                    // Handle end game
                    setStatus("Game Over");
                }
            };

            socket.onclose = () => {
                console.log("Disconnected");
                setIsConnected(false);
                setStatus("Disconnected");
            };
        }

        // --- 4. Game Logic Functions ---
        function goGamePickBan() {
            setStatus("Draft Phase");
            ongoingGame = new OngoingGame(true);
            // @ts-ignore
            window.og = ongoingGame; // Global for drawing/interface

            pickPhase.initPickPhase(ongoingGame);
            hud.switchToGameMode(); // Might fail if it looks for DOM elements by ID "game-container" etc.

            // Start Animation Loop
            if (!ongoingGame.isAnimed) {
                ongoingGame.isAnimed = true;
                Anim.mainLoop(ongoingGame);
            }

            startInputListeners();
        }

        function startGameAfterDraft(og: any, players: any) {
            setStatus("Game Started");
            og.setPLAYERS(players);
            og.PLAYERS = drawing.loadImages(og.PLAYERS);
            turnOrder.beginTurn(og);
            og.popupContent = 'GAME STARTS';
            og.popupTime = og.popupDuration = 2000;
        }

        // --- 5. Input Listeners ---
        function startInputListeners() {
            if (!canvasRef.current || !ongoingGame) return;
            const canvas = canvasRef.current;

            canvas.onmousemove = (event: MouseEvent) => {
                if (!ongoingGame) return;

                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // --- HUD HOVER LOGIC ---
                // Re-implementing client.js logic here since interface.js is proving hard to patch
                // @ts-ignore
                if (window.hoverInfo) window.hoverInfo.element = undefined;

                if (ongoingGame.currentPlayer && window.hoverInfo) {
                    let usersNextPLayer = utils.findNextPlayer(ongoingGame, TEAM);
                    if (!usersNextPLayer) usersNextPLayer = ongoingGame.PLAYERS.find((p: any) => p.entity.team == TEAM);

                    // Helper to check buttons
                    const checkButtons = (btn: any, player: any, bottom: boolean) => {
                        if (!btn) return;
                        let btnX = btn.w_offset;
                        let btnY = btn.h_offset - btn.height;
                        // Move
                        if (x > btnX && x < btnX + btn.width && y > btnY && y < btnY + btn.height) {
                            window.hoverInfo.element = consts.GAMEDATA.MOVE_SPELL;
                        }
                        // Spells
                        for (let i = 0; i < player.spells.length; i++) {
                            let sBtnX = btn.w_offset + (i + 1) * (btn.width + 10);
                            if (x > sBtnX && x < sBtnX + btn.width && y > btnY && y < btnY + btn.height) {
                                window.hoverInfo.element = player.spells[i];
                            }
                        }
                        // Pass/Lava
                        if (bottom) {
                            let pBtnX = (consts.CANVAS.WIDTH * 7) / 10;
                            if (x > pBtnX && x < pBtnX + btn.width && y > btnY && y < btnY + btn.height) {
                                window.hoverInfo.element = player.isSummoned ? consts.GAMEDATA.PASS_SPELL : consts.GAMEDATA.LAVA_SPELL;
                            }
                        }
                    };

                    if (usersNextPLayer) checkButtons(window.buttonSpell1, usersNextPLayer, true);

                    // Help Button (Display All HP)
                    // drawing.js: drawHelpCircle at c.CANVAS.WIDTH - 330, 110, 150, 150
                    const helpX = consts.CANVAS.WIDTH - 330;
                    const helpY = 110;
                    const helpSize = 150;
                    // @ts-ignore
                    window.hoverInfo.help = false;
                    if (x > helpX && x < helpX + helpSize && y > helpY && y < helpY + helpSize) {
                        // @ts-ignore
                        window.hoverInfo.help = true;
                    }

                    // Selected entity inspection
                    let selected = ongoingGame.entities.find((e: any) => e.selected) || ongoingGame.entities.find((e: any) => e.hovered);
                    if (selected) {
                        let p = utils.findPlayerFromEntity(selected, ongoingGame);
                        if (p && (p !== ongoingGame.currentPlayer || p.entity.team !== TEAM)) {
                            checkButtons(window.buttonSpell2, p, false);
                        }
                    }
                }

                if (ongoingGame.isPickPhase) {
                    pickPhase.onMouseHoverDraft(drawing.findHexFromEvent(event.clientX, event.clientY), ongoingGame);
                } else {
                    interfaceLogic.onMouseHoverGame(drawing.findHexFromEvent(event.clientX, event.clientY), ongoingGame);
                }
            };

            canvas.onclick = (event: MouseEvent) => {
                if (!ongoingGame) return;

                // 1. Check HUD Clicks first (Spells, Pass Turn)
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // --- HUD CLICK LOGIC (Local) ---
                let hudHandled = false;

                if (ongoingGame.currentPlayer) {
                    let usersNextPLayer = utils.findNextPlayer(ongoingGame, TEAM);
                    if (!usersNextPLayer) usersNextPLayer = ongoingGame.PLAYERS.find((p: any) => p.entity.team == TEAM);

                    // Only proceed if we found a player AND valid buttons
                    // @ts-ignore
                    if (usersNextPLayer && window.buttonSpell1) {
                        // @ts-ignore
                        const btn = window.buttonSpell1;
                        let btnX = btn.w_offset;
                        let btnY = btn.h_offset - btn.height;

                        // Move Click
                        if (x > btnX && x < btnX + btn.width && y > btnY && y < btnY + btn.height) {
                            interfaceLogic.clickMove(usersNextPLayer, ongoingGame);
                            hudHandled = true;
                        }

                        // Spells Click
                        if (usersNextPLayer.spells) {
                            for (let i = 0; i < usersNextPLayer.spells.length; i++) {
                                let sBtnX = btn.w_offset + (i + 1) * (btn.width + 10);
                                if (x > sBtnX && x < sBtnX + btn.width && y > btnY && y < btnY + btn.height) {
                                    interfaceLogic.clickSpell(usersNextPLayer, i, ongoingGame);
                                    hudHandled = true;
                                }
                            }
                        }

                        // Pass/Lava Click
                        let pBtnX = (consts.CANVAS.WIDTH * 7) / 10;
                        if (x > pBtnX && x < pBtnX + btn.width && y > btnY && y < btnY + btn.height) {
                            interfaceLogic.clickPassTurnOrRiseLava(usersNextPLayer, ongoingGame);
                            hudHandled = true;
                        }
                    }
                }

                // If HUD handled the click, stop here
                if (hudHandled) {
                    return;
                }

                // 2. Map Clicks (Move, Cast, Select)
                const hex = drawing.findHexFromEvent(event.clientX, event.clientY);
                if (ongoingGame.isPickPhase) {
                    pickPhase.onMouseClicDraft(hex, ongoingGame);
                } else {
                    interfaceLogic.onMouseClicGame(hex, ongoingGame);
                }
            };

        }

        return () => {
            if (socket) socket.close();
            // Cancel anim loop?
        };

    }, []);

    return (
        <div className="relative w-full h-full flex flex-col justify-center items-center bg-black">
            {!status.includes("Started") && !status.includes("Draft") && (
                <div className="absolute top-10 text-white font-mono z-10 bg-black/50 p-2 rounded">
                    Status: {status} <br />
                    Server: {isConnected ? "Connected" : "Disconnected"}
                </div>
            )}

            <canvas
                ref={canvasRef}
                id="canvas"
                className="block shadow-[0_0_20px_rgba(255,69,0,0.5)] rounded-lg cursor-crosshair"
            />
        </div>
    );
}
