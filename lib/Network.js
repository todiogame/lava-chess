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
        console.log("sending", type, data)
       if (client) client.send(JSON.stringify({ type: type, data: data }))
    }

    static broadcast(game, type, data) {
        console.log("sending", type, data)
        game.clientA.send(JSON.stringify({ type: type, data: data }))
        game.clientB.send(JSON.stringify({ type: type, data: data }))
    }

    static handleMessageFromClient(ws, message) {
        const received = Network.decode(message);

        if (received.type == "ACTION") {
            ws.other.send(Network.encode(received.type, received.data))
        }
    }

    static clientSendAction(action, cell, spellID, direction) {
        console.log("clientSocket", Network.clientSocket) 
        console.log("sending", action, cell)
        let copy = cell ? cell.copy() : undefined;
        Network.clientSocket.send(Network.encode("ACTION", { "kind": action, "cell": copy, "spellID":spellID, "direction":direction}))
    }
}

module.exports = Network;
