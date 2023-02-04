
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


function broadcast(game, type, data) {
    // console.log("sending type:",type)
    game.clientA.send(JSON.stringify({ type: type, data: data }))
    game.clientB.send(JSON.stringify({ type: type, data: data }))
}

function handleMessage(ws, data){

}


module.exports = {
    getUniqueID, encode, broadcast
};