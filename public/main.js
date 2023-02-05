(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const logic = require("./lib/client/gameLogic")
const Network = require("./lib/Network")
var isAnimed = false;
function connect() {
    var socket = new WebSocket("ws://localhost:8081");

    socket.onopen = function (event) {
        console.log("Connected to server");
        Network.clientSocket = socket;
        console.log("Network.clientSocket", Network.clientSocket)
    };

    socket.onclose = function (event) {
        console.log("Disconnected from server");
    };

    socket.onerror = function (error) {
        console.log("Error: " + error);
    };

    socket.onmessage = function (event) {
        // console.log(event)
        const received = Network.decode(event.data);
        // console.log("received")
        // console.log(received)
        if (received.type == "TEAM") {
            TEAM = received.data;
            console.log("we are team ", TEAM)
        }

        if (received.type == "PLAYERS") {
            PLAYERS = recreatePlayers(received.data)
            goGame();
        }
        if (received.type == "ACTION") {
            logic.playAction(received.data)
        }
    };
}
connect();

function recreatePlayers(data) {
    return data.map(p => {
        let en = new Entity(p.entity.name, p.entity.team, p.entity.auras, p.entity.types, p.entity.pos, p.entity.maxHP)
        return new Playable(en, p.spells)
    })
}


function goGame() {
    // console.log("recieved all, go game")
    CLIENT_SIDE = true;
    map = logic.initMap(c.CONSTANTS.MAP_RADIUS);

    idCurrentPlayer = 0; //start with player1
    currentPlayer = PLAYERS[idCurrentPlayer]

    entities = [];
    projectiles = [];

    PLAYERS.forEach(p => {
        entities.push(p.entity)
    })
    logic.listenToMouse()
    if (!isAnimed) {
        isAnimed = true;
        Anim.mainLoop()
    }
}

},{"./lib/Entity":2,"./lib/Network":4,"./lib/Playable":5,"./lib/client/Anim":7,"./lib/client/gameLogic":9,"./lib/const":11}],2:[function(require,module,exports){
const c = require('./const.js');
const { Hex } = require('./Hex.js');
const utils = require("./gameUtils")

module.exports = class Entity {
    constructor(name, team, auras, types, pos, maxHP,
        ttl, owner, summoner, onDeath, flags) {

        this.name = name;
        this.team = team; //team is a color


        this.src = "pics/" + name.toLowerCase() +
            (name.toLowerCase() == "zombie" ? Math.floor(Math.random() * 2) : "")
            + ".png";
        if ( (typeof window != 'undefined' && window.document) && this.src) {
            this.image = new Image();
            this.image.src = this.src;
        }
        this.auras = auras;
        this.types = [c.TYPES.ENTITY, ...types]
        this.pos = new Hex(pos.q, pos.r, pos.s)

        this.maxHP = maxHP || 4; //every player has got 4 max hp
        this.currentHP = this.maxHP;
        this.isInvulnerable = !maxHP;

        this.ttl = ttl;
        this.owner = owner; //player
        this.summoner = summoner; //entity
        this.onDeath = onDeath;


    }


    damage() { //all spells deal 1 damage in this game
        this.currentHP--;
        console.log(this.name + " suffers damage !! HP:" + this.currentHP + "/" + this.maxHP)
        //traiter la mort
        if (this.currentHP <= 0) this.die();
    }

    heal() { //all spells deal 1 damage in this game
        if (this.currentHP < this.maxHP) this.currentHP++;
        console.log(this.name + " heals !! HP:" + this.currentHP + "/" + this.maxHP)
    }

    die() {
        console.log("entity " + this.name + " is dead...")
        //remove from entities
        entities = entities.filter(e => e != this)
        //cast onDeath();
        if (typeof this.onDeath === 'function') {
            this.onDeath(this)
        }

        //if it is a player, kill the player too
        let targetplayer = utils.findPlayerFromEntity(this)
        if (targetplayer) targetplayer.die();

    }

    isEnemy(otherEntity) {
        if (otherEntity) return this.team != otherEntity.team;
    }
}
},{"./Hex.js":3,"./const.js":11,"./gameUtils":12}],3:[function(require,module,exports){
// Generated code -- CC0 -- No Rights Reserved -- http://www.redblobgames.com/grids/hexagons/
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Hex {
    constructor(q, r, s) {
        this.q = q;
        this.r = r;
        if (s) this.s = s; else this.s = -q -r;
        if (Math.round(this.q + this.r + this.s) !== 0)
            throw "q + r + s must be 0" + this.q + " " + this.r + " " + this.s;
    }
    add(b) {
        return new Hex(this.q + b.q, this.r + b.r, this.s + b.s);
    }
    subtract(b) {
        return new Hex(this.q - b.q, this.r - b.r, this.s - b.s);
    }
    scale(k) {
        return new Hex(this.q * k, this.r * k, this.s * k);
    }
    rotateLeft() {
        return new Hex(-this.s, -this.q, -this.r);
    }
    rotateRight() {
        return new Hex(-this.r, -this.s, -this.q);
    }
    static direction(direction) {
        return Hex.directions[direction];
    }
    neighbor(direction) {
        return this.add(Hex.direction(direction));
    }
    diagonalNeighbor(direction) {
        return this.add(Hex.diagonals[direction]);
    }
    len() {
        return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
    }
    distance(b) {
        return this.subtract(b).len();
    }
    round() {
        var qi = Math.round(this.q);
        var ri = Math.round(this.r);
        var si = Math.round(this.s);
        var q_diff = Math.abs(qi - this.q);
        var r_diff = Math.abs(ri - this.r);
        var s_diff = Math.abs(si - this.s);
        if (q_diff > r_diff && q_diff > s_diff) {
            qi = -ri - si;
        }
        else if (r_diff > s_diff) {
            ri = -qi - si;
        }
        else {
            si = -qi - ri;
        }
        return new Hex(qi, ri, si);
    }
    lerp(b, t) {
        return new Hex(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
    }
    linedraw(b) {
        var N = this.distance(b);
        var a_nudge = new Hex(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
        var b_nudge = new Hex(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
        var results = [];
        var step = 1.0 / Math.max(N, 1);
        for (var i = 0; i <= N; i++) {
            results.push(a_nudge.lerp(b_nudge, step * i).round());
        }
        return results;
    }
    //perso
    isSameLine(b) {
        return this.q == b.q || this.r == b.r || this.s == b.s;
    }
    halfTurn() {
        return this.rotateRight().rotateRight().rotateRight()
    }
    copy() {
        return new Hex(this.q, this.r, this.s);
    }
    equals(b) {
        return this.distance(b) == 0;
    }
    neighbors(b) {
        let commonNeighbors = [];
        for (let i = 0; i < 6; i++) {
            let aNeighbor = this.neighbor(i);
            for (let j = 0; j < 6; j++) {
                let bNeighbor = b.neighbor(j);
                if (aNeighbor.equals(bNeighbor)) {
                    commonNeighbors.push(aNeighbor);
                }
            }
        }
        return commonNeighbors;
    }

    static directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
    static diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];
}
class OffsetCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qoffsetFromCube(offset, h) {
        var col = h.q;
        var row = h.r + (h.q + offset * (h.q & 1)) / 2;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    }
    static qoffsetToCube(offset, h) {
        var q = h.col;
        var r = h.row - (h.col + offset * (h.col & 1)) / 2;
        var s = -q - r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r, s);
    }
    static roffsetFromCube(offset, h) {
        var col = h.q + (h.r + offset * (h.r & 1)) / 2;
        var row = h.r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new OffsetCoord(col, row);
    }
    static roffsetToCube(offset, h) {
        var q = h.col - (h.row + offset * (h.row & 1)) / 2;
        var r = h.row;
        var s = -q - r;
        if (offset !== OffsetCoord.EVEN && offset !== OffsetCoord.ODD) {
            throw "offset must be EVEN (+1) or ODD (-1)";
        }
        return new Hex(q, r, s);
    }
}
OffsetCoord.EVEN = 1;
OffsetCoord.ODD = -1;
class DoubledCoord {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }
    static qdoubledFromCube(h) {
        var col = h.q;
        var row = 2 * h.r + h.q;
        return new DoubledCoord(col, row);
    }
    qdoubledToCube() {
        var q = this.col;
        var r = (this.row - this.col) / 2;
        var s = -q - r;
        return new Hex(q, r, s);
    }
    static rdoubledFromCube(h) {
        var col = 2 * h.q + h.r;
        var row = h.r;
        return new DoubledCoord(col, row);
    }
    rdoubledToCube() {
        var q = (this.col - this.row) / 2;
        var r = this.row;
        var s = -q - r;
        return new Hex(q, r, s);
    }
}
class Orientation {
    constructor(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
        this.f0 = f0;
        this.f1 = f1;
        this.f2 = f2;
        this.f3 = f3;
        this.b0 = b0;
        this.b1 = b1;
        this.b2 = b2;
        this.b3 = b3;
        this.start_angle = start_angle;
    }
}
class Layout {
    constructor(orientation, size, origin) {
        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
    }
    hexToPixel(h) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
        var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    }
    pixelToHex(p) {
        var M = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        var q = M.b0 * pt.x + M.b1 * pt.y;
        var r = M.b2 * pt.x + M.b3 * pt.y;
        return new Hex(q, r, -q - r);
    }
    hexCornerOffset(corner) {
        var M = this.orientation;
        var size = this.size;
        var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6.0;
        return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    }
    polygonCorners(h) {
        var corners = [];
        var center = this.hexToPixel(h);
        for (var i = 0; i < 6; i++) {
            var offset = this.hexCornerOffset(i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }
}
Layout.pointy = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
Layout.flat = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
class Tests {
    constructor() { }
    static equalHex(name, a, b) {
        if (!(a.q === b.q && a.s === b.s && a.r === b.r)) {
            complain(name);
        }
    }
    static equalOffsetcoord(name, a, b) {
        if (!(a.col === b.col && a.row === b.row)) {
            complain(name);
        }
    }
    static equalDoubledcoord(name, a, b) {
        if (!(a.col === b.col && a.row === b.row)) {
            complain(name);
        }
    }
    static equalInt(name, a, b) {
        if (!(a === b)) {
            complain(name);
        }
    }
    static equalHexArray(name, a, b) {
        Tests.equalInt(name, a.length, b.length);
        for (var i = 0; i < a.length; i++) {
            Tests.equalHex(name, a[i], b[i]);
        }
    }
    static testHexArithmetic() {
        Tests.equalHex("hex_add", new Hex(4, -10, 6), new Hex(1, -3, 2).add(new Hex(3, -7, 4)));
        Tests.equalHex("hex_subtract", new Hex(-2, 4, -2), new Hex(1, -3, 2).subtract(new Hex(3, -7, 4)));
    }
    static testHexDirection() {
        Tests.equalHex("hex_direction", new Hex(0, -1, 1), Hex.direction(2));
    }
    static testHexNeighbor() {
        Tests.equalHex("hex_neighbor", new Hex(1, -3, 2), new Hex(1, -2, 1).neighbor(2));
    }
    static testHexDiagonal() {
        Tests.equalHex("hex_diagonal", new Hex(-1, -1, 2), new Hex(1, -2, 1).diagonalNeighbor(3));
    }
    static testHexDistance() {
        Tests.equalInt("hex_distance", 7, new Hex(3, -7, 4).distance(new Hex(0, 0, 0)));
    }
    static testHexRotateRight() {
        Tests.equalHex("hex_rotate_right", new Hex(1, -3, 2).rotateRight(), new Hex(3, -2, -1));
    }
    static testHexRotateLeft() {
        Tests.equalHex("hex_rotate_left", new Hex(1, -3, 2).rotateLeft(), new Hex(-2, -1, 3));
    }
    static testHexRound() {
        var a = new Hex(0.0, 0.0, 0.0);
        var b = new Hex(1.0, -1.0, 0.0);
        var c = new Hex(0.0, -1.0, 1.0);
        Tests.equalHex("hex_round 1", new Hex(5, -10, 5), new Hex(0.0, 0.0, 0.0).lerp(new Hex(10.0, -20.0, 10.0), 0.5).round());
        Tests.equalHex("hex_round 2", a.round(), a.lerp(b, 0.499).round());
        Tests.equalHex("hex_round 3", b.round(), a.lerp(b, 0.501).round());
        Tests.equalHex("hex_round 4", a.round(), new Hex(a.q * 0.4 + b.q * 0.3 + c.q * 0.3, a.r * 0.4 + b.r * 0.3 + c.r * 0.3, a.s * 0.4 + b.s * 0.3 + c.s * 0.3).round());
        Tests.equalHex("hex_round 5", c.round(), new Hex(a.q * 0.3 + b.q * 0.3 + c.q * 0.4, a.r * 0.3 + b.r * 0.3 + c.r * 0.4, a.s * 0.3 + b.s * 0.3 + c.s * 0.4).round());
    }
    static testHexLinedraw() {
        Tests.equalHexArray("hex_linedraw", [new Hex(0, 0, 0), new Hex(0, -1, 1), new Hex(0, -2, 2), new Hex(1, -3, 2), new Hex(1, -4, 3), new Hex(1, -5, 4)], new Hex(0, 0, 0).linedraw(new Hex(1, -5, 4)));
    }
    static testLayout() {
        var h = new Hex(3, 4, -7);
        var flat = new Layout(Layout.flat, new Point(10.0, 15.0), new Point(35.0, 71.0));
        Tests.equalHex("layout", h, flat.pixelToHex(flat.hexToPixel(h)).round());
        var pointy = new Layout(Layout.pointy, new Point(10.0, 15.0), new Point(35.0, 71.0));
        Tests.equalHex("layout", h, pointy.pixelToHex(pointy.hexToPixel(h)).round());
    }
    static testOffsetRoundtrip() {
        var a = new Hex(3, 4, -7);
        var b = new OffsetCoord(1, -3);
        Tests.equalHex("conversion_roundtrip even-q", a, OffsetCoord.qoffsetToCube(OffsetCoord.EVEN, OffsetCoord.qoffsetFromCube(OffsetCoord.EVEN, a)));
        Tests.equalOffsetcoord("conversion_roundtrip even-q", b, OffsetCoord.qoffsetFromCube(OffsetCoord.EVEN, OffsetCoord.qoffsetToCube(OffsetCoord.EVEN, b)));
        Tests.equalHex("conversion_roundtrip odd-q", a, OffsetCoord.qoffsetToCube(OffsetCoord.ODD, OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, a)));
        Tests.equalOffsetcoord("conversion_roundtrip odd-q", b, OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, OffsetCoord.qoffsetToCube(OffsetCoord.ODD, b)));
        Tests.equalHex("conversion_roundtrip even-r", a, OffsetCoord.roffsetToCube(OffsetCoord.EVEN, OffsetCoord.roffsetFromCube(OffsetCoord.EVEN, a)));
        Tests.equalOffsetcoord("conversion_roundtrip even-r", b, OffsetCoord.roffsetFromCube(OffsetCoord.EVEN, OffsetCoord.roffsetToCube(OffsetCoord.EVEN, b)));
        Tests.equalHex("conversion_roundtrip odd-r", a, OffsetCoord.roffsetToCube(OffsetCoord.ODD, OffsetCoord.roffsetFromCube(OffsetCoord.ODD, a)));
        Tests.equalOffsetcoord("conversion_roundtrip odd-r", b, OffsetCoord.roffsetFromCube(OffsetCoord.ODD, OffsetCoord.roffsetToCube(OffsetCoord.ODD, b)));
    }
    static testOffsetFromCube() {
        Tests.equalOffsetcoord("offset_from_cube even-q", new OffsetCoord(1, 3), OffsetCoord.qoffsetFromCube(OffsetCoord.EVEN, new Hex(1, 2, -3)));
        Tests.equalOffsetcoord("offset_from_cube odd-q", new OffsetCoord(1, 2), OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, new Hex(1, 2, -3)));
    }
    static testOffsetToCube() {
        Tests.equalHex("offset_to_cube even-", new Hex(1, 2, -3), OffsetCoord.qoffsetToCube(OffsetCoord.EVEN, new OffsetCoord(1, 3)));
        Tests.equalHex("offset_to_cube odd-q", new Hex(1, 2, -3), OffsetCoord.qoffsetToCube(OffsetCoord.ODD, new OffsetCoord(1, 2)));
    }
    static testDoubledRoundtrip() {
        var a = new Hex(3, 4, -7);
        var b = new DoubledCoord(1, -3);
        Tests.equalHex("conversion_roundtrip doubled-q", a, DoubledCoord.qdoubledFromCube(a).qdoubledToCube());
        Tests.equalDoubledcoord("conversion_roundtrip doubled-q", b, DoubledCoord.qdoubledFromCube(b.qdoubledToCube()));
        Tests.equalHex("conversion_roundtrip doubled-r", a, DoubledCoord.rdoubledFromCube(a).rdoubledToCube());
        Tests.equalDoubledcoord("conversion_roundtrip doubled-r", b, DoubledCoord.rdoubledFromCube(b.rdoubledToCube()));
    }
    static testDoubledFromCube() {
        Tests.equalDoubledcoord("doubled_from_cube doubled-q", new DoubledCoord(1, 5), DoubledCoord.qdoubledFromCube(new Hex(1, 2, -3)));
        Tests.equalDoubledcoord("doubled_from_cube doubled-r", new DoubledCoord(4, 2), DoubledCoord.rdoubledFromCube(new Hex(1, 2, -3)));
    }
    static testDoubledToCube() {
        Tests.equalHex("doubled_to_cube doubled-q", new Hex(1, 2, -3), new DoubledCoord(1, 5).qdoubledToCube());
        Tests.equalHex("doubled_to_cube doubled-r", new Hex(1, 2, -3), new DoubledCoord(4, 2).rdoubledToCube());
    }
    static testAll() {
        Tests.testHexArithmetic();
        Tests.testHexDirection();
        Tests.testHexNeighbor();
        Tests.testHexDiagonal();
        Tests.testHexDistance();
        Tests.testHexRotateRight();
        Tests.testHexRotateLeft();
        Tests.testHexRound();
        Tests.testHexLinedraw();
        Tests.testLayout();
        Tests.testOffsetRoundtrip();
        Tests.testOffsetFromCube();
        Tests.testOffsetToCube();
        Tests.testDoubledRoundtrip();
        Tests.testDoubledFromCube();
        Tests.testDoubledToCube();
    }
}
// Tests
function complain(name) { console.log("FAIL", name); }
// Tests.testAll();

