
function encode(type, data) {
    // console.log("sending type:",type)
    return JSON.stringify({ type: type, data: data })
}


function broadcast(game, type, data) {
    // console.log("sending type:",type)
    game.clientA.send(JSON.stringify({ type: type, data: data }))
    game.clientB.send(JSON.stringify({ type: type, data: data }))
}


module.exports = {
    encode, broadcast
};