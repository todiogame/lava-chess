let modeClic
let spellID
//map
let map
// Create our image
let lava
let charactersIds
var player1
var player2
var player3
var player4

var PLAYERS
var idCurrentPlayer
var currentPlayer

var entities
ordonanceur();
lava.onload = () => {
    Anim.mainLoop()
}


canvas.onmousemove = function (e) {
    // console.log("hover")
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
    // console.log("click, current modeclilk " + modeClic)
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
        if (modeClic == "SPELL") {
            if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], found)) {
                castSpell(currentPlayer.entity, currentPlayer.spells[spellID], found, hPtClick);
            } else {
                //cancel spellcast
                modeClic = "MOVE"
                cleanRangeAndHover()
            }
        }
        if (modeClic == "RISE_LAVA" && canRiseLava(found)) {
            castSpell(currentPlayer.entity, LAVA_SPELL, found,)
            passTurn();
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
    refreshAuras();
    //clean map from range and hover indicators
    cleanRangeAndHover()
    // drawMap();
}

function castSpell(caster, spell, cell, exactPtH) {
    if (spell.selfCast) cell = caster.pos;
    console.log("CASTING SPELL " + spell.name + " in pos ", cell.q, cell.r, cell.s)

    if (spell.isAura) {
        var spellEffect = {};
        Object.assign(spellEffect, spell);
        spellEffect.source = currentPlayer;
        caster.auras.push(spellEffect)
    } else {
        var arrayHighlight = makeAOEFromCell(cell, spell.aoe, caster.pos, exactPtH)
        // console.log(arrayHighlight)
        let alreadyAffected = false
        arrayHighlight.forEach(element => {
            if (!(spell.onlyFirst) || !alreadyAffected) {
                map.map(h => {
                    if (h.distance(element) == 0) {

                        // instant spell deals their effect instantly
                        if (!spell.delay) {
                            alreadyAffected = resolveSpell(h, spell, caster) ? true : alreadyAffected;
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
    // drawMap();
    //todo rembourser le CD si le spell a foire
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

function refreshAuras() {
    //vide les auras de la map (and remove gas over lava)
    map.forEach(h => h.aoe = h.aoe.filter(aoe => !aoe.isAura && !(!h.floor && aoe.permanent)));
    // boucle sur les entities pour remettre les auras
    entities.forEach(e => {
        if (e.auras?.length) {
            e.auras.forEach(aura => {
                //get aoe from aura
                //calculate destination cells on the map
                let listCells = makeAOEFromCell(e.pos, aura.aoe);
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