module.exports = {Point, Hex, Layout};


},{}],4:[function(require,module,exports){
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
        // console.log("sending", type, data)
        game.clientA.send(JSON.stringify({ type: type, data: data }))
        game.clientB.send(JSON.stringify({ type: type, data: data }))
    }

    static handleMessageFromClient(ws, message) {
        const received = Network.decode(message);

        if (received.type == "ACTION") {
            //todo check here that someone isn't cheating
            ws.other.send(Network.encode(received.type, received.data))
        }
    }

    static clientSendAction(action, cell, spellID, direction) {
        // console.log("clientSocket", Network.clientSocket) 
        console.log("sending", action, cell)
        let copy = cell ? cell.copy() : undefined;
        Network.clientSocket.send(Network.encode("ACTION", { "kind": action, "cell": copy, "spellID":spellID, "direction":direction}))
    }
}

module.exports = Network;

},{}],5:[function(require,module,exports){
const c =  require('./const.js');
const utils = require("./gameUtils")

module.exports = class Playable {
    constructor(entity, spells) {

        this.name = entity.name;
        this.spells = spells ? spells : [];
        // Object.assign(this.spells, spells);

        this.entity = entity;
        this.entity.types.push(c.TYPES.PLAYABLE)

        this.movePoint = 1;
        if(this.spells) this.spells.forEach(s => {
            s.currentCD = 0;
        });

        this.dead = false;
    }

    buffPM(value) {
        console.log("buff PM " + this.name + " by " + value)
        if (parseInt(value)) this.movePoint += value;
    }

    buffPO(value) {
        console.log("buff PO " + this.name + " by " + value)
        if (parseInt(value)) this.bonusPO = this.bonusPO ? this.bonusPO + value : value;
    }

    loseMovePoint(value) {
        console.log("remove PM from " + this.name)
        if (!parseInt(value)) value = 1;
        this.movePoint -= value;
        if (this.movePoint < 0) this.movePoint = 0;
    }
    root() {
        console.log("remove all PM from " + this.name)
        this.movePoint = 0;
    }

    die() {
        console.log("player " + this.name + " is dead...")
        //kill him and kill babies too
        entities = entities.filter(e => e != this.entity && e.owner != this)
        PLAYERS.forEach(p => {
            if ((!p.dead) && ((p.isSummoned) && (p.entity.owner == this))) {
                p.die();
            }
        })
        this.dead = true;
        utils.checkWinCondition();
        // if we are here, nobody won yet
        if (currentPlayer == this) {
            console.log("as it is " + this.name + " turns but hes dead, he passes")
            passTurn();
        }
    }
}
},{"./const.js":11,"./gameUtils":12}],6:[function(require,module,exports){
const { Point, Hex, Layout } = require("./Hex")
const c = require ("./const")

function makeAOEFromCell(cell, aoe, persoPos, direction, aoeSize) {
    aoeSize = aoeSize || 1;
    var res = [];
    if (AOE[aoe] && AOE[aoe].length) AOE[aoe].forEach(a => res.push(cell.add(a)))
    else {
        if (aoe == "line_from_caster") {
            res = persoPos.linedraw(cell);
            res = res.filter(e => e.q != persoPos.q || e.r != persoPos.r) //remove perso cell
        }
        if (aoe == "straight_line") {
            res = persoPos.linedraw(cell);
            res = res.filter(e => e.q != persoPos.q || e.r != persoPos.r) //remove perso cell
            res = res.filter(e => e.q == persoPos.q || e.r == persoPos.r || e.s == persoPos.s)
        }
        if (aoe == "straight_line_inferno") {
            let dirLine = (cell.subtract(persoPos)).scale(1 / persoPos.distance(cell));
            let found = map.find(b => persoPos.add(dirLine).distance(b) == 0);
            // res = persoPos.linedraw(cell);
            for (let i = 1; i < 5 && found; i++) {
                res.push(found);
                found = map.find(b => found.add(dirLine).distance(b) == 0);
            }
            res.unshift(cell);
            let non = [];
            AOE["area_1"].forEach(a => non.push(persoPos.add(a)))
            res = res.filter(e => !(non.some(n => n.equals(e))))
        }
        if (aoe == "pair") {
            let found = map.find(b => cell.add(direction).distance(b) == 0)
            res = found ? [cell, found] : [cell];
        }
        if (aoe == "square") {
            let found = map.find(b => cell.add(direction).distance(b) == 0)
            let founds = cell.neighbors(found)
            res = [cell, found, ...founds]
        }
        if (aoe == "line") {
            let found = map.find(b => cell.add(direction).distance(b) == 0);
            for (let i = 1; i < aoeSize && found; i++) {
                res.push(found);
                found = map.find(b => found.add(direction).distance(b) == 0);
            }
            res.unshift(cell);
        }
        if (aoe == "curly") {
            let found = map.find(b => cell.add(direction).distance(b) == 0)
            let founds = cell.neighbors(found)
            res = [found, ...founds]
        }
        if (aoe == "handspinner") {
            let indexDir;
            Hex.directions.forEach((d, i) => {
                if (d.equals(direction)) indexDir = i;
            })
            res.push(cell)
            res.push(cell.add(direction))
            res.push(cell.add(Hex.direction((indexDir + 2) % 6)))
            res.push(cell.add(Hex.direction((indexDir + 4) % 6)))

        }
        if (aoe == "ninja_slash") {
            AOE["ring_1"].forEach(a => {
                res.push(cell.add(a))
            })
            const shadow = entities.find(e => e.types.includes(c.TYPES.SHADOW))
            if (shadow) {
                AOE["ring_1"].forEach(a => {
                    if (!persoPos.equals(shadow.pos.add(a))) //remove ninja pos so he doesnt get damage
                        res.push(shadow.pos.add(a))
                })
            }
        }
        if (aoe == "tentacle") {
            let found = map.find(b => cell.add(direction).distance(b) == 0)
            let third;
            if (found) {
                third = map.find(b => found.add(direction).distance(b) == 0)
            }
            res = third ? [cell, found, third] : (found ? [cell, found] : [cell]);
        }
        if (aoe == "tentacle_hit") {
            let found = map.find(b => cell.add(direction).distance(b) == 0)
            let third;
            if (found) {
                third = map.find(b => found.add(direction).distance(b) == 0)
            }
            res = third ? [found, third] : (found ? [found] : []);
        }
        if (aoe == "single_straight_line") {
            AOE["single"].forEach(a => {
                res.push(cell.add(a))
            })
        }
        if (aoe == "ring_1_on_self") {
            AOE["ring_1"].forEach(a => {
                res.push(persoPos.add(a))
            })
        }
    }

    return res;
}


const AOE = {
    "single": [
        new Hex(0, 0, 0),
    ],
    "area_1": [
        new Hex(0, 0, 0),
        new Hex(1, -1, 0),
        new Hex(1, 0, -1),
        new Hex(0, 1, -1),
        new Hex(0, -1, 1),
        new Hex(-1, 1, 0),
        new Hex(-1, 0, 1),
    ],
    "ring_1": [
        new Hex(1, -1, 0),
        new Hex(1, 0, -1),
        new Hex(0, 1, -1),
        new Hex(0, -1, 1),
        new Hex(-1, 1, 0),
        new Hex(-1, 0, 1),
    ],
}


module.exports = {
    makeAOEFromCell
};

},{"./Hex":3,"./const":11}],7:[function(require,module,exports){
const drawing = require("./drawing")

module.exports = class Anim {

    // main thread
  
    static mainLoop() {
        drawing.drawMap();
      requestAnimationFrame(Anim.mainLoop);
    }
  
    static move(entity, cell) {
      entity.lastPos = drawing.layout.hexToPixel(entity.pos);
      entity.movingPos = drawing.layout.hexToPixel(entity.pos);
      entity.goal = drawing.layout.hexToPixel(cell);
      entity.moving = true;
  
      setTimeout(() => {
        entity.moving = false;
      }, 1000);
    }
  
    static launched(summoned, casterEntity, cell) {
      summoned.pos = casterEntity.pos;
      summoned.lastPos = drawing.layout.hexToPixel(casterEntity.pos);
      Anim.move(summoned, cell);
      summoned.pos = cell.copy();
    }
    static fall(spell, cell) {
      //
      const projectile = {
        moving: true,
        glyphIcon: spell.glyphIcon,
        goal: drawing.layout.hexToPixel(cell),
        movingPos: { x: drawing.layout.hexToPixel(cell).x, y: 0 },
        lastPos: { x: drawing.layout.hexToPixel(cell).x, y: 0 },
      };
      drawing.projectiles.push(projectile);
      setTimeout(() => {
        projectile.moving = false;
      }, 700);
    }
  
    static stopAtGoal(movingObject) {
      // Check if the entity or projectile has gone past the goal
  
      if (
        (movingObject.xDirection > 0 &&
          movingObject.movingPos.x > movingObject.goal.x) ||
        (movingObject.xDirection < 0 &&
          movingObject.movingPos.x < movingObject.goal.x)
      ) {
        movingObject.movingPos.x = movingObject.goal.x;
      }
      if (
        (movingObject.yDirection > 0 &&
          movingObject.movingPos.y > movingObject.goal.y) ||
        (movingObject.yDirection < 0 &&
          movingObject.movingPos.y < movingObject.goal.y)
      ) {
        movingObject.movingPos.y = movingObject.goal.y;
      }
      return movingObject.movingPos;
    }
  
    static splash(pos, text = "") {
      {
        // console.log('splash', entity, text)
        const coords = drawing.layout.hexToPixel(pos); // {x,y}
        const colors = ["#ffc000", "#ff3b3b", "#ff8400"];
        const bubbles = 25;
  
        const explode = (x, y, text) => {
          let particles = [];
          let c = document.createElement("canvas");
          let ctx = c.getContext("2d");
  
          c.style.position = "absolute";
          c.style.left = x - 100 + "px";
          c.style.top = y - 100 + "px";
          c.style.pointerEvents = "none";
          c.style.width = 200 + "px";
          c.style.height = 200 + "px";
          c.style.zIndex = 100;
          c.width = 200;
          c.height = 200;
          c.style.zIndex = "9999999";
          ctx.textY = c.height / 2;
          document.body.appendChild(c);
  
          for (var i = 0; i < bubbles; i++) {
            particles.push({
              x: c.width / 2,
              y: c.height / 2,
              radius: r(20, 30),
              color: colors[Math.floor(Math.random() * colors.length)],
              rotation: r(0, 360, true),
              speed: r(8, 12),
              friction: 0.9,
              opacity: r(0, 0.5, true),
              yVel: 0,
              gravity: 0.1,
            });
          }
  
          render(particles, ctx, c.width, c.height, text);
          setTimeout(() => document.body.removeChild(c), 1000);
        };
  
        const render = (particles, ctx, width, height, text) => {
          requestAnimationFrame(() =>
            render(particles, ctx, width, height, text),
          );
          ctx.clearRect(0, 0, width, height);
          ctx.globalAlpha = 1.0;
          ctx.font = "bold 48px serif";
          ctx.fillStyle = "black";
          ctx.fillText(text, width / 4, ctx.textY);
          ctx.textY += height / 100;
          particles.forEach((p, i) => {
            p.x += p.speed * Math.cos((p.rotation * Math.PI) / 180);
            p.y += p.speed * Math.sin((p.rotation * Math.PI) / 180);
  
            p.opacity -= 0.01;
            p.speed *= p.friction;
            p.radius *= p.friction;
            p.yVel += p.gravity;
            p.y += p.yVel;
  
            if (p.opacity < 0 || p.radius < 0) return;
  
            ctx.beginPath();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
            ctx.fill();
          });
  
          return ctx;
        };
  
        const r = (a, b, c) =>
          parseFloat(
            (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
              c ? c : 0,
            ),
          );
        explode(coords.x, coords.y, text);
      }
    }
  
    static splash_invo(pos) {
      {
        const coords = drawing.layout.hexToPixel(pos); // {x,y}
        const colors = ["#394053", "#4E4A59", "#6E6362", "#839073", "#7CAE7A"];
        const bubbles = 50;
  
        const explode = (x, y) => {
          let particles = [];
          let c = document.createElement("canvas");
          let ctx = c.getContext("2d");
  
          c.style.position = "absolute";
          c.style.left = x - 100 + "px";
          c.style.top = y - 100 + "px";
          c.style.pointerEvents = "none";
          c.style.width = 200 + "px";
          c.style.height = 200 + "px";
          c.style.zIndex = 100;
          c.width = 200;
          c.height = 200;
          c.style.zIndex = "9999999";
          let startY = (c.height * 6) / 10;
          ctx.textY = startY;
          document.body.appendChild(c);
  
          for (var i = 0; i < bubbles; i++) {
            particles.push({
              x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
              y: r(startY * 0.9, startY * 1.2),
              radius: r(20, 40),
              color: colors[Math.floor(Math.random() * colors.length)],
              speed: r(2, 3),
              opacity: r(0.5, 1, true),
            });
          }
  
          render(particles, ctx, c.width, c.height);
          setTimeout(() => document.body.removeChild(c), 1000);
        };
  
        const render = (particles, ctx, width, height) => {
          requestAnimationFrame(() => render(particles, ctx, width, height));
          ctx.clearRect(0, 0, width, height);
  
          particles.forEach((p, i) => {
            var x = p.x;
            var y = p.y;
            var width = p.radius;
            var height = p.radius;
  
            p.y -= p.speed;
            //p.x += p.speed * Math.sin(p.rotation * Math.PI / 180);
  
            p.opacity -= 0.01;
  
            if (p.opacity < 0 || p.radius < 0) return;
  
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = p.opacity;
            var topCurveHeight = height * 0.3;
            ctx.moveTo(x, y + topCurveHeight);
  
            ctx.beginPath();
            ctx.strokeRect(r(50, 140), r(50, 140), r(1, 20), r(1, 20));
  
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
          });
  
          return ctx;
        };
  
        const r = (a, b, c) =>
          parseFloat(
            (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
              c ? c : 0,
            ),
          );
        explode(coords.x, coords.y);
      }
    }
    static splash_flash(pos) {
      {
        const coords = drawing.layout.hexToPixel(pos); // {x,y}
        const colors = ["#fff"];
        const bubbles = 20;
  
        const explode = (x, y) => {
          let particles = [];
          let c = document.createElement("canvas");
          let ctx = c.getContext("2d");
  
          c.style.position = "absolute";
          c.style.left = x - 100 + "px";
          c.style.top = y - 100 + "px";
          c.style.pointerEvents = "none";
          c.style.width = 200 + "px";
          c.style.height = 200 + "px";
          c.style.zIndex = 100;
          c.width = 200;
          c.height = 200;
          c.style.zIndex = "9999999";
          let startY = (c.height * 6) / 10;
          ctx.textY = startY;
          document.body.appendChild(c);
  
          for (var i = 0; i < bubbles; i++) {
            particles.push({
              x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
              y: r(startY * 0.9, startY * 1.2),
              radius: r(20, 40),
              color: colors[Math.floor(Math.random() * colors.length)],
              speed: r(2, 3),
              opacity: r(0.5, 1, true),
            });
          }
  
          render(particles, ctx, c.width, c.height);
          setTimeout(() => document.body.removeChild(c), 1000);
        };
  
        const render = (particles, ctx, width, height) => {
          requestAnimationFrame(() => render(particles, ctx, width, height));
          ctx.clearRect(0, 0, width, height);
  
          particles.forEach((p, i) => {
            var x = p.x;
            var y = p.y;
            var width = p.radius;
            var height = p.radius;
  
            p.y -= p.speed;
            //p.x += p.speed * Math.sin(p.rotation * Math.PI / 180);
  
            p.opacity -= 0.01;
  
            if (p.opacity < 0 || p.radius < 0) return;
  
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = p.opacity;
            var topCurveHeight = height * 0.3;
            ctx.moveTo(x, y + topCurveHeight);
  
            ctx.beginPath();
            ctx.strokeRect(r(60, 140), r(50, 140), r(1, 6), r(1, 6));
  
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
          });
  
          return ctx;
        };
  
        const r = (a, b, c) =>
          parseFloat(
            (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
              c ? c : 0,
            ),
          );
        explode(coords.x, coords.y);
      }
    }
  
    static splash_debuff(pos, text, debuff) {
      {
        const coords = drawing.layout.hexToPixel(pos); // {x,y}
        const colorsPM = ["#42612B", "#569629", "#59EB2D", "#9FFF6B", "#7DFF81"];
        const colorsPA = ["#65AFFF", "#335C81", "#274060", "#5899E2", "#1B2845"];
        const colors = debuff == "PM" ? colorsPM : colorsPA;
        const bubbles = 10;
  
        const explode = (x, y, text) => {
          let particles = [];
          let c = document.createElement("canvas");
          let ctx = c.getContext("2d");
  
          c.style.position = "absolute";
          c.style.left = x - 100 + "px";
          c.style.top = y - 100 + "px";
          c.style.pointerEvents = "none";
          c.style.width = 200 + "px";
          c.style.height = 200 + "px";
          c.style.zIndex = 100;
          c.width = 200;
          c.height = 200;
          c.style.zIndex = "9999999";
          let startY = (c.height * 6) / 10;
          ctx.textY = startY;
          document.body.appendChild(c);
  
          for (var i = 0; i < bubbles; i++) {
            particles.push({
              x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
              y: r(startY * 0.9, startY * 1.2),
              radius: r(20, 40),
              color: colors[Math.floor(Math.random() * colors.length)],
              speed: r(2, 3),
              opacity: r(0.5, 1, true),
            });
          }
  
          render(particles, ctx, c.width, c.height, text);
          setTimeout(() => document.body.removeChild(c), 1000);
        };
  
        const render = (particles, ctx, width, height, text) => {
          requestAnimationFrame(() =>
            render(particles, ctx, width, height, text),
          );
          ctx.clearRect(0, 0, width, height);
          ctx.globalAlpha = 1.0;
          ctx.font = "bold 30px serif";
          ctx.fillStyle = "#273919";
          ctx.fillText(text, width / 4, ctx.textY);
          ctx.textY -= height / 100;
          particles.forEach((p, i) => {
            var x = p.x;
            var y = p.y;
            var width = p.radius;
            var height = p.radius;
  
            p.y -= p.speed;
            //p.x += p.speed * Math.sin(p.rotation * Math.PI / 180);
  
            p.opacity -= 0.01;
  
            if (p.opacity < 0 || p.radius < 0) return;
  
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = p.opacity;
            var topCurveHeight = height * 0.3;
            ctx.moveTo(x, y + topCurveHeight);
  
            ctx.beginPath();
  
            ctx.arc(r(60, 140), r(85, 125), r(3, 10), 0, 2 * Math.PI);
  
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
          });
  
          return ctx;
        };
  
        const r = (a, b, c) =>
          parseFloat(
            (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
              c ? c : 0,
            ),
          );
        explode(coords.x, coords.y, text);
      }
    }
    static splash_lava(pos, text = "") {
      {
        const coords = drawing.layout.hexToPixel(pos); // {x,y}
        const colors = ["#FC791C", "#E34000", "#A62002", "#d3a625", "#821E00"];
        const bubbles = 20;
  
        const explode = (x, y, text) => {
          let particles = [];
          let c = document.createElement("canvas");
          let ctx = c.getContext("2d");
  
          c.style.position = "absolute";
          c.style.left = x - 100 + "px";
          c.style.top = y - 100 + "px";
          c.style.pointerEvents = "none";
          c.style.width = 200 + "px";
          c.style.height = 200 + "px";
          c.style.zIndex = 100;
          c.width = 200;
          c.height = 200;
          c.style.zIndex = "9999999";
          let startY = (c.height * 6) / 10;
          ctx.textY = startY;
          document.body.appendChild(c);
  
          for (var i = 0; i < bubbles; i++) {
            particles.push({
              x: r(c.width / 2 - c.width * 0.2, c.width / 2 + c.width * 0.2),
              y: r(startY * 0.9, startY * 1.2),
              radius: r(20, 40),
              color: colors[Math.floor(Math.random() * colors.length)],
              speed: r(2, 3),
              opacity: r(0.5, 1, true),
            });
          }
  
          render(particles, ctx, c.width, c.height, text);
          setTimeout(() => document.body.removeChild(c), 1000);
        };
  
        const render = (particles, ctx, width, height, text) => {
          requestAnimationFrame(() =>
            render(particles, ctx, width, height, text),
          );
          ctx.clearRect(0, 0, width, height);
          ctx.globalAlpha = 1.0;
          ctx.font = "bold 35px serif";
          ctx.fillStyle = "black";
          ctx.fillText(text, width / 4, ctx.textY);
          ctx.textY -= height / 100;
          particles.forEach((p, i) => {
            var x = p.x;
            var y = p.y;
            var width = p.radius;
            var height = p.radius;
  
            p.y -= p.speed;
  
            p.opacity -= 0.01;
  
            if (p.opacity < 0 || p.radius < 0) return;
  
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = p.opacity;
            var topCurveHeight = height * 0.3;
            ctx.moveTo(x, y + topCurveHeight);
  
            ctx.beginPath();
  
            ctx.arc(r(80, 120), r(25, 125), r(3, 10), 0, 2 * Math.PI);
  
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
          });
  
          return ctx;
        };
  
        const r = (a, b, c) =>
          parseFloat(
            (Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(
              c ? c : 0,
            ),
          );
        explode(coords.x, coords.y, text);
      }
    }
  }
  
},{"./drawing":8}],8:[function(require,module,exports){
const { Point, Hex, Layout } = require("../Hex")
const { displayCharacterHUD } = require("./hud")

const SCALE = 40;
const SIZE_GLYPH = 64;
const SIZE_PERSO = 80;
const SIZE_TILE = 95;
const THICKNESS = 1;

let origin = new Point(350, 300)
const layout = new Layout(Layout.pointy, new Point(SCALE, SCALE), origin);
// Create the grid container
var canvas, ctx;
if (typeof window) {
    canvas = document.getElementById('canvas');
    canvas.width = 700;
    canvas.height = 600;

    ctx = canvas.getContext('2d');
}

tile0Image = new Image();
tile0Image.src = "pics/tile0.png"
tile1Image = new Image();
tile1Image.src = "pics/tile1.png"
tile2Image = new Image();
tile2Image.src = "pics/tile2.png"
tile3Image = new Image();
tile3Image.src = "pics/tile3.png"
tileImage = [tile0Image, tile1Image, tile2Image, tile3Image]

//glyphs
damageIcon = new Image();
damageIcon.src = "pics/fire_icon.png";

rootIcon = new Image();
rootIcon.src = "pics/net.png"

silenceIcon = new Image();
silenceIcon.src = "pics/silence.png"

lavaIcon = new Image();
lavaIcon.src = "pics/rising.png"

gasIcon = new Image();
gasIcon.src = "pics/gas.png"

boulderIcon = new Image();
boulderIcon.src = "pics/boulder.png"

flowerIcon = new Image();
flowerIcon.src = "pics/flower.png"

ARRAY_ICONS = {
    "damageIcon": damageIcon,
    "rootIcon": rootIcon,
    "silenceIcon": silenceIcon,
    'gasIcon': gasIcon,
    "boulderIcon": boulderIcon,
    "flowerIcon": flowerIcon
}

const ORANGE = "rgb(255, 65, 0, 0.7)";
const EARTH = "rgb(220, 150, 30)";

const MOVE_HOVER = "rgb(30, 75, 0, 0.5)";
const MOVE_RANGE = "rgb(30, 205, 0, 0.5)";
const SPELL_HOVER = "rgb(255, 0, 0, 0.5)";
const SPELL_RANGE = "rgb(255, 100, 100, 0.4)";
const SPELL_HIT = "rgb(255, 50, 50, 0.5)";
const ARRAY_GLYPH_COLOR = {
    "GLYPH_BLUE": "rgb(50, 150, 255, 0.2)",
    "GLYPH_BROWN": "rgb(50, 50, 30, 0.3)",
    "GLYPH_ORANGE": "rgb(255, 65, 0, 0.5)",
    "GLYPH_PURPLE": "rgb(255,0,255, 0.3)",
    "GLYPH_FLOWER": "rgb(30, 205, 50, 0.3)",
    "GLYPH_GAZ": "rgb(100, 255, 150, 0.3)",
    "GLYPH_PREVIEW": "rgb(255, 65, 0, 0.2)",
};

function drawEntities() {
    entities.forEach(e => { if (e.image) drawPerso(e) })
}

function drawPerso(entity) {
    //   console.log(entity);
    let pPerso;
    if (!entity.hide) {
        pPerso = layout.hexToPixel(entity.pos);

        if (entity.moving) {
            // Moving towards the goal
            entity.xDirection = entity.goal.x - entity.lastPos.x;
            entity.yDirection = entity.goal.y - entity.lastPos.y;
            entity.movingPos.x += entity.xDirection / 20;
            entity.movingPos.y += entity.yDirection / 20;
            pPerso = Anim.stopAtGoal(entity);
        }

        // outline
        ctx.shadowColor = entity.team;
        ctx.shadowBlur = 0;
        for (var x = -THICKNESS; x <= THICKNESS; x++) {
            for (var y = -THICKNESS; y <= THICKNESS; y++) {
                ctx.shadowOffsetX = x;
                ctx.shadowOffsetY = y;
                ctx.drawImage(
                    entity.image,
                    pPerso.x - SIZE_PERSO / 2,
                    pPerso.y - (SIZE_PERSO * 3) / 4,
                    SIZE_PERSO,
                    SIZE_PERSO,
                );
            }
        }
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
}


let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
let canvasTop = canvas.offsetTop + canvas.clientTop;

// Create our image
lava = new Image();
lava.src = './pics/lavasmall.png'

function drawMap() {
    if (map) {
        // console.log(map)
        let colorHoverSpell = SPELL_HOVER;
        let colorRangeSpell = SPELL_RANGE;

        let colorHoverMove = MOVE_HOVER;
        let colorRangeMove = MOVE_RANGE;

        // ctx.fillStyle = ORANGE
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(lava, 0, 0, 700, 600);


        map.forEach(h => {
            // draw Hexagon
            ctx.beginPath();
            let pts = layout.polygonCorners(h)
            pts.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.stroke();
            // if (h.floor) paintCell(h, EARTH)
            if (h.floor) drawFloor(h)
            if (h.rangeMove) paintCell(h, colorRangeMove)
            if (h.rangeSpell) paintCell(h, colorRangeSpell)
            if (h.hit) paintCell(h, SPELL_HIT)

            if (h.aoe.length) {
                h.aoe.forEach(spell => {
                    paintCell(h, ARRAY_GLYPH_COLOR[spell.color], ARRAY_ICONS[spell.glyphIcon])
                })
            }

            if (h.hoverMove) paintCell(h, colorHoverMove)
            if (h.hoverSpell) paintCell(h, colorHoverSpell)

        })
        drawEntities();
        drawProjectiles();
        displayCharacterHUD(currentPlayer)
    }
}

function drawFloor(h) {
    pPerso = layout.hexToPixel(h);
    // tileImage[Math.floor(Math.random() * 4)] //kek
    ctx.drawImage(
      tileImage[h.rand4],
      pPerso.x - SIZE_TILE / 2,
      pPerso.y - SIZE_TILE / 2,
      SIZE_TILE,
      SIZE_TILE,
    );
  }
  
  function paintCell(mapCell, color, glyphIcon) {
    ctx.fillStyle = color;
    ctx.fill();
    if (glyphIcon) {
      let pGlyph = layout.hexToPixel(mapCell);
      ctx.globalAlpha = 0.7;
      ctx.drawImage(
        glyphIcon,
        pGlyph.x - SIZE_GLYPH / 2,
        pGlyph.y - SIZE_GLYPH / 2,
        SIZE_GLYPH,
        SIZE_GLYPH,
      );
      ctx.globalAlpha = 1;
    }
  }


const drawProjectiles = () => {
    // console.log("projectiles", projectiles);
    if (projectiles) {
      projectiles.forEach((e) => {
        if (e.glyphIcon && e.moving) drawProjectile(e);
      });
    }
  };
  
  const drawProjectile = (projectile) => {
    let posProjectile = layout.hexToPixel(projectile.goal);
  
    // Moving towards the goal
    projectile.xDirection = projectile.goal.x - projectile.lastPos.x;
    projectile.yDirection = projectile.goal.y - projectile.lastPos.y;
    projectile.movingPos.x += projectile.xDirection / 20;
    projectile.movingPos.y += projectile.yDirection / 20;
  
    // Check if the projectile has gone past the goal
    posProjectile = Anim.stopAtGoal(projectile);
  
    for (var x = -THICKNESS; x <= THICKNESS; x++) {
      for (var y = -THICKNESS; y <= THICKNESS; y++) {
        ctx.shadowOffsetX = x;
        ctx.shadowOffsetY = y;
        ctx.drawImage(
          projectile.glyphIcon,
          posProjectile.x - SIZE_TILE / 2,
          posProjectile.y - SIZE_TILE / 2,
          SIZE_TILE,
          SIZE_TILE,
        );
      }
    }
  };
  

function findHexFromEvent(eventX, eventY) {
    return layout.pixelToHex(new Point(eventX - canvasLeft, eventY - canvasTop))
}

module.exports = {
    drawMap, findHexFromEvent, origin, layout, canvas, ctx
};
},{"../Hex":3,"./hud":10}],9:[function(require,module,exports){
const { Point, Hex, Layout } = require("../Hex")
const drawing = require("./drawing")
const utils = require("../gameUtils")
const c = require("../const")
const aoes = require("../aoe")
const s = require("../spells")
const Network = require("../Network")
const Anim = require("./Anim")

let modeClic = ""
let spellID = 0;


function initMap(N) {
    map = []
    console.log("init map size ", N)

    for (let q = -N; q <= N; q++) {
        let r1 = Math.max(-N, -q - N);
        let r2 = Math.min(N, -q + N);
        for (let r = r1; r <= r2; r++) {
            map.push(new Hex(q, r, -q - r));
        }
    }

    map.map(h => {
        //add lava
        if (h.len() <= N - 1) h.floor = true;
        //prepare aoe arrays
        h.aoe = []
        //add random id for tiles
        h.rand4 = Math.floor(Math.random() * 4)
    })
    return map;
}

function listenToMouse() {
    modeClic = (TEAM == currentPlayer.entity.team) ? "MOVE" : "";

    canvas.onmousemove = function (e) {
        // console.log("hover")
        map.map(b => b.hoverMove = b.hoverSpell = false)

        let hPtHover = drawing.findHexFromEvent(e.pageX, e.pageY)
        let hPtHoverRound = (hPtHover.round());

        let found = map.find(b => hPtHoverRound.distance(b) == 0);
        if (found) {


            //show move indicator
            if (modeClic == "MOVE" && canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
                found.hoverMove = true;
            }

            //show spell aoe indicator
            else if (modeClic == "SPELL") {
                if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
                    var arrayHighlight = aoes.makeAOEFromCell(found, currentPlayer.spells[spellID].aoe,
                        currentPlayer.entity.pos, findClicDirection(found, hPtHover), currentPlayer.spells[spellID].aoeSize)
                    map.map(h => {
                        arrayHighlight.forEach(element => {
                            if (h.distance(element) == 0) h.hoverSpell = true;
                        });
                    })
                }
            } else if (modeClic == "RISE_LAVA") {
                if (canRiseLava(found)) found.hoverSpell = true;
            }
        }
    }



    canvas.addEventListener('click', function (event) {
        // console.log("click, current modeclilk " + modeClic)
        map.map(h => h.hoverMove = h.hoverSpell = false)

        if (TEAM == currentPlayer.entity.team) {
            let hPtClick = drawing.findHexFromEvent(event.pageX, event.pageY)
            let hPtClickRound = (hPtClick.round());


            let found = map.find(b => hPtClickRound.distance(b) == 0);
            if (found) {
                let direction = findClicDirection(found, hPtClick);
                //if mode move, move
                if (modeClic == "MOVE" && canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
                    currentPlayer.loseMovePoint(); //use PM
                    Network.clientSendAction("MOVE", found)
                    moveEntity(currentPlayer.entity, found)
                }
                if (modeClic == "SPELL") {
                    if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
                        Network.clientSendAction("SPELL", found, spellID, direction)
                        castSpell(currentPlayer.entity, currentPlayer.spells[spellID], found, direction);
                    } else {
                        //cancel spellcast
                        modeClic = "MOVE"
                        cleanRangeAndHover()
                    }
                }
                if (modeClic == "RISE_LAVA" && canRiseLava(found)) {
                    Network.clientSendAction("LAVA", found, spellID)
                    castSpell(currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found,)
                    passTurn();
                }
            }
        } else {
            //not your turn !
            modeClic = ""
            cleanRangeAndHover()
        }
    }, false);

}

function moveEntity(entity, cell) {
    Anim.move(entity, cell);
    //sprlls onmove a remettre pour le gazeur
    // var onMoveSpells = PLAYERS.find(p => p.entity == entity)?.spells.filter(s => s.onMove)
    // if (onMoveSpells.length) onMoveSpells.forEach(s => castSpell(entity, s, cell));
    entity.pos = cell;
    //reset modeclic
    // modeClic = ""
    refreshAuras();
    //clean map from range and hover indicators
    cleanRangeAndHover()
}

function findClicDirection(cell, exactPtH) {
    if (cell && exactPtH) {
        var arrayDistances = []
        Hex.directions.forEach(d => arrayDistances.push(d.distance(exactPtH.subtract(cell))))
        return Hex.directions[arrayDistances.indexOf(Math.min(...arrayDistances))]
    }
}
function castSpell(caster, spell, cell, direction) {
    if (spell.selfCast) cell = caster.pos;
    console.log("CASTING SPELL " + spell.name + " in pos ", cell.q, cell.r, cell.s)

    if (spell.isAura) {
        var spellEffect = {};
        Object.assign(spellEffect, spell);
        spellEffect.source = currentPlayer;
        caster.auras.push(spellEffect)
    } else {
        var arrayAOE = aoes.makeAOEFromCell(cell, spell.aoe, caster.pos, direction, spell.aoeSize)
        // console.log(arrayAOE)
        let alreadyAffected = false
        arrayAOE.forEach(affectedCell => {
            // console.log(alreadyAffected)
            if (!(spell.onlyFirst) || !alreadyAffected) {
                map.map(h => {
                    if (h.distance(affectedCell) == 0) {
                        // instant spell deals their effect instantly
                        if (!spell.glyph) {
                            alreadyAffected = s.resolveSpell(h, spell, caster, direction, cell) ? true : alreadyAffected;
                        }
                        // glyph spells drop a glyph
                        else {
                            var spellEffect = {};
                            Object.assign(spellEffect, spell);
                            spellEffect.source = currentPlayer;
                            if (h.floor && (!spellEffect.permanent || !h.aoe.find(s => s.name == spell.name)))
                                h.aoe.push(spellEffect);
                        }
                    }
                });
            }
        })
    }

    refreshAuras(); //to show new auras
    //spell goes on cooldown
    spell.currentCD = spell.cooldown;
    //reset modeclic
    modeClic = "MOVE"
    //clean map from range and hover indicators
    cleanRangeAndHover()
    //todo rembourser le CD si le spell a foire
}

function refreshAuras() {
    //vide les auras de la map (and remove gas over lava)
    map.forEach(h => h.aoe = h.aoe.filter(aoe => !aoe.isAura && !(!h.floor && aoe.permanent)));
    // boucle sur les entities pour remettre les auras
    entities.forEach(e => {
        if (e.auras?.length) {
            e.auras.forEach(aura => {
                //get aoe from aura
                //calculate destination cells on the map
                let listCells = aoes.makeAOEFromCell(e.pos, aura.aoe, e.pos, aura.direction, aura.aoeSize);
                listCells.forEach(element => {
                    //apply aoe on the map
                    map.forEach(h => {
                        if (h.distance(element) == 0) {
                            //copy aura and push on all cells
                            var spellEffect = {};
                            Object.assign(spellEffect, aura);
                            h.aoe.push(spellEffect);
                        }
                    });
                })
            })
        }
    })
}

function canCast(caster, spell, targetCell) {
    //check range
    if (outOfRange(caster, spell, targetCell)) return false;
    //check affects types :
    let isAffected = false;
    if (spell.canTarget?.includes(c.TYPES.ANY)) {
        isAffected = true;
    } else {
        //targetCell is map cell with info
        var typesCell = new Set()
        if (!targetCell.floor) typesCell.add(c.TYPES.LAVA)
        else {
            let entity = entities.find(e => e.pos.distance(targetCell) == 0)
            if (!entity) typesCell.add(c.TYPES.EMPTY)
            else {
                typesCell.add(c.TYPES.ENTITY)
                entity.types.forEach(item => typesCell.add(item))
            }
        }
        //at this point we have 
        spell.canTarget?.forEach(typesSpell => {
            if (typesCell.has(typesSpell)) isAffected = true;
        });
    }
    return isAffected;
    //add other tests : line of sight, blocked case ?
}
function outOfRange(caster, spell, targetCell) {
    // let casterPlayer = utils.findPlayerFromEntity(caster)
    // let rangeSpell = casterPlayer.bonusPO ? casterPlayer.bonusPO + spell.range : spell.range;
    let rangeSpell = spell.range;
    return (caster.pos.distance(targetCell) > rangeSpell)
        || (spell.rangeMin && caster.pos.distance(targetCell) < spell.rangeMin)
        || ((spell.aoe && spell.aoe.includes("straight_line")) && !(targetCell.isSameLine(caster.pos)));
}

function canMove(entity, posCase, max) {
    //en attendant 1 case max
    if (!posCase.floor) return false;
    if (max > 1) max = 1;
    res = (entity?.pos?.distance(posCase) <= max) && utils.isFree(posCase) && posCase.floor; //and other blocked cases
    return res
}
function canRiseLava(cell) {
    // autorise seulement si la case est a cote de 3 cases de lave
    var res = false;
    if (utils.isFree(cell) && cell.floor && !cell.aoe.find(spell => spell.effect == "lava")) {
        let lavaCells = 0;
        map.forEach(h => {
            if (Hex.directions.find(d => h.distance(d.add(cell)) == 0 && h && !h.floor)) {
                lavaCells++;
            }
        });
        res = lavaCells >= 3;
    }
    return res;
}

function showCastRange() {
    cleanRangeAndHover()
    if (modeClic == "MOVE")
        map.map(h => {
            if (canMove(currentPlayer.entity, h, currentPlayer.movePoint))
                h.rangeMove = true;
        })
    if (modeClic == "SPELL")
        map.map(h => {
            if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], h))
                h.hit = true;
            else if (!outOfRange(currentPlayer.entity, currentPlayer.spells[spellID], h))
                h.rangeSpell = true;
        })
    else if (modeClic == "RISE_LAVA") {
        // any cell that is next to lava and doesnt contain an entity
        map.map(found => {
            if (canRiseLava(found)) found.hit = true;
        })
    }
}
function cleanRangeAndHover() {
    map.map(h => h.hoverMove = h.hoverSpell = h.rangeMove = h.rangeSpell = h.hit = false)
}

