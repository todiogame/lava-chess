(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Entity = require("./lib/Entity");
const Playable = require("./lib/Playable");
const c = require("./lib/const");
const Anim = require("./lib/client/Anim");
const ordo = require ("./lib/ordo");

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
        const { type, data } = JSON.parse(event.data);

        if (type == "PLAYERS") PLAYERS = goGame(recreatePlayers(data));

    };
}
connect();

function recreatePlayers(data){
    return data.map(p => {
        let en = new Entity(p.entity.name, p.entity.team, p.entity.auras, p.entity.types, p.entity.pos, p.entity.maxHP)
        en.image = new Image();
        en.image.src = en.src;
        return new Playable(en, p.spells) 
    })
}


function goGame( PLAYERS) {
    console.log("recieved all, go game")
    let modeClic = "MOVE"
    let map = ordo.initMap(c.MAP_RADIUS);

    idCurrentPlayer = 0; //start with player1
    currentPlayer = PLAYERS[idCurrentPlayer]

    entities = [];
    PLAYERS.forEach(p => {
        entities.push(p.entity)
    })

    Anim.mainLoop()

}
},{"./lib/Entity":2,"./lib/Playable":4,"./lib/client/Anim":5,"./lib/const":7,"./lib/ordo":8}],2:[function(require,module,exports){
const c =  require('./const.js');

module.exports = class Entity {
    constructor(name, team, auras, types, pos, maxHP,
        ttl, owner, summoner, onDeath, flags) {

        this.name = name,
            this.team = team; //team is a color

        // this.image = new Image();

        this.src = "pics/" + name.toLowerCase() +
            (name.toLowerCase() == "zombie" ? Math.floor(Math.random() * 2) : "")
            + ".png";
        this.auras = auras;
        this.types = [c.ENTITY, ...types]
        this.pos = pos;

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
        Anim.splash(this.pos, "-1")
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
        let targetplayer = findPlayerFromEntity(this)
        if (targetplayer) targetplayer.die();

    }

    isEnemy(otherEntity) {
        if (otherEntity) return this.team != otherEntity.team;
    }
}
},{"./const.js":7}],3:[function(require,module,exports){
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
        this.s = s;
        if (Math.round(q + r + s) !== 0)
            throw "q + r + s must be 0" + q + " " + r + " " + s;
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
const c =  require('./const.js');

module.exports = class Playable {
    constructor(entity, spells) {

        this.name = entity.name;
        this.spells = spells ? spells : [];
        // Object.assign(this.spells, spells);

        this.entity = entity;
        this.entity.types.push(c.PLAYABLE)

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
        checkWinCondition();
        // if we are here, nobody won yet
        if (currentPlayer == this) {
            console.log("as it is " + this.name + " turns but hes dead, he passes")
            passTurn();
        }
    }
}
},{"./const.js":7}],5:[function(require,module,exports){
const drawing = require("./drawing")
const {Point, Hex, Layout} = require("../Hex");
module.exports = class Anim {
    // static mainLoop() {
    //     drawMap();
    //     requestAnimationFrame(Anim.mainLoop);
    // }

// main thread

static mainLoop() {
    drawing.drawMap()
    requestAnimationFrame(Anim.mainLoop);
}

// mainLoop();


    static animateMove(entity, toCell, duration) {
        if (!duration) duration = 5000;

        const fromP = layout.hexToPixel(entity.pos);
        const toP = layout.hexToPixel(toCell)
        Anim.animateImage(entity, fromP.x, fromP.y, toP.x, toP.y, duration)
    }
    // Parameters:
    // - image: the image object to animate
    // - startX: the starting x position of the image
    // - startY: the starting y position of the image
    // - targetX: the target x position of the image
    // - targetY: the target y position of the image
    // - duration: the duration of the animation in milliseconds
    // - canvas: the canvas to draw the image on
    static animateImage(entity, startX, startY, targetX, targetY, duration) {
        let intervalId;
        let image = entity.image;
        let startTime = Date.now();
        let endTime = startTime + duration;
        let currentX = startX;
        let currentY = startY;

        function update() {
            let time = Date.now();
            if (time >= endTime) {
                currentX = targetX;
                currentY = targetY;
                entity.hide = false;
                clearInterval(intervalId);
            } else {
                entity.hide = true;
                let progress = (time - startTime) / duration;
                currentX = startX + (targetX - startX) * progress;
                currentY = startY + (targetY - startY) * progress;
            }
            drawMap()
            ctx.drawImage(image, currentX - SIZE_PERSO / 2, currentY - SIZE_PERSO / 2, SIZE_PERSO, SIZE_PERSO);
        }
        intervalId = setInterval(update, 16);
    }

    static splash(pos, text) {
        {
            // console.log('splash', entity, text)
            const coords = layout.hexToPixel(pos); // {x,y}
            const colors = ['#ffc000', '#ff3b3b', '#ff8400'];
            const bubbles = 25;
    
            const explode = (x, y, text) => {
                let particles = [];
                let ratio = window.devicePixelRatio;
                let c = document.createElement('canvas');
                let ctx = c.getContext('2d');
    
                c.style.position = 'absolute';
                c.style.left = x - 100 + 'px';
                c.style.top = y - 100 + 'px';
                c.style.pointerEvents = 'none';
                c.style.width = 200 + 'px';
                c.style.height = 200 + 'px';
                c.style.zIndex = 100;
                c.width = 200 * ratio;
                c.height = 200 * ratio;
                c.style.zIndex = "9999999"
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
                        gravity: 0.1
                    });
    
                }
    
                render(particles, ctx, c.width, c.height, text);
                setTimeout(() => document.body.removeChild(c), 1000);
            };
    
            const render = (particles, ctx, width, height, text) => {
                requestAnimationFrame(() => render(particles, ctx, width, height, text));
                ctx.clearRect(0, 0, width, height);
                ctx.globalAlpha = 1.0;
                ctx.font = 'bold 48px serif';
                ctx.fillStyle = 'black';
                ctx.fillText(text, width / 4, ctx.textY);
                ctx.textY += height / 100;
                particles.forEach((p, i) => {
                    p.x += p.speed * Math.cos(p.rotation * Math.PI / 180);
                    p.y += p.speed * Math.sin(p.rotation * Math.PI / 180);
    
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
    
            const r = (a, b, c) => parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0));
            explode(coords.x, coords.y, text);
        }
    }
}


},{"../Hex":3,"./drawing":6}],6:[function(require,module,exports){
const {Point, Hex, Layout} = require("../Hex")
const SIZE_PERSO = 64;
const SIZE_TILE = 95;
const THICKNESS = 1;

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

function drawEntities() {
    entities.forEach(e => {if (e.image) drawPerso(e)})
}
function drawPerso(entity) {
    // console.log(entity)
    if (!entity.hide) {
        pPerso = layout.hexToPixel(entity.pos);

        // outline
        ctx.shadowColor = entity.team;
        ctx.shadowBlur = 0;
        for (var x = -THICKNESS; x <= THICKNESS; x++) {
            for (var y = -THICKNESS; y <= THICKNESS; y++) {
                ctx.shadowOffsetX = x;
                ctx.shadowOffsetY = y;
                ctx.drawImage(entity.image, pPerso.x - SIZE_PERSO / 2, pPerso.y - SIZE_PERSO * 3 / 4, SIZE_PERSO, SIZE_PERSO);
            }
        }
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
}

const SCALE = 40;
const SIZE_GLYPH = 64;

let origin = new Point(350, 300)
const layout = new Layout(Layout.pointy, new Point(SCALE, SCALE), origin);
// Create the grid container
const canvas = document.getElementById('canvas');
canvas.width = 700;
canvas.height = 600;

const ctx = canvas.getContext('2d');

const ORANGE = "rgb(255, 65, 0, 0.7)";
const EARTH = "rgb(220, 150, 30)";

const MOVE_HOVER = "rgb(30, 75, 0, 0.5)";
const MOVE_RANGE = "rgb(30, 205, 0, 0.5)";
const SPELL_HOVER = "rgb(255, 0, 0, 0.5)";
const SPELL_RANGE = "rgb(255, 100, 100, 0.4)";
const SPELL_HIT = "rgb(255, 50, 50, 0.5)";

const GLYPH_BLUE = "rgb(50, 150, 255, 0.2)";
const GLYPH_BROWN = "rgb(50, 50, 30, 0.3)";
const GLYPH_ORANGE = "rgb(255, 65, 0, 0.5)";
const GLYPH_PURPLE = "rgb(255,0,255, 0.3)"
const GLYPH_FLOWER = "rgb(30, 205, 50, 0.3)";

const GLYPH_GAZ = "rgb(100, 255, 150, 0.3)";
const GLYPH_PREVIEW = "rgb(255, 65, 0, 0.2)";

let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
let canvasTop = canvas.offsetTop + canvas.clientTop;

function drawMap() {
    if (map) {
        // console.log(map)
        let colorHover = SPELL_HOVER;
        let colorRange = SPELL_RANGE;
        if (modeClic == "MOVE") {
            colorHover = MOVE_HOVER;
            colorRange = MOVE_RANGE;
        }
        ctx.fillStyle = ORANGE
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
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
            if (h.range) paintCell(h, colorRange)
            if (h.hit) paintCell(h, SPELL_HIT)

            if (h.aoe.length) {
                h.aoe.forEach(spell => {
                    paintCell(h, spell.color, spell.glyphIcon)
                })
            }

            if (h.hover) paintCell(h, colorHover)

        })
        drawEntities();
        displayCharacterHUD(currentPlayer)
    }
}

function drawFloor(h) {
    pPerso = layout.hexToPixel(h);
    // tileImage[Math.floor(Math.random() * 4)] //kek
    ctx.drawImage(tileImage[h.rand4], pPerso.x - SIZE_TILE / 2, pPerso.y - SIZE_TILE / 2, SIZE_TILE, SIZE_TILE);
}

function paintCell(mapCell, color, glyphIcon) {

    ctx.fillStyle = color
    ctx.fill();
    if (glyphIcon) {
        let pGlyph = layout.hexToPixel(mapCell);
        ctx.globalAlpha = 0.7;
        ctx.drawImage(glyphIcon, pGlyph.x - SIZE_GLYPH / 2, pGlyph.y - SIZE_GLYPH / 2, SIZE_GLYPH, SIZE_GLYPH);
        ctx.globalAlpha = 1;
    }
}

module.exports = {
    drawMap
};
},{"../Hex":3}],7:[function(require,module,exports){
const s =
    require('./spells.js')

module.exports =
    Object.freeze({
        MAP_RADIUS: 5,
        NB_PAWNS: 4,


        //cell types
        ANY: "ANY",
        LAVA: "LAVA",
        EMPTY: "EMPTY",
        //entities types
        ENTITY: "ENTITY",
        PLAYABLE: "PLAYABLE",
        // summons types
        SHADOW: "SHADOW",
        BOMB: "BOMB",
        INFERNAL: "INFERNAL",
        BARREL: "BARREL",

        //GLYPHS COLORS
ARRAY_GLYPH_COLOR :{
            "GLYPH_BLUE": "rgb(50, 150, 255, 0.2)",
        "GLYPH_BROWN": "rgb(50, 50, 30, 0.3)",
        "GLYPH_ORANGE": "rgb(255, 65, 0, 0.5)",
        "GLYPH_PURPLE": "rgb(255,0,255, 0.3)",
        "GLYPH_FLOWER": "rgb(30, 205, 50, 0.3)",

        "GLYPH_GAZ": "rgb(100, 255, 150, 0.3)",
        "GLYPH_PREVIEW": "rgb(255, 65, 0, 0.2)",
},

        //summons
        TABLE_SUMMONS: {
            "shadow": {
                name: "shadow",
                ttl: -1,
                summonTypes: [this.SHADOW],
                isUnique: true,
            },
            "wall": {
                name: "wall",
                ttl: 1,
                summonTypes: [],
            },
            "tentacle": {
                name: "tentacle",
                ttl: 1,
                summonTypes: [],
                auras: [
                    { name: "Tentacle Hit", dealSpell: s.damage, aoe: "tentacle_hit", isAura: true, glyph: 1, color: "GLYPH_BROWN", }
                ],
            },
            "infernal": {
                name: "Infernal",
                ttl: -1,
                maxHP: 3,
                isUnique: true,
                summonTypes: [this.INFERNAL,this.PLAYABLE],
                auras: [
                    { name: "Flame aura", permanent: true, dealSpell: s.damage, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" }
                ],
                spells: [
                    { passive: true, cooldown: 0, name: "Flame aura", permanent: true, dealSpell: s.damage, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon" },
                    { passive: true, cooldown: 0, name: "" },
                    { passive: true, cooldown: 0, name: "" },

                ]
            },
            "barrel": {
                name: "barrel",
                ttl: -1,
                summonTypes: [this.BARREL],
                maxHP: 1,
                onDeath: s.rasta_barrel_explode,
                auras: [
                    { name: "Barrel AOE preview", permanent: true, dealSpell: s.nothing, aoe: "area_1", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", }
                ],
            },

            "time_machine": {
                name: "time_machine",
                ttl: 1,
                summonTypes: [],
                maxHP: 1,
                auras: [
                    { name: "Time Machine", dealSpell: s.blink, aoe: "single", isAura: true, glyph: 1, color: "GLYPH_PREVIEW", },
                    { name: "Explosion", dealSpell: s.damage, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", },
                ],
            },

            "zombie": {
                name: "Zombie",
                ttl: -1,
                maxHP: 1,
                summonTypes: [this.PLAYABLE],
                auras: [],
                spells: [
                    //just an hud indication, this spell works with the aura
                    { name: "Zombie Attack", dealSpell: s.zombie_attack, range: 1, rangeMin: 1, cooldown: 0, aoe: "single", canTarget: [this.ENTITY] },
                    { passive: true, cooldown: 0, name: "" },
                    { passive: true, cooldown: 0, name: "" },
                ]
            },
        },


        LAVA_SPELL: {
            name: "LAVA_SPELL", dealSpell: s.riseLava, range: 9, aoe: "single", canTarget: [this.EMPTY]
            // color: ORANGE, effect: "lava", glyphIcon: "lavaIcon"
        },
        CHARACTERS: [
            {
                name: "Mage",
                spells: [
                    { name: "Inferno Strike", dealSpell: s.damage, range: 4, rangeMin: 2, cooldown: 1, aoe: "straight_line_inferno", glyph: 1, color: "GLYPH_BROWN", glyphIcon: "damageIcon", canTarget: [this.ANY], description: "Deals damage in a straight line." },
                    { name: "Freezing Curse", dealSpell: s.root, range: 2, rangeMin: 2, cooldown: 3, aoe: "square", canTarget: [this.ANY], description: "Instantly roots targets in a square area." },
                    { name: "Force Wave", dealSpell: s.push, range: 0, cooldown: 2, aoe: "ring_1", canTarget: [this.PLAYABLE], description: "Pushes out anyone around the caster in a ring area." },
                    // { name: "Blink", dealSpell: s.blink, range: 3, cooldown: 3, aoe: "single", glyph: 0, canTarget: [this.EMPTY] },
                ]
            },
            {
                name: "Fisherman",
                spells: [
                    { name: "Bait Hook", dealSpell: s.pull, range: 5, rangeMin: 1, cooldown: 3, aoe: "straight_line", onlyFirst: true, canTarget: [this.ENTITY], description: "Pulls first target in a straight line." },
                    { name: "Fishing Net", dealSpell: s.root, range: 4, cooldown: 2, aoe: "pair", glyph: 1, color: "GLYPH_BLUE", glyphIcon: "rootIcon", canTarget: [this.ANY], description: "Drops a 2-cells net that roots targets who start their turn inside." },
                    { name: "Belly Bump", dealSpell: s.fisherman_push, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", value: "1", canTarget: [this.ENTITY], description: "Pushes target and deals instant damage." },
                    // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, }
                ]
            },
            {
                name: "Golem",
                spells: [
                    { name: "Boulder Smash", dealSpell: s.golem_boulder, range: 4, cooldown: 1, aoe: "single", glyph: 1, color: "GLYPH_ORANGE", onMiss: "lava", glyphIcon: "boulderIcon", canTarget: [this.ANY], description: "Deals damage, but if the cell was empty, rise lava." },
                    { name: "Magma Wall", dealSpell: s.summon, summon: "wall", range: 3, cooldown: 3, aoe: "curly", ttl: 1, canTarget: [this.ANY], description: "Summons a wall in a curly area around a targeted cell." },
                    { name: "Explosion", dealSpell: s.damage, range: 0, cooldown: 2, aoe: "ring_1", isAura: true, glyph: 1, color: "GLYPH_BROWN", canTarget: [this.PLAYABLE], description: "Deals damage around the caster." },
                ]
            },
            {
                name: "Ninja",
                spells: [
                    { name: "Cast Shadow", dealSpell: s.summon, summon:"shadow", range: 2, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [this.EMPTY], description: "Summons a shadow that can cast Spinning Slash." },
                    { name: "Spinning Slash", dealSpell: s.damage, range: 0, cooldown: 2, aoe: "ninja_slash", canTarget: [this.PLAYABLE], description: "Deals instant damage in a circular area around the caster and its shadow." },
                    { name: "Master of Illusion", dealSpell: s.switcheroo, range: 8, cooldown: 2, aoe: "single", canTarget: [this.SHADOW], description: "Swaps the positions of the caster and its shadow." },
                ]
            },
            {
                name: "Demonist",
                spells: [
                    { name: "Spawn Tentacle", dealSpell: s.demo_tentacle, summon:"tentacle", range: 3, rangeMin: 3, cooldown: 1, aoe: "tentacle", onlyFirst: true, canTarget: [this.EMPTY], description: "Spawns a tentacle that damages in a line." },
                    { name: "Summon Infernal", dealSpell: s.summon, summon: "infernal", range: 1, rangeMin: 1, cooldown: 5, aoe: "single", canTarget: [this.EMPTY], description: "Summons an infernal with a burning aura." },
                    { name: "Speed Boost", dealSpell: s.buffPM, range: 1, cooldown: 3, aoe: "single", canTarget: [this.ENTITY], description: "Grants 1 more movement point to an ally." },
                ]
            },
            {
                name: "Rasta",
                spells: [
                    { name: "Gatling Shot", dealSpell: s.damage, range: 9, cooldown: 1, aoe: "line", aoeSize: 5, glyph: 1, canTarget: [this.ANY], color: "GLYPH_BROWN", glyphIcon: "damageIcon", description: "Deals damage in a straight line." },
                    { name: "Rolling Barrel", dealSpell: s.summon, summon: "barrel", range: 2, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [this.EMPTY], description: "Places explosive barrel." },
                    { name: "Jamming Retreat", dealSpell: s.buffPM, value: 2, range: 0, cooldown: 3, aoe: "single", canTarget: [this.ENTITY], description: "Grants 2 more movement points to the caster." },
                ]
            },
            {
                name: "Assassin",
                spells: [
                    { name: "Backstab", dealSpell: s.damage, range: 1, rangeMin: 1, cooldown: 1, aoe: "single", canTarget: [this.ENTITY], description: "Deals instant damage to a single target in close range." },
                    { name: "Silent Bullet", dealSpell: s.damage, range: 3, rangeMin: 3, cooldown: 2, aoe: "single_straight_line", canTarget: [this.ENTITY], description: "Deals instant damage to a single target in a straight line at 3 range." },
                    { name: "Smoke bomb", dealSpell: s.assassin_smokebomb, range: 1, rangeMin: 1, cooldown: 3, aoe: "ring_1_on_self", canTarget: [this.EMPTY], description: "Instantly roots all targets at close range and moves one cell." },
                    // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
                ]
            },
            {
                name: "Time Traveller",
                spells: [
                    { name: "Time Machine", dealSpell: s.summon, summon: "time_machine", range: 3, rangeMin: 1, cooldown: 1, aoe: "single", glyph: 0, canTarget: [this.EMPTY], description: "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location." },
                    { name: "Backwards Hit", dealSpell: s.time_backwards_hit, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [this.ENTITY], description: "Deals instant damage to a single target in close range, the caster then gets pushed backwards." },
                    { name: "Silence Lance", dealSpell: s.silence, range: 3, rangeMin: 0, cooldown: 2, aoe: "handspinner", glyph: 1, color: "GLYPH_PURPLE", glyphIcon: "silenceIcon", canTarget: [this.ANY], description: "Silences in a handspinner area." },
                    // { name: "Mark", damage: 1, range: 4, cooldown: 5, aoe: "single", glyph: 1, description: "Marks a single target within 4 range for additional damage." }
                ]
            },
            {
                name: "Shaman",
                spells: [
                    { name: "Undead Army", dealSpell: s.summon, summon: "zombie", range: 1, rangeMin: 1, cooldown: 3, aoe: "single", canTarget: [this.EMPTY], description: "Summons a zombie." },
                    { name: "Happy Flower", dealSpell: s.shaman_flower, range: 9, rangeMin: 3, cooldown: 2, aoe: "single", glyph: 1, permanent: true, canTarget: [this.EMPTY], color: 'GLYPH_FLOWER', glyphIcon: "flowerIcon", description: "Creates a happy flower that heals and boosts the caster's range when he starts his turn on the glyph." },
                    { name: "Voodoo Curse", dealSpell: s.silence, range: 1, rangeMin: 1, cooldown: 2, aoe: "single", canTarget: [this.PLAYABLE], description: "Instantly silences a single target." },
                ]
            },
        ]
    })
},{"./spells.js":9}],8:[function(require,module,exports){
const {Point, Hex, Layout} = require('./Hex.js');
const c =  require('./const.js');
const Playable = require('./Playable');
const Entity = require('./Entity');

function ordonanceur() {
    initGame();
    map = initMap(c.RADIUS_MAP)
    // pickPerso()
    // placePerso()
}

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
    // map.map(h => h.aoe = []);

    return map;
}

TEST = false;
STARTER = [8, 7, 6, 5]

function initPlayers(nbPions) {

    // modeClic = "MOVE"; //MOVE or SPELL
    // spellID = 0; //0 to 3
    //map
    // map = [];
    // nbPions = 4;

    charactersIds = [];
    if (TEST) charactersIds.push(...STARTER);
    while (charactersIds.length < nbPions) {
        let randomInt = Math.floor(Math.random() * c.CHARACTERS.length);
        if (!charactersIds.includes(randomInt)) {
            charactersIds.push(randomInt);
        }
    }

    const TEAM_A_COLOR = "red"
    const TEAM_B_COLOR = "cyan"
    const MAX_HP_PLAYER = 4;

    PLAYERS = []
    let arrPos = [new Hex(0, -3, 3), new Hex(0, 3, -3), new Hex(3, -3, 0), new Hex(-3, 3, 0)];
    for (let i = 0; i < nbPions; i++) {
        PLAYERS.push(new Playable(new Entity(c.CHARACTERS[charactersIds[i]].name,
            i % 2 ? TEAM_B_COLOR : TEAM_A_COLOR,
            [], [],
            arrPos[i], MAX_HP_PLAYER),
            c.CHARACTERS[charactersIds[i]].spells))
    }
    return PLAYERS;
    // idCurrentPlayer = 0; //start with player1
    // currentPlayer = PLAYERS[idCurrentPlayer]

    // entities = [];
    // PLAYERS.forEach(p => entities.push(p.entity))

}
function playTurn() {
    if (currentPlayer.dead) {
        triggerAOE(currentPlayer);
        passTurn()
    } else {

        console.log('beginTurn ', currentPlayer.name);
        beginTurn(currentPlayer)
        // drawMap()
    }
}


function beginTurn(player) {
    triggerAOE(player);
    tickDownBuffs(player)
    killExpiredSummons(player);
    refreshAuras() //to remove expired auras
    // if (player.team == "PLAYABLE")
    modeClic = "MOVE"
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
                        resolveSpell(h, spellEffect, spellEffect.source.entity);
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

function endGame() { }

function passTurn() {
    endTurn(currentPlayer);
    console.log("pass turn")
    if (PLAYERS.length) {
        idCurrentPlayer++
        if (idCurrentPlayer >= PLAYERS.length) idCurrentPlayer = 0;
        currentPlayer = PLAYERS[idCurrentPlayer]
        playTurn(currentPlayer)
    }
}

function checkWinCondition() { //appelee a la mort d'un joueur
    let listAlive = PLAYERS.filter(p => !p.dead);

    if (listAlive.length == 0) {
        console.log("EVERYBODY IS DEAD")
        alert("EVERYBODY IS DEAD")
        ordonanceur();
    }
    else if (listAlive.length == 1) {
        console.log(listAlive[0].name + " WON THE GAME !")
        alert(listAlive[0].name + " WON THE GAME !")
        ordonanceur();
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
    initMap, initPlayers
};
},{"./Entity":2,"./Hex.js":3,"./Playable":4,"./const.js":7}],9:[function(require,module,exports){

function resolveSpell(cell, spell, casterEntity, direction, mainCell) {
    //direction only use for tentacle now
    targetCell = findMapCell(cell)
    let targetEntity = findEntityOnCell(targetCell);
    let result = spell.dealSpell(targetCell, spell, casterEntity, targetEntity, direction, mainCell)
    checkAnyoneInLava()

    return result;
}
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
function killEntity(entity) {
    let killedPlayer = PLAYERS.find(p => p.entity == entity)
    if (killedPlayer && !killedPlayer.dead) killedPlayer.die()
    entities = entities.filter(e => e != entity)
}

// GENERIC
// deaspell correspond a la fonction du spell 
function nothing(cell, spell, casterEntity, targetEntity) {
}
function damage(cell, spell, casterEntity, targetEntity) {
    if (targetEntity && !targetEntity.isInvulnerable) targetEntity.damage();
}

function pull(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        targetEntity.pos = (cell.subtract(casterEntity.pos)).scale(1 / cell.distance(casterEntity.pos)).add(casterEntity.pos);
        return true
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
            if (isFree(destination)) targetEntity.pos = destination;
        }
    }
}
function salto(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        targetEntity.pos = targetEntity.pos.subtract(casterEntity.pos).halfTurn().add(casterEntity.pos)
    }
}
function switcheroo(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        const save = cell.copy()
        targetEntity.pos = casterEntity.pos
        casterEntity.pos = save;
    }
}

function root(cell, spell, casterEntity, targetEntity) {
    let targetplayer = findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.loseMovePoint(99);
    }
}

function silence(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) targetEntity.auras.push(
        { name: "silence", ttl: 2 }
    );
}

function buffPM(cell, spell, casterEntity, targetEntity) {
    let targetplayer = findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.buffPM(spell.value || 1);
    }
}
function buffPO(cell, spell, casterEntity, targetEntity) {
    let targetplayer = findPlayerFromEntity(targetEntity)
    if (targetplayer) {
        targetplayer.buffPO(spell.value || 1);
    }
}

function riseLava(cell, spell, casterEntity, targetEntity) {
    if (targetEntity) {
        // kill entities on the cell
        killEntity(targetEntity)
    }
    cellM = findMapCell(cell);
    cellM.aoe = []; //remove any aoe. We will rework if we ad a character that can survive lava
    cellM.floor = false;

}

function blink(cell, spell, casterEntity, targetEntity) {
    // if (!targetEntity) //empty cell
    casterEntity.pos = cell;
}

function summon(cell, spell, casterEntity, targetEntity) {
    var summoned;
    if (!targetEntity) { //empty cell
        //if unique summon, kill previous one
        if (spell.summon.isUnique) {
            killEntity(entities.find(e => e.name == spell.summon.name && e.summoner == casterEntity))
        }
        summoned = new Entity(
            spell.summon.name,
            casterEntity.team,
            spell.summon.auras,
            spell.summon.summonTypes,
            cell.copy(),
            spell.summon.maxHP,
            spell.summon.ttl,
            currentPlayer,
            casterEntity,
            spell.summon.onDeath,
            spell.summon.flags,
        )
        if (summoned.auras) summoned.auras.forEach(a => a.source = currentPlayer)

        entities.push(summoned)

        if (summoned.types.includes(PLAYABLE)) {
            let summonedP = new Playable(summoned, spell.summon.spells)
            summonedP.isSummoned = true;
            PLAYERS.splice((idCurrentPlayer + 1) % (PLAYERS.length + 1), 0, summonedP);
        }
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
    casterEntity.die();
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
    let listCells = makeAOEFromCell(casterEntity.pos, "ring_1");
    listCells.forEach(cell => resolveSpell(cell, { dealSpell: damage }, casterEntity))
}

module.exports = {
    resolveSpell,
    findMapCell,
    findEntityOnCell,
    findPlayerFromEntity,
    killEntity,
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
    summon
  };
  
},{}]},{},[1]);
