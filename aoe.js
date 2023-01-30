function makeAOEFromCell(cell, aoe, persoPos, exactPt) {
    var res = [];
    if (AOE[aoe]?.length) AOE[aoe].forEach(a => {
        res.push(cell.add(a))
    })
    else {
        if (aoe == "line") {
            res = persoPos.linedraw(cell);
            res = res.filter(e => e.q != persoPos.q || e.r != persoPos.r) //remove perso cell
        }
        if (aoe == "straight_line") {
            res = persoPos.linedraw(cell);
            res = res.filter(e => e.q != persoPos.q || e.r != persoPos.r) //remove perso cell
            res = res.filter(e => e.q == persoPos.q || e.r == persoPos.r || e.s == persoPos.s)
        }
        if (aoe == "pair") {
            var arrayDistances = []
            Hex.directions.forEach(d => arrayDistances.push(d.distance(exactPt.subtract(cell))))
            let index = arrayDistances.indexOf(Math.min(...arrayDistances))
            let found = map.find(b => cell.add(Hex.directions[index]).distance(b) == 0)
            res = found ? [cell, found] : [cell];
        }
        if (aoe == "wall") {
            var arrayDistances = []
            Hex.directions.forEach(d => arrayDistances.push(d.distance(exactPt.subtract(cell))))
            let index = arrayDistances.indexOf(Math.min(...arrayDistances))
            let found = map.find(b => cell.add(Hex.directions[index]).distance(b) == 0)
            let third;
            if (found) {
                third = map.find(b => cell.subtract(found).add(cell).distance(b) == 0)
            }
            res = third ? [cell, found, third] : (found ? [cell, found] : [cell]);
        }
        if (aoe == "triangle_1") {
            var arrayDistances = []
            Hex.directions.forEach(d => arrayDistances.push(d.distance(exactPt.subtract(cell))))
            let index = arrayDistances.indexOf(Math.min(...arrayDistances))
            let found = map.find(b => cell.add(Hex.directions[index]).distance(b) == 0)
            let third;
            if (found) {
                //todo
                // third = map.find(b => cell.subtract(found).add(cell).distance(b) == 0)
            }
            res = third ? [cell, found, third] : (found ? [cell, found] : [cell]);
        }
        if (aoe == "ninja_slash") {
            AOE["ring_1"].forEach(a => {
                res.push(cell.add(a))
            })
            const shadow = entities.find(e=>e.types.has(SHADOW))
            if(shadow){
                AOE["ring_1"].forEach(a => {
                    res.push(shadow.pos.add(a))
                })
            }
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