function clickSpell(id) {
    modeClic = "SPELL"
    spellID = id
    showCastRange();
}

function clickSpell0() { clickSpell(0) }
function clickSpell1() { clickSpell(1) }
function clickSpell2() { clickSpell(2) }


function clickMove() {
    if (currentPlayer.movePoint) modeClic = "MOVE"
    showCastRange();
}


function clickRiseLava() {
    modeClic = "RISE_LAVA"
    showCastRange();
}

function clickPassTurn() {
    Network.clientSendAction("PASS",)
    passTurn();
}

document.getElementById("move").addEventListener('click', clickMove)
document.getElementById("rise-lava").addEventListener('click', clickRiseLava)
document.getElementById("pass-turn").addEventListener('click', clickPassTurn)
document.getElementById("spell-0").addEventListener('click', clickSpell0)
document.getElementById("spell-1").addEventListener('click', clickSpell1)
document.getElementById("spell-2").addEventListener('click', clickSpell2)

function playTurn() {
    if (currentPlayer.dead) {
        triggerAOE(currentPlayer);
        passTurn()
    } else {
        beginTurn(currentPlayer)
    }
}


function beginTurn(player) {
    console.log("begin turn ", player.name)
    triggerAOE(player);
    tickDownBuffs(player)
    killExpiredSummons(player);
    refreshAuras() //to remove expired auras
    modeClic = (TEAM == currentPlayer.entity.team) ? "MOVE" : "";
}
function endTurn(player) {
    console.log("endturn, refill points for " + player.name)
    player.movePoint = 1;
    reduceCD(player);
}

