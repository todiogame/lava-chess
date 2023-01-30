let modeClic = "MOVE"; //MOVE or SPELL
let spellID = 0; //0 to 3
//map
N = 5;
let map = [];

// Create our image
let lava = new Image();
lava.src = './lavasmall.png'

const LAVA_SPELL =
    { name: "LAVA_SPELL", range: 99, aoe: "single", delay: 1, color: ORANGE, effect: "lava", glyphIcon: lavaIcon };

let charactersIds = [];
while (charactersIds.length < 4) {
    let randomInt = Math.floor(Math.random() * characters.length);
    if (!charactersIds.includes(randomInt)) {
        charactersIds.push(randomInt);
    }
}



var player1 = new Player(characters[charactersIds[0]], true, {
    pos: new Hex(-3, -1, 4),
})
var player2 = new Player(characters[charactersIds[1]], false, {
    pos: new Hex(3, 1, -4),
})
var player3 = new Player(characters[charactersIds[3]], true, {
    pos: new Hex(-4, 1, 3),
})
var player4 = new Player(characters[charactersIds[2]], false, {
    pos: new Hex(4, -1, -3),
})

var PLAYERS = [
    player1,
    player2,
    player3,
    player4
];
var idCurrentPlayer = 0; //start with player1
var currentPlayer = PLAYERS[idCurrentPlayer]

var entities = [];
PLAYERS.forEach(p => entities.push(p.entity))

displayCharacterHUD(currentPlayer)


Anim.mainLoop()

ordonanceur();

canvas.onmousemove = function (e) {
    console.log("hover")
    map.map(b => b.hover = false)

    var ptHover = new Point(e.pageX - canvasLeft, e.pageY - canvasTop)
    let hPtHover = (layout.pixelToHex(ptHover));
    let hPtHoverRound = (hPtHover.round());

    let found = map.find(b => hPtHoverRound.distance(b) == 0);
    if (found) {


        //show move indicator
        if (modeClic == "MOVE" && canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
            found.hover = true;
        }

        //show spell aoe indicator
        else if (modeClic == "SPELL") {
            if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
                var arrayHighlight = makeAOEFromCell(found, currentPlayer.spells[spellID].aoe, currentPlayer.entity.pos, hPtHover)
                map.map(h => {
                    arrayHighlight.forEach(element => {
                        if (h.distance(element) == 0) h.hover = true;
                    });
                })
            }
        } else if (modeClic == "RISE_LAVA") {
            if (canRiseLava(found)) found.hover = true;
        }
    }
    // drawMap()
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

canvas.addEventListener('click', function (event) {
    console.log("click")
    map.map(h => h.hover = false)

    let ptClick = new Point(event.pageX - canvasLeft, event.pageY - canvasTop)
    let hPtClick = (layout.pixelToHex(ptClick));
    let hPtClickRound = (hPtClick.round());

    let found = map.find(b => hPtClickRound.distance(b) == 0);
    if (found) {
        //if mode move, move
        if (modeClic == "MOVE" && canMove(currentPlayer.entity, found, currentPlayer.movePoint)) {
            currentPlayer.loseMovePoint(); //use PM
            moveEntity(currentPlayer.entity, found)
        }
        if (modeClic == "SPELL" && canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
            castSpell(currentPlayer.entity, currentPlayer.spells[spellID], found, hPtClick);
        }
        if (modeClic == "RISE_LAVA" && currentPlayer.riseLavaPoint >= 1 && canRiseLava(found)) {
            currentPlayer.loseRiseLavaPoint();
            riseLava(found)
        }
    }
    // drawMap();

}, false);

function moveEntity(entity, cell) {
    // Anim.animateMove (entity, cell)
    var onMoveSpells = PLAYERS.find(p => p.entity == entity)?.spells.filter(s => s.onMove)
    if (onMoveSpells.length) onMoveSpells.forEach(s => castSpell(entity, s, cell));
    entity.pos = cell;
    //reset modeclic
    // modeClic = ""
    //clean map from range and hover indicators
    cleanRangeAndHover()
    // drawMap();
}

function castSpell(perso, spell, cell, closest) {
    if (spell.selfCast) cell = perso.pos;
    console.log("CASTING SPELL " + spell.name + " in pos ", cell.q, cell.r, cell.s)
    var arrayHighlight = makeAOEFromCell(cell, spell.aoe, perso.pos, closest)
    console.log(arrayHighlight)
    let alreadyAffected = false
    arrayHighlight.forEach(element => {
        if (!alreadyAffected) {
            map.map(h => {
                if (h.distance(element) == 0) {

                    // instant spell deals their effect instantly
                    if (!spell.delay) {
                        alreadyAffected = resolveSpell(h, spell, perso) ? true : alreadyAffected;
                    }
                    // glyph spells drop a glyph
                    else {
                        var spellEffect = {};
                        Object.assign(spellEffect, spell);
                        spellEffect.source = currentPlayer;
                        if (!spellEffect.permanent || !h.aoe.find(s => s.name == spell.name)) h.aoe.push(spellEffect);
                    }
                }
            });
        }
    })

    //spell goes on cooldown
    spell.currentCD = spell.cooldown;
    //reset modeclic
    modeClic = "MOVE"
    //clean map from range and hover indicators
    cleanRangeAndHover()
    // drawMap();
}


function resolveSpell(cell, spell, casterEntity) { //perso is the spell source
    var hit = false;
    console.log("resolve spell " + spell.name)
    // console.log(cell)
    entities.forEach(e => {
        // console.log(e)

        if (!(spell.affectsOnly == "self") && (!(spell.affectsOnly == "bomb") || e.name == "Drop bomb")) {
            if (cell.distance(e.pos) == 0) {
                hit = true;
                if (spell.effect == "pull")
                    e.pos = (cell.subtract(casterEntity.pos)).scale(1 / cell.distance(casterEntity.pos)).add(casterEntity.pos);
                if (spell.effect == "push") { //by value
                    let destination = cell.copy();
                    let direction = (destination.subtract(casterEntity.pos));
                    for (let n = 0; n < spell.value; n++) {
                        destination = destination.add(direction) //loop for pushing
                    }
                    if (isFree(destination))
                        e.pos = destination;
                }
                if (spell.effect == "salto") {
                    e.pos = e.pos.subtract(casterEntity.pos).halfTurn().add(casterEntity.pos)
                }
                if (spell.effect == "switcheroo") {
                    const save = e.pos.scale(1)
                    e.pos = casterEntity.pos
                    casterEntity.pos = save;
                }

                PLAYERS.forEach(p => {
                    if (e == p.entity) {
                        //p is the player on the cell that the spell is casted on
                        if (p.entity != casterEntity || spell.affectsOnly != "other") {
                            if (spell.effect == "root") p.loseMovePoint("all");
                            if (spell.damage) p.damage(spell.damage);
                            if (spell.type == "BUFF_PM") p.buffPM(spell.value);
                        }
                    }
                });
            }
        }
    });

    if (spell.effect == "lava") cell.floor = false;
    if (!hit) {
        if (spell.type == "tp" && isFree(cell) && cell.floor) casterEntity.pos = cell;

        if (spell.onMiss == "summon") {
            if (isFree(cell))
                entities.push({
                    name: spell.name,
                    image: spell.src,
                    pos: cell.copy(),
                    owner: currentPlayer,
                    ttl: spell.ttl,
                    onDeath: onDeath
                })
        }
        if (spell.onMiss == "lava") {
            cell.floor = false;
        }
    }

    checkAnyoneInLava()
    return hit;
}

function riseLava(cell) {
    console.log("RISING LAVA in pos ", cell.q, cell.r, cell.s)

    // cell.floor = false;
    //maj : add a lava glyph
    var lavaSpell = {};
    Object.assign(lavaSpell, LAVA_SPELL);
    lavaSpell.source = currentPlayer;
    cell.aoe.push(lavaSpell);
    //reset modeclic
    modeClic = "MOVE"
    //clean map from range and hover indicators
    cleanRangeAndHover()
    // drawMap();
}

function checkAnyoneInLava() {
    entities = entities.filter(e => {
        found = map.find(h => e.pos.distance(h) == 0)
        if (found && !found.floor) {
            //aie aie aie
            //kill player if entity was player
            PLAYERS.find(p => p.entity == e)?.die();
            return false;
        }
        return true;
    })
}

function castSpellOnMove(s, entity, cell) {
    resolveSpell(cell, spell, entity)
}