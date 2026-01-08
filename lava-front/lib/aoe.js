const { Point, Hex, Layout } = require("./Hex")
const c = require("./const")
const utils = require("./gameUtils")

function makeAOEFromCell(og, cell, aoe, persoPos, direction, aoeSize) {
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
            let found = og.map.find(b => persoPos.add(dirLine).distance(b) == 0);
            // res = persoPos.linedraw(cell);
            for (let i = 1; i < 5 && found; i++) {
                res.push(found);
                found = og.map.find(b => found.add(dirLine).distance(b) == 0);
            }
            let non = [];
            AOE["area_1"].forEach(a => non.push(persoPos.add(a)))
            res = res.filter(e => !(non.some(n => n.equals(e))))
        }
        if (aoe == "pair") {
            let found = og.map.find(b => cell.add(direction).distance(b) == 0)
            res = found ? [cell, found] : [cell];
        }
        if (aoe == "square") {
            let found = og.map.find(b => cell.add(direction).distance(b) == 0)
            let founds = cell.neighbors(found)
            res = [cell, found, ...founds]
        }
        if (aoe == "line") {
            let found = og.map.find(b => cell.add(direction).distance(b) == 0);
            for (let i = 1; i < aoeSize && found; i++) {
                res.push(found);
                found = og.map.find(b => found.add(direction).distance(b) == 0);
            }
            res.unshift(cell);
        }
        if (aoe == "curly") {
            let found = og.map.find(b => cell.add(direction).distance(b) == 0)
            let founds = cell.neighbors(found)
            res = [found, ...founds]
        }
        if (aoe == "cleave") { //marche que range 1-1. Attention ajout de code dans castSpell pour changer la direction par directionCleave.
            let directionCleave = (cell.subtract(persoPos)).normalize()
            let found = og.map.find(b => persoPos.add(directionCleave).distance(b) == 0)
            let founds = persoPos.neighbors(found)
            res = [cell, ...founds]
        }
        if (aoe == "cleave_aura") {
            let found = og.map.find(b => persoPos.add(direction).distance(b) == 0)
            let founds = persoPos.neighbors(found)
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
            const shadow = og.entities.find(e => e.types.includes(c.TYPES.SHADOW))
            if (shadow) {
                AOE["ring_1"].forEach(a => {
                    if (!persoPos.equals(shadow.pos.add(a))) //remove ninja pos so he doesnt get damage
                        res.push(shadow.pos.add(a))
                })
            }
        }
        if (aoe == "tentacle") {
            let found = og.map.find(b => cell.add(direction).distance(b) == 0)
            let third;
            if (found) {
                third = og.map.find(b => found.add(direction).distance(b) == 0)
            }
            res = third ? [cell, found, third] : (found ? [cell, found] : [cell]);
        }
        if (aoe == "tentacle_hit") {
            let found = og.map.find(b => persoPos.add(direction).distance(b) == 0)
            let third;
            if (found) {
                third = og.map.find(b => found.add(direction).distance(b) == 0)
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
        if (aoe == "dragon_heavenly_wrath") {
            og.map.forEach(h => {
                if ((cell.q == h.q || cell.r == h.r || cell.s == h.s) && (cell.q != h.q || cell.r != h.r || cell.s != h.s))
                    res.push(h.copy())
            })
        }
        if (aoe == "lava_sulfur_fumes") {
            og.map.forEach(h => {
                if (h.floor) {
                    if (Hex.directions.some(d => !(utils.findMapCell(d.add(h), og)?.floor)))
                        res.push(h.copy())
                }
            })
        }
    }

    return res;
}


const AOE = {
    "single": [
        new Hex(0, 0, 0),
    ],
    "area_1": Hex.directions.concat([new Hex(0, 0, 0)]),
    "ring_1": Hex.directions,
    "ring_2": Hex.directions.map(h => h.scale(2)).concat(Hex.diagonals),
    "diag": Hex.directions,
    "ring_1+diag": Hex.directions.concat(Hex.diagonals)
}


module.exports = {
    makeAOEFromCell
};