function triggerAOE(player) {
    if (!(player.isSummoned))
        map.forEach(h => {
            h.aoe = h.aoe.filter(spellEffect => {
                if (spellEffect.source == player) { // on fait peter les glyphes du joueur dont c'est le tour
                    console.log("triggerAOE from " + player.name)
                    spellEffect.glyph -= 1;
                    if (spellEffect.glyph <= 0) { //ils expirent
                        s.resolveSpell(h, spellEffect, spellEffect.source.entity);
                        if (!(spellEffect.permanent)) {
                            return false;
                        }
                    }
                }
                return true;
            })
        })
}

function tickDownBuffs(player) {
    player.entity.auras = player.entity.auras.filter(aura => {
        aura.ttl--
        return (aura.permanent || aura.ttl > 0)
    })
}


function killExpiredSummons(player) {
    entities = entities.filter(e => {
        // console.log("check expire"+e.name)
        // console.log(e)
        if (e.owner == player) {
            e.ttl--
            if (e.ttl == 0) {
                if (e.onDeath) e.onDeath();
                return false
            }
        }
        return true;
    })
}

function reduceCD(player) {
    player.spells.forEach(s => { if (s.currentCD > 0) s.currentCD-- })
}

function passTurn() {
    endTurn(currentPlayer);
    if (PLAYERS.length) {
        idCurrentPlayer++
        if (idCurrentPlayer >= PLAYERS.length) idCurrentPlayer = 0;
        currentPlayer = PLAYERS[idCurrentPlayer]
        playTurn(currentPlayer)
    }
}


