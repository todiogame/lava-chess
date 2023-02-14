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
        game.clientA.send(JSON.stringify({ type: type, data: data }))
        game.clientB.send(JSON.stringify({ type: type, data: data }))
    }

    static handleMessageFromClient(ws, message) {
        const received = Network.decode(message);
        if (received.type == "INFO") {
            if(received.data.nickname) ws.nickname = received.data.nickname;
        if(ws.other) Network.sendToClient(ws.other, "INFO", { "nickname": ws.nickname })
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
            ws.other.send(Network.encode(received.type, received.data))
        }
    }

    static clientSendInfo(data) {
        Network.clientSocket.send(Network.encode("INFO", data ))
    }

    static clientSendGameAction(action, cell, spellID, direction) {
        // console.log("sending", action, cell)
        let copy = cell ? cell.copy() : undefined;
        Network.clientSocket.send(Network.encode("ACTION", { "kind": action, "cell": copy, "spellID":spellID, "direction":direction}))
    }

    static clientSendPickBan(action, cell, entityName,) {
        console.log("sending", action, cell)
        let copy = cell ? cell.copy() : undefined;
        Network.clientSocket.send(Network.encode("PICKBAN", { "kind": action, "cell": copy, "entityName":entityName,}))
    }

    static handleClientRagequit(client){
        client.other.send(Network.encode("RAGEQUIT"))
    }
}

module.exports = Network;
