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
        if(aoe == "straight_line_space_1"){
            res = persoPos.linedraw(cell);
            res = res.filter(e => e.q != persoPos.q || e.r != persoPos.r) //remove perso cell
            res = res.filter(e => e.q == persoPos.q || e.r == persoPos.r || e.s == persoPos.s)
            let non = [];
            AOE["ring_1"].forEach(a => non.push(persoPos.add(a)))
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
        if(aoe == "tentacle_hit"){
            let found = map.find(b => cell.add(direction).distance(b) == 0)
            let third;
            if (found) {
                third = map.find(b => found.add(direction).distance(b) == 0)
            }
            res = third ? [found, third] : (found ? [found] : []);
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