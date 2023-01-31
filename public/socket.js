var webSocket;
var messageDiv;
var textInput;
var hostURL;
var websocketReadyStateArray;
var connectBtn;
var disconnectBtn;

function init() {
    messageDiv = document.getElementById("message");
    textInput = document.getElementById("text");
    hostURL = "ws://localhost:8081";
    websocketReadyStateArray = new Array('Connecting', 'Connected', 'Closing', 'Closed');
    connectBtn = document.getElementById('connect');
    disconnectBtn = document.getElementById('disconnect');
    sendTextBtn = document.getElementById('sendMessage');
    connectBtn.disabled = false;
    sendTextBtn.disabled = true;
    // sendJSONObjectBtn.disabled = true;
    disconnectBtn.disabled = true;
}

function connect() {
    try {
        webSocket = new WebSocket(hostURL);
        messageDiv.innerHTML = "<p>Socket status:" + websocketReadyStateArray[webSocket.readyState] + "</p>";
        webSocket.onopen = function () {
            messageDiv.innerHTML += "<p>Socket status:" + websocketReadyStateArray[webSocket.readyState] + "</p>";
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            sendTextBtn.disabled = true;
        }
        webSocket.onmessage = function (msg) {
            messageDiv.innerHTML += "<p>Server response : " + msg.data + "</p>";
        }
        webSocket.onclose = function () {
            messageDiv.innerHTML += "<p>Socket status:" + websocketReadyStateArray[webSocket.readyState] + "</p>";
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
        }
    } catch (exception) {
        messageDiv.innerHTML += 'Exception happen, ' + exception;
    }
}

function selectAll() {
    textInput.select();
}

function disconnect() {
    webSocket.close();
}
function sendMessage() {
    webSocket.send(textInput.value)
}
