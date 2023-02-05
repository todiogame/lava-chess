const { Point, Hex, Layout } = require("../Hex")
const { displayCharacterHUD } = require("./hud")

const SCALE = 40;
const SIZE_GLYPH = 64;

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

ARRAY_ICONS = {
    "damageIcon": damageIcon,
    "rootIcon": rootIcon,
    "silenceIcon": silenceIcon,
    'gasIcon': gasIcon,
    "boulderIcon": boulderIcon,
    "flowerIcon": flowerIcon
}

function drawEntities() {
    entities.forEach(e => { if (e.image) drawPerso(e) })
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

const ORANGE = "rgb(255, 65, 0, 0.7)";
const EARTH = "rgb(220, 150, 30)";

const MOVE_HOVER = "rgb(30, 75, 0, 0.5)";
const MOVE_RANGE = "rgb(30, 205, 0, 0.5)";
const SPELL_HOVER = "rgb(255, 0, 0, 0.5)";
const SPELL_RANGE = "rgb(255, 100, 100, 0.4)";
const SPELL_HIT = "rgb(255, 50, 50, 0.5)";
const ARRAY_GLYPH_COLOR= {
    "GLYPH_BLUE": "rgb(50, 150, 255, 0.2)",
    "GLYPH_BROWN": "rgb(50, 50, 30, 0.3)",
    "GLYPH_ORANGE": "rgb(255, 65, 0, 0.5)",
    "GLYPH_PURPLE": "rgb(255,0,255, 0.3)",
    "GLYPH_FLOWER": "rgb(30, 205, 50, 0.3)",
    "GLYPH_GAZ": "rgb(100, 255, 150, 0.3)",
    "GLYPH_PREVIEW": "rgb(255, 65, 0, 0.2)",
};

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
                    paintCell(h,  ARRAY_GLYPH_COLOR[spell.color], ARRAY_ICONS[spell.glyphIcon])
                })
            }

            if (h.hoverMove) paintCell(h, colorHoverMove)
            if (h.hoverSpell) paintCell(h, colorHoverSpell)

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

function findHexFromEvent(eventX, eventY) {
    return layout.pixelToHex(new Point(eventX - canvasLeft, eventY - canvasTop))
}

module.exports = {
    drawMap, findHexFromEvent, origin, layout, canvas, ctx
};