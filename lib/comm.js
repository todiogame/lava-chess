
function getUniqueID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

function encode(type, data) {
    // console.log("sending type:",type)
    return JSON.stringify({ type: type, data: data })
}
function decode(message) {
    // console.log("recieved type:",type)
    return { type, data } = JSON.parse(message)
}

function broadcast(game, type, data) {
    // console.log("sending type:",type)
    game.clientA.send(JSON.stringify({ type: type, data: data }))
    game.clientB.send(JSON.stringify({ type: type, data: data }))
}

function handleMessageFromClient(ws, message) {
    const received = decode(message);

    if (received.type == "ACTION") {
        //check legal : his turn, can cast, cooldowns
        // play on server
        //send to other client
        ws.other.send(encode(received.type, received.data))


        // {"type":"ACTION","data":{"kind":"MOVE", "cell":{"q":0,"r":0,"s":0}}}
    }
}

function clientSendAction(socket, action, cell, spellID, direction) {
    console.log("sending",action,cell)
    let copy = cell ? cell.copy() : undefined;
    socket.send(encode("ACTION", { "kind": action, "cell": copy, "spellID":spellID, "direction":direction}))
}




module.exports = {
    getUniqueID, encode, decode, broadcast, handleMessageFromClient, clientSendAction
};