function playAction(action) {
    if (action) {
        console.log("play action ", action.kind)
        let found;
        if (action.cell) found = map.find(b => b.equals(action.cell));
        if (found) {
            //action is MOVE, SPELL, or LAVA
            if (action.kind == "MOVE") {
                currentPlayer.loseMovePoint(); //use PM
                moveEntity(currentPlayer.entity, found)
            }
            else if (action.kind == "SPELL") {
                castSpell(currentPlayer.entity, currentPlayer.spells[action.spellID], found, action.direction);

            }
            else if (action.kind == "LAVA") {
                castSpell(currentPlayer.entity, c.GAMEDATA.LAVA_SPELL, found,)
                passTurn();
            }
        }
        else if (action.kind == "PASS") {
            passTurn();

        }
    }
}

module.exports = {
    initMap, listenToMouse, playAction
};
},{"../Hex":3,"../Network":4,"../aoe":6,"../const":11,"../gameUtils":12,"../spells":13,"./Anim":7,"./drawing":8}],10:[function(require,module,exports){

function displayCharacterHUD(player) {
    document.getElementById("team").textContent = (TEAM == player.entity.team) ? "Your turn" : "Enemy's turn";
    document.getElementById("team").style.color = player.entity.team;
  if (player) {
    document.getElementById("name").textContent = player.name;
    document.getElementById("current-hp-text").textContent = `HP: ${player.entity.currentHP}/${player.entity.maxHP}`;
    document.getElementById("hp-value").style.width = `${(player.entity.currentHP / player.entity.maxHP) * 100}%`;
    document.getElementById("move-cooldown").textContent = `${player.movePoint} point`;

    for (let i = 0; i < player.spells.length; i++) {
      let spell = player.spells[i];
      if (spell) {
        let button = document.getElementById(`spell-${i}`);
        button.getElementsByClassName( 'content' )[0].textContent = `${spell.name} ${spell.currentCD > 0 ? spell.currentCD : ''} ${"(" + spell.cooldown + ")"}`;
        button.getElementsByClassName( 'tooltip' )[0].textContent = `${spell.description}`;
        button.setAttribute("data-spell", spell.name);
        if (spell.currentCD > 0 || spell.passive || (player.entity.auras.length && player.entity.auras.some(a => a.name == "silence"))) {
          button.classList.add("disabled");
          button.setAttribute("disabled", true);
        } else {
          button.classList.remove("disabled");
          button.removeAttribute("disabled");
        }
      }
    }
    let moveButton = document.getElementById(`move`);
    if (player.movePoint <= 0) {
      moveButton.classList.add("disabled");
      moveButton.setAttribute("disabled", true);
    } else {
      moveButton.classList.remove("disabled");
      moveButton.removeAttribute("disabled");
    }

    if (player.isSummoned) {
      document.getElementById("rise-lava").style.display = "none";
      document.getElementById("pass-turn").style.display = "block";
    } else {
      document.getElementById("rise-lava").style.display = "block";
    document.getElementById("pass-turn").style.display = "none"; //comment this line to debug pass
    }
  }
  displayTimeline(player);

}


const displayTimeline = (currentP) => {
  const playerHud = document.querySelector("#timeline");
  let playerList = "";

  PLAYERS.forEach(p => {
    if (!p.dead)
      playerList += `<p  ${p == currentP ? `class="highlight"` : ``}>${p.entity.currentHP}/${p.entity.maxHP} - ${p.name}</p>`;

  });

  playerHud.innerHTML = playerList;
};

module.exports = {
  displayCharacterHUD
};
},{}],11:[function(require,module,exports){
const CONSTANTS = Object.freeze({
    MAP_RADIUS: 5,
    NB_PAWNS: 4,

})

const ANIMATIONS = {
    FALL: "FALL",
}

const TYPES = Object.freeze({
    //cell types
    ANY: "ANY",
    LAVA: "LAVA",
    EMPTY: "EMPTY",
    //entities types
    ENTITY: "ENTITY",
    PLAYABLE: "PLAYABLE",
    // summons types
    LAUNCHED : "LAUNCHED", //generic for animation
    SHADOW: "SHADOW",
    BOMB: "BOMB",
    INFERNAL: "INFERNAL",
    BARREL: "BARREL",
})

const GAMEDATA = Object.freeze({
//summons
TABLE_SUMMONS: {
    "shadow": {
        name: "shadow",
            ttl: -1,
                summonTypes: [TYPES.SHADOW, TYPES.LAUNCHED],
                    isUnique: true,
            },
    "wall": {
        name: "wall",
            ttl: 1,
                summonTypes: [TYPES.LAUNCHED],
            },
    "tentacle": {
        name: "tentacle",
            ttl: 1,
                summonTypes: [],
                    auras: [
                        { name: "Tentacle Hit", dealSpell: "damage", aoe: "tentacle_hit", isAura: true, glyph: 1, color: "GLYPH_BROWN", }
                    ],
            },
    "infernal": {
        name: "Infernal",
            ttl: -1,
                maxHP: 3,
                    isUnique: true,
                        summonTypes: [TYPES.INFERNAL, TYPES.PLAYABLE],
                            auras: [
                                { name: "Flame aura", permanent: true, dealSpell: "damage", aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" }
                            ],
                                spells: [
                                    { passive: true, cooldown: 0, name: "Flame aura", permanent: true, dealSpell: "damage", aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" },
                                    { passive: true, cooldown: 0, name: "" },
                                    { passive: true, cooldown: 0, name: "" },

                                ]
    },
    "barrel": {
        name: "barrel",
            ttl: -1,
                summonTypes: [TYPES.BARREL, TYPES.LAUNCHED],
                    maxHP: 1,
                        onDeath: "rasta_barrel_explode",
                            auras: [
                                { name: "Barrel AOE preview", permanent: true, dealSpell: "nothing", aoe: "area_1", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", }
                            ],
            },

    "time_machine": {
        name: "time_machine",
            ttl: 1,
                summonTypes: [TYPES.LAUNCHED],
                    maxHP: 1,
                        auras: [
                            { name: "Time Machine", dealSpell: "blink", aoe: "single", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", },
                            { name: "Explosion", dealSpell: "damage", aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", },
                        ],
            },

    "zombie": {
        name: "Zombie",
            ttl: -1,
                maxHP: 1,
                    summonTypes: [TYPES.PLAYABLE],
                        auras: [],
                            spells: [
                                //just an hud indication, this spell works with the aura
                                { name: "Zombie Attack", dealSpell: "zombie_attack", range: 1, rangeMin: 1, cooldown: 0, aoe: "single", canTarget: [TYPES.ENTITY] },
                                { passive: true, cooldown: 0, name: "" },
                                { passive: true, cooldown: 0, name: "" },
                            ]
    },
},


LAVA_SPELL: {
    name: "LAVA_SPELL", dealSpell: "riseLava", range: 9, aoe: "single", canTarget: [TYPES.EMPTY]
    // color: ORANGE, effect: "lava", glyphIcon: "lavaIcon"
},
CHARACTERS: [
    {
        name: "Mage",
        spells: [
            { name: "Inferno Strike", dealSpell: "damage", range: 4, rangeMin: 2, cooldown: 1, aoe: "straight_line_inferno", glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon", canTarget: [TYPES.ANY], description: "Deals damage in a straight line." },
            { name: "Freezing Curse", dealSpell: "root", range: 2, rangeMin: 2, cooldown: 3, aoe: "square", canTarget: [TYPES.ANY], description: "Instantly roots targets in a square area." },
            { name: "Force Wave", dealSpell: "push", range: 0, cooldown: 2, aoe: "ring_1", canTarget: [TYPES.PLAYABLE], animation: ANIMATIONS.FALL, description: "Pushes out anyone around the caster in a ring area." },
            // { name: "Blink", dealSpell: "blink", range: 3, cooldown: 3, aoe: "single", glyph: 0, canTarget: [TYPES.EMPTY] },
        ]
    },
    {
        name: "Fisherman",
        spells: [
            { name: "Bait Hook", dealSpell: "pull", range: 5, rangeMin: 1, cooldown: 3, aoe: "straight_line", onlyFirst: true, canTarget: [TYPES.ENTITY], description: "Pulls first target in a straight line." },
            { name: "Fishing Net", dealSpell: "root", range: 4, cooldown: 2, aoe: "pair", glyph: 1, color: "GLYPH_BLUE", glyphIcon: "rootIcon", canTarget: [TYPES.ANY], description: "Drops a 2-cells net that roots targets who start their turn inside." },
            { name: "Belly Bump", dealSpell: "fisherman_push", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: "1", canTarget: [TYPES.ENTITY], description: "Pushes target and deals instant damage." },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, }
        ]
    },
    {
        name: "Golem",
        spells: [
            { name: "Boulder Smash", dealSpell: "golem_boulder", range: 4, cooldown: 1, aoe: "single", glyph: 1, color: "GLYPH_ORANGE", onMiss: "lava", glyphIcon: "boulderIcon", canTarget: [TYPES.ANY], animation: ANIMATIONS.FALL, description: "Deals damage, but if the cell was empty, rise lava." },
            { name: "Magma Wall", dealSpell: "summon", summon: "wall", range: 3, cooldown: 3, aoe: "curly", ttl: 1, canTarget: [TYPES.ANY], description: "Summons a wall in a curly area around a targeted cell." },
            { name: "Explosion", dealSpell: "damage", range: 0, cooldown: 2, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", canTarget: [TYPES.PLAYABLE], description: "Deals damage around the caster." },
        ]
    },
    {
        name: "Ninja",
        spells: [
            { name: "Cast Shadow", dealSpell: "summon", summon: "shadow", range: 2, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.EMPTY], description: "Summons a shadow that can cast Spinning Slash." },
            { name: "Spinning Slash", dealSpell: "damage", range: 0, cooldown: 2, aoe: "ninja_slash", canTarget: [TYPES.PLAYABLE], description: "Deals instant damage in a circular area around the caster and its shadow." },
            { name: "Master of Illusion", dealSpell: "switcheroo", range: 8, cooldown: 2, aoe: "single", canTarget: [TYPES.SHADOW], description: "Swaps the positions of the caster and its shadow." },
        ]
    },
    {
        name: "Demonist",
        spells: [
            { name: "Spawn Tentacle", dealSpell: "demo_tentacle", summon: "tentacle", range: 3, rangeMin: 3, cooldown: 1, aoe: "tentacle", onlyFirst: true, canTarget: [TYPES.EMPTY], description: "Spawns a tentacle that damages in a line." },
            { name: "Summon Infernal", dealSpell: "summon", summon: "infernal", range: 1, rangeMin: 1, cooldown: 5, aoe: "single", canTarget: [TYPES.EMPTY], description: "Summons an infernal with a burning aura." },
            { name: "Speed Boost", dealSpell: "buffPM", range: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.ENTITY], description: "Grants 1 more movement point to an ally." },
        ]
    },
    {
        name: "Rasta",
        spells: [
            { name: "Gatling Shot", dealSpell: "damage", range: 9, cooldown: 1, aoe: "line", aoeSize: 5, glyph: 1, canTarget: [TYPES.ANY], color: "GLYPH_BROWN", glyphIcon: "damageIcon", animation: ANIMATIONS.FALL, description: "Deals damage in a straight line." },
            { name: "Rolling Barrel", dealSpell: "summon", summon: "barrel", range: 2, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.EMPTY], description: "Places explosive barrel." },
            { name: "Jamming Retreat", dealSpell: "buffPM", value: 2, range: 0, cooldown: 3, aoe: "single", canTarget: [TYPES.ENTITY], description: "Grants 2 more movement points to the caster." },
        ]
    },
    {
        name: "Assassin",
        spells: [
            { name: "Backstab", dealSpell: "damage", range: 1, rangeMin: 1, cooldown: 1, aoe: "single", canTarget: [TYPES.ENTITY], description: "Deals instant damage to a single target in close range." },
            { name: "Silent Bullet", dealSpell: "damage", range: 3, rangeMin: 3, cooldown: 2, aoe: "single_straight_line", canTarget: [TYPES.ENTITY], description: "Deals instant damage to a single target in a straight line at 3 range." },
            { name: "Smoke bomb", dealSpell: "assassin_smokebomb", range: 1, rangeMin: 1, cooldown: 3, aoe: "ring_1_on_self", canTarget: [TYPES.EMPTY], description: "Instantly roots all targets at close range and moves one cell." },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
        ]
    },
    {
        name: "Time Traveller",
        spells: [
            { name: "Time Machine", dealSpell: "summon", summon: "time_machine", range: 3, rangeMin: 1, cooldown: 1, aoe: "single", glyph: 0, canTarget: [TYPES.EMPTY], description: "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location." },
            { name: "Backwards Hit", dealSpell: "time_backwards_hit", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.ENTITY], description: "Deals instant damage to a single target in close range, the caster then gets pushed backwards." },
            { name: "Silence Lance", dealSpell: "silence", range: 3, rangeMin: 0, cooldown: 2, aoe: "handspinner", glyph: 1, color: "GLYPH_PURPLE", glyphIcon: "silenceIcon", canTarget: [TYPES.ANY], description: "Silences in a handspinner area." },
            // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
        ]
    },
    {
        name: "Shaman",
        spells: [
            { name: "Undead Army", dealSpell: "summon", summon: "zombie", range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [TYPES.EMPTY], description: "Summons a zombie." },
            { name: "Happy Flower", dealSpell: "shaman_flower", range: 9, rangeMin: 3, cooldown: 2, aoe: "single", glyph: 1, permanent: true, canTarget: [TYPES.EMPTY], color: 'GLYPH_FLOWER', glyphIcon: "flowerIcon", description: "Creates a happy flower that heals and boosts the caster's range when he starts his turn on the glyph." },
            { name: "Voodoo Curse", dealSpell: "silence", range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [TYPES.PLAYABLE], description: "Instantly silences a single target." },
        ]
    },
]
    })

module.exports = {
    CONSTANTS, TYPES, GAMEDATA, ANIMATIONS
}
},{}],12:[function(require,module,exports){
//HELPERS
function findMapCell(cell) {
    return map.find(h => h.distance(cell) == 0)
}

function findEntityOnCell(cell) {
    if (cell) return entities.find(e => (e.pos && cell.equals(e.pos)))
}
function findPlayerFromEntity(entity) {
    if (entity) return PLAYERS.find(p => p.entity == entity)
}
function isEntityAlive(entity){
    if (entity) return entities.find(p => p.entity == entity)
}

function isFree(cellToCheck) { //cell contains no entity
    // find cell in map
    let cell = map.find(h => h.distance(cellToCheck) == 0)
    if (!cell) return true
    var res = true;
    entities.forEach(e => {
        if (e.pos.distance(cell) == 0) {
            res = false;
        }
    })
    return res;
}


function checkWinCondition() { //appelee a la mort d'un joueur
    let listAlive = PLAYERS.filter(p => !p.dead);

    if (listAlive.length == 0) {
        console.log("EVERYBODY IS DEAD")
        alert("EVERYBODY IS DEAD")
        // ordonanceur();
    }
    else if (listAlive.length == 1) {
        console.log(listAlive[0].name + " WON THE GAME !")
        alert(listAlive[0].name + " WON THE GAME !")
        // ordonanceur();
    }
    else {
        if (checkSameTeam(listAlive))
            alert(listAlive[0].entity.team.toUpperCase() + " TEAM WON THE GAME !")
    }
}
function checkSameTeam(listAlive) {
    let firstTeam = listAlive[0].entity.team;
    for (let i = 1; i < listAlive.length; i++) {
        if (listAlive[i].entity.team !== firstTeam) {
            return false;
        }
    }
    return true;
}

module.exports = {
    findMapCell,
    findEntityOnCell,
    findPlayerFromEntity,
    isEntityAlive,
    isFree,
    checkWinCondition,
    checkSameTeam,
};

},{}],13:[function(require,module,exports){
const utils = require("./gameUtils")
const aoes = require("./aoe")
const Entity = require("./Entity")
const Playable = require("./Playable")
const c = require("./const")
if (typeof window != 'undefined' && window.document) {
    Anim = require("./client/Anim");
}

function resolveSpell(cell, spellData, casterEntity, direction, mainCell) {
    //direction only use for tentacle now and maincell for assassin smoke bomb
    targetCell = utils.findMapCell(cell)
    let targetEntity = utils.findEntityOnCell(targetCell);
    let realSpell = LIB_SPELLS[spellData.dealSpell]
    console.log("spellData?.animation")
    console.log(spellData)
    if (spellData?.animation) {
        switch (spellData.animation) {
            case c.ANIMATIONS.FALL:
                Anim.fall(spell, cell);
                break;
            //default: nothing
        }
    }
    let result = realSpell(targetCell, spellData, casterEntity, targetEntity, direction, mainCell)
    checkAnyoneInLava()

    return result;
}


// GENERIC
function checkAnyoneInLava() {
    entities = entities.filter(e => {
        found = map.find(h => e.pos.distance(h) == 0)
        if (found && !found.floor) {
            //aie aie aie
            entity.die();
            return false;
        }
        return true;
    })
}
// deaspell correspond a la fonction du spell 
function nothing(cell, spell, casterEntity, targetEntity) {
}
function damage(cell, spell, casterEntity, targetEntity) {
    if (targetEntity && !targetEntity.isInvulnerable) {
        //todo check if we are client or not => will help when server will check actions
        // if (typeof window != 'undefined' && window.document) 
        Anim.splash(targetCell, "-1")
        targetEntity.damage();
    }
}

function pull(cell, spell, casterEntity, targetEntity) {
    const destination = cell
        .subtract(casterEntity.pos)
        .scale(1 / cell.distance(casterEntity.pos))
        .add(casterEntity.pos);
    if (targetEntity) {
        Anim.move(targetEntity, destination);
        targetEntity.pos = destination;
        return true;
    }
    return false;
}
function push(cell, spell, casterEntity, targetEntity) {
    let value = spell.value || 1;
    if (targetEntity) {
        let destination = (targetEntity.pos).copy()
        let direction = (destination.subtract(casterEntity.pos));
        for (let n = 0; n < value; n++) {
            destination = destination.add(direction) //loop for pushing
            if (utils.isFree(destination)) {
                Anim.move(targetEntity, destination);
                targetEntity.pos = destination;
            }
        }
    }
}
function salto(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        const destination = targetEntity.pos
            .subtract(casterEntity.pos)
            .halfTurn()
            .add(casterEntity.pos);
        if (utils.isFree(destination)) {
            Anim.move(targetEntity, destination);
            targetEntity.pos = destination;
        }
    }
}
function switcheroo(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        Anim.splash_flash(cell);
        const save = cell.copy()
        targetEntity.pos = casterEntity.pos
        casterEntity.pos = save;
    }
}

function root(cell, spell, casterEntity, targetEntity) {
    let targetplayer = utils.findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        Anim.splash_debuff(
            cell,
            `-${targetplayer.movePoint > 0 ? targetplayer.movePoint : ""}`,
            "PM",
        );
        targetplayer.loseMovePoint(99);
    }
}

function silence(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
    Anim.splash_debuff(cell, ``, "PA");
        targetEntity.auras.push(
            { name: "silence", ttl: 2 }
        );
    }
}

