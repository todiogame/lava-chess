const c =  require('./const.js');

module.exports = class Playable {
    constructor(entity, spells) {

        this.name = entity.name;
        this.spells = spells ? spells : [];
        // Object.assign(this.spells, spells);

        this.entity = entity;
        this.entity.types.push(c.PLAYABLE)

        this.movePoint = 1;
        if(this.spells) this.spells.forEach(s => {
            s.currentCD = 0;
        });

        this.dead = false;
    }

    buffPM(value) {
        console.log("buff PM " + this.name + " by " + value)
        if (parseInt(value)) this.movePoint += value;
    }

    buffPO(value) {
        console.log("buff PO " + this.name + " by " + value)
        if (parseInt(value)) this.bonusPO = this.bonusPO ? this.bonusPO + value : value;
    }

    loseMovePoint(value) {
        console.log("remove PM from " + this.name)
        if (!parseInt(value)) value = 1;
        this.movePoint -= value;
        if (this.movePoint < 0) this.movePoint = 0;
    }
    root() {
        console.log("remove all PM from " + this.name)
        this.movePoint = 0;
    }

    die() {
        console.log("player " + this.name + " is dead...")
        //kill him and kill babies too
        entities = entities.filter(e => e != this.entity && e.owner != this)
        PLAYERS.forEach(p => {
            if ((!p.dead) && ((p.isSummoned) && (p.entity.owner == this))) {
                p.die();
            }
        })
        this.dead = true;
        checkWinCondition();
        // if we are here, nobody won yet
        if (currentPlayer == this) {
            console.log("as it is " + this.name + " turns but hes dead, he passes")
            passTurn();
        }
    }
}