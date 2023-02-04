const { Point, Hex, Layout } = require("./Hex")

function makeAOEFromCell(cell, aoe, persoPos, direction, aoeSize) {
    aoeSize = aoeSize || 1;
    var res = [];
    if (AOE[aoe]?.length) AOE[aoe].forEach(a => res.push(cell.add(a)))
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
            console.log()
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
            const shadow = entities.find(e => e.types.includes(SHADOW))
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