function buffPM(cell, spell, casterEntity, targetEntity) {
    let targetplayer = utils.findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.buffPM(spell.value || 1);
    Anim.splash_debuff(cell, `+${spell.value || 1}`, "PM");
    }
}
function buffPO(cell, spell, casterEntity, targetEntity) {
    let targetplayer = utils.findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.buffPO(spell.value || 1);
    }
}

function riseLava(cell, spell, casterEntity, targetEntity) {
  Anim.splash_lava(cell);
    if (targetEntity) {
        // kill entities on the cell
        targetEntity.die();
    }
    cellM = utils.findMapCell(cell);
    cellM.aoe = []; //remove any aoe. We will rework if we ad a character that can survive lava
    cellM.floor = false;

}

function blink(cell, spell, casterEntity, targetEntity) {
    // if (!targetEntity) //empty cell
    casterEntity.pos = cell;
  Anim.splash_flash(cell);
    
}

function summon(cell, spell, casterEntity, targetEntity) {
    var summoned;
    let summonData = c.GAMEDATA.TABLE_SUMMONS[spell.summon];
    if (summonData && !targetEntity) { //empty cell
        //if unique summon, kill previous one
        if (summonData.isUnique) {
            let previous = (entities.find(e => e.name == summonData.name && e.summoner == casterEntity))
            if (previous) previous.die()
        }
        summoned = new Entity(
            summonData.name,
            casterEntity.team,
            summonData.auras ? summonData.auras : [],
            summonData.summonTypes ? summonData.summonTypes : [],
            cell.copy(),
            summonData.maxHP,
            summonData.ttl,
            currentPlayer,
            casterEntity,
            summonData.onDeath,
            summonData.flags,
        )
        if (summoned.auras) summoned.auras.forEach(a => a.source = currentPlayer)

        entities.push(summoned)

        if (summoned.types.includes(c.TYPES.PLAYABLE)) {
            let summonedP = new Playable(summoned, summonData.spells)
            summonedP.isSummoned = true;
            PLAYERS.splice((idCurrentPlayer + 1) % (PLAYERS.length + 1), 0, summonedP);
        }
        if (summoned.types.includes(c.TYPES.LAUNCHED)) {
            Anim.launched(summoned, casterEntity, cell);
          } else Anim.splash_invo(cell);
    }
    console.log("SUMMONED ", summoned)
    return summoned;
}

