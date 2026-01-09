// Shared Network file
// In frontend, we mock/ignore server-side imports
let jwt;
let Encrypt;
let secret;

if (typeof window === "undefined") {
    // We are on server
    // However, this file is in lava-front, which is mostly client.
    // If Next.js SSR runs this, it might fail if jsonwebtoken is not installed.
    // But this file seems to be intended for Client/Shared logic mainly?
    // The previous error was "Can't resolve jsonwebtoken".
    // We should probably just NOT import it if it's absent.
    try {
        jwt = require('jsonwebtoken');
        Encrypt = require("./server/Encrypt");
        secret = Encrypt.secret;
    } catch (e) {
        // Ignore if modules missing (client side build)
    }
}

class Network {
    static clientSocket;

    static getUniqueID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    }

    static encode(type, data) {
        return JSON.stringify({ type: type, data: data })
    }

    static decode(message) {
        let type, data;
        return { type, data } = JSON.parse(message)
    }

    static sendToClient(client, type, data) {
        // console.log("sending", type, data)
        if (client) client.send(JSON.stringify({ type: type, data: data }))
    }

    static broadcast(game, type, data) {
        console.log("sending bc", type, data)
        game.clientA.send(Network.encode(type, data))
        game.clientB.send(Network.encode(type, data))
    }

    static handleMessageFromClient(ws, message) {
        const received = Network.decode(message);
        console.log(received)
        if (received.type == "INFO") {
            if (received.data.userInfo) ws.userInfo = received.data.userInfo;
            //case logged in user
            if (ws.userInfo.token) {
                jwt.verify(ws.userInfo.token, secret, function (err, decoded) {
                    if (err) {
                        console.log('Token verification failed:', err.message);
                    } else {
                        console.log('Token decoded:', decoded);
                        ws.userInfo.userId = decoded.id
                    }
                });
            }
            //case guest user
            if (ws.other) Network.sendToClient(ws.other, "INFO", {
                "userInfo": {
                    username: ws.userInfo.username, level: ws.userInfo.level, elo: ws.userInfo.elo
                }
            })
        }
        if (received.type == "ACTION") {
            //todo check here that someone isn't cheating
            //todo timer
            ws.game.handleAction(ws, received.data)
            ws.other.send(Network.encode(received.type, received.data))
        }
        if (received.type == "PICKBAN") {
            //todo check here that someone isn't cheating
            ws.game.handlePickBanData(ws, received.data)
            if (ws.game.og.isPickPhase) ws.other.send(Network.encode(received.type, received.data))
        }
    }

    static clientSendInfo(data) {
        console.log("sending info")
        Network.clientSocket.send(Network.encode("INFO", data))
    }

    static clientSendGameAction(action, cell, spellID, direction) {
        // console.log("sending", action, cell)
        let copy = cell ? cell.copy() : undefined;
        Network.clientSocket.send(Network.encode("ACTION", { "kind": action, "cell": copy, "spellID": spellID, "direction": direction }))
    }

    static clientSendPickBan(action, cell, entityId,) {
        console.log("sending", action, cell)
        let copy = cell ? cell.copy() : undefined;
        Network.clientSocket.send(Network.encode("PICKBAN", { "kind": action, "cell": copy, "entityId": entityId, }))
    }

    static handleClientRagequit(client) {
        client.other.send(Network.encode("RAGEQUIT"))
    }
}

module.exports = Network;
