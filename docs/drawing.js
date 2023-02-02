const SIZE_PERSO = 64;
const SIZE_TILE = 95;
const THICKNESS = 1;

tileImage = new Image();
tileImage.src = "pics/tile.png"

//glyphs
damageIcon = new Image();
damageIcon.src = "pics/fire_icon.png";

rootIcon = new Image();
rootIcon.src = "pics/net.png"

lavaIcon = new Image();
lavaIcon.src = "pics/rising.png"

gasIcon = new Image();
gasIcon.src = "pics/gas.png"

boulderIcon = new Image();
boulderIcon.src = "pics/boulder.png"



function drawEntities() {
    entities.forEach(e => drawPerso(e))
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
const GLYPH_GAZ = "rgb(100, 255, 150, 0.3)";
const GLYPH_PREVIEW = "rgb(255, 65, 0, 0.2)";

let canvasLeft = canvas.offsetLeft + canvas.clientLeft;
let canvasTop = canvas.offsetTop + canvas.clientTop;

function drawMap() {
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
        if(h.floor) drawFloor(h)
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

function drawFloor(h){
    pPerso = layout.hexToPixel(h);
    ctx.drawImage(tileImage, pPerso.x - SIZE_TILE / 2, pPerso.y - SIZE_TILE / 2, SIZE_TILE, SIZE_TILE);
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