// special for perso
function golem_boulder(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        damage(cell, spell, casterEntity, targetEntity)
    } else {
        riseLava(cell, spell, casterEntity, targetEntity)
    }
}

// add this when we add LOS maybe (ldv)
/*
function fisherman_hook(cell, spell, casterEntity, targetEntity) {
    let res = pull(cell, spell, casterEntity, targetEntity)
    if (casterEntity.isEnemy(targetEntity)) damage(cell, spell, casterEntity, targetEntity)
    return res
}*/

function fisherman_push(cell, spell, casterEntity, targetEntity) {
    damage(cell, spell, casterEntity, targetEntity)
    push(cell, spell, casterEntity, targetEntity)
}

function demo_tentacle(cell, spell, casterEntity, targetEntity, direction) {
    console.log("demo tentacle")
    let tentacle = summon(cell, spell, casterEntity, targetEntity)
    tentacleHit = tentacle.auras.find(a => a.name = "Tentacle Hit")
    tentacleHit.direction = direction;
    tentacleHit.source = currentPlayer;
    return tentacle;
}

function assassin_smokebomb(cell, spell, casterEntity, targetEntity, direction, mainCell) {
    if (targetEntity != casterEntity) root(cell, spell, casterEntity, targetEntity);
    casterEntity.pos = mainCell;
}

function time_backwards_hit(cell, spell, casterEntity, targetEntity) {
    damage(cell, spell, casterEntity, targetEntity)
    push(cell, spell, targetEntity, casterEntity,)
}

function zombie_attack(cell, spell, casterEntity, targetEntity) {
    damage(cell, spell, casterEntity, targetEntity)
    // bugfix : if the zombie is not dead yet after attacking ! (damn barrel)
    if (utils.isEntityAlive) casterEntity.die();
}
function shaman_flower(cell, spell, casterEntity, targetEntity) {
    if (targetEntity == casterEntity) {
        spell.permanent = false;
        //heal
        targetEntity.heal()
        //buff PO
        buffPO(cell, spell, casterEntity, targetEntity)

    }
}
function debuffCD(cell, spell, casterEntity, targetEntity) {

}

//on death spells
function rasta_barrel_explode(casterEntity) {
    console.log("Barrel exploses !")
    let listCells = aoes.makeAOEFromCell(casterEntity.pos, "ring_1");
    listCells.forEach(cell => resolveSpell(cell, { dealSpell: damage }, casterEntity))
}

const LIB_SPELLS = {
    "resolveSpell": resolveSpell,
    "nothing": nothing,
    "damage": damage,
    "pull": pull,
    "push": push,
    "salto": salto,
    "switcheroo": switcheroo,
    "root": root,
    "silence": silence,
    "buffPM": buffPM,
    "buffPO": buffPO,
    "riseLava": riseLava,
    "blink": blink,
    "summon": summon,
    "golem_boulder": golem_boulder,
    "fisherman_push": fisherman_push,
    "demo_tentacle": demo_tentacle,
    "assassin_smokebomb": assassin_smokebomb,
    "time_backwards_hit": time_backwards_hit,
    "zombie_attack": zombie_attack,
    "shaman_flower": shaman_flower,
    "debuffCD": debuffCD,
    "rasta_barrel_explode": rasta_barrel_explode,
}

module.exports = {
    "resolveSpell": resolveSpell,
    nothing,
    damage,
    pull,
    push,
    salto,
    switcheroo,
    root,
    silence,
    buffPM,
    buffPO,
    riseLava,
    blink,
    summon,
    golem_boulder,
    fisherman_push,
    demo_tentacle,
    assassin_smokebomb,
    time_backwards_hit,
    zombie_attack,
    shaman_flower,
    debuffCD,
    rasta_barrel_explode,

};

},{"./Entity":2,"./Playable":5,"./aoe":6,"./client/Anim":7,"./const":11,"./gameUtils":12}]},{},[1]);
