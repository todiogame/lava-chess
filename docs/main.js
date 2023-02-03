(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        console.log("Message from server: " + event.data);
    };
}

var button = document.getElementById('connect-button'); // add id="my-button" into html
button.addEventListener('click', connect);
},{}]},{},[1]);
