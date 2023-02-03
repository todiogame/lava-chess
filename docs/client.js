var socket;

function connect() {
    socket = new WebSocket("ws://localhost:8081");

    socket.onopen = function (event) {
        console.log("Connected to server");
    };

    socket.onclose = function (event) {
        console.log("Disconnected from server");
    };

    socket.onerror = function (error) {
        console.log("Error: " + error);
    };

    socket.onmessage = function (event) {
        const {type, data} = JSON.parse(event.data);

        if(type=="map") map = data;
        if(type=="PLAYERS") PLAYERS = data;
    };
}
connect();
// var button = document.getElementById('connect-button'); // add id="my-button" into html
// button.addEventListener('click', connect);