const c = require("./const")
const { Hex } = require("./Hex");

class OngoingGame {
    constructor(isPickPhase, players) {
        this.isPickPhase = isPickPhase;
        this.pickOrBanIndex = 0;
        this.currentTeamPicking = c.CONSTANTS.TEAM_RED;

        this.map = this.initMap(c.CONSTANTS.MAP_RADIUS, this.isPickPhase);
        this.entities = [];
        this.PLAYERS = [];
        if (players) this.setPLAYERS(players)

        this.turnTimer = {}
        console.log("og setup ok")
    }

    setPLAYERS(players) {
        this.map = this.initMap(c.CONSTANTS.MAP_RADIUS);
        this.entities = []
        this.isPickPhase = false;
        this.PLAYERS = players
        this.idCurrentPlayer = 0;
        this.currentPlayer = this.PLAYERS[0];
        this.PLAYERS.forEach((p) => {
            this.entities.push(p.entity);
        });

    }

    initMap(N, isForPickBan) {
        let map = []
        // console.log("init map size ", N)

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
            //special for ban map
            // if (isForPickBan && utils.isBanArea(h)) {
            //     h.floor = false;
            //     h.aoe.push({ name: "Pit of Ban", glyph: 1, glyphIcon: "banIcon", color: "GLYPH_BAN" })
            // }
        })
        return map;
    }
}

module.exports = OngoingGame;