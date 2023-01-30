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
const SPELL_RANGE = "rgb(255, 100, 100, 0.5)";

const GLYPH_BLUE = "rgb(50, 150, 255, 0.2)";
const GLYPH_BROWN = "rgb(50, 50, 30, 0.3)";
const GLYPH_ORANGE = "rgb(255, 65, 0, 0.5)";
const GLYPH_GAZ = "rgb(100, 255, 150, 0.3)";

let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
let canvasTop = canvas.offsetTop + canvas.clientTop;

function drawMap() {
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
        if (h.floor) paintCell(h, EARTH)
        if (h.range) paintCell(h, colorRange)

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

function paintCell(mapCell, color, glyphIcon ){

    ctx.fillStyle = color
     ctx.fill();
     if(glyphIcon){
        let pGlyph = layout.hexToPixel(mapCell);
        ctx.globalAlpha = 0.7;
        ctx.drawImage(glyphIcon, pGlyph.x - SIZE_GLYPH / 2, pGlyph.y - SIZE_GLYPH / 2, SIZE_GLYPH, SIZE_GLYPH);
        ctx.globalAlpha = 1;
     }
}

function cleanCastRange() { map.map(h => h.range = false) }
function showCastRange() {
    if (modeClic == "MOVE")
        map.map(h => {
            if (canMove(currentPlayer.entity, h, currentPlayer.movePoint))
                h.range = true;
        })
    if (modeClic == "SPELL")
        map.map(h => {
            if (canCast(currentPlayer.entity, currentPlayer.spells[spellID], h))
                h.range = true;
        })
    else if (modeClic == "RISE_LAVA") {
        // any cell that is next to lava and doesnt contain an entity
        map.map(found => {
            if (canRiseLava(found)) found.range = true;
        })
    }
}
function cleanRangeAndHover() {
    map.map(h => h.hover = h.range = false)
}