const c =  require('./const.js');
const utils = require("./gameUtils")

module.exports = class Playable {
    constructor(entity, spells, startingMovePoint) {
        this.id = entity.id;

        this.name = entity.name;
        this.spells = spells ? spells : [];
        // Object.assign(this.spells, spells);

        this.entity = entity;
        this.entity.types.push(c.TYPES.PLAYABLE)

        this.startingMovePoint = startingMovePoint != undefined ? startingMovePoint : 1;
        this.movePoint = this.startingMovePoint;
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

    die(og) {
        console.log("player " + this.name + " is dead...")
        //kill him and kill babies too
        // entities = entities.filter(e => e != this.entity && e.owner != this)
        //
        og.entities.forEach( e => {if(e.owner == this) {
            console.log(e)
            e.die(og);
        }})

        og.PLAYERS.forEach(p => {
            if ((!p.dead) && ((p.isSummoned) && (p.entity.owner == this))) {
                p.die(og);
            }
        })
        this.dead = true;
        // utils.checkWinCondition(og);//todo check cote serveur
        // if we are here, nobody won yet
        //check if the player is dead and pass his turn (we can't do it from here bc of circular dependencies)
    }
}