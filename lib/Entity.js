const c = require('./const.js');
const { Hex } = require('./Hex.js');
const utils = require("./gameUtils")

module.exports = class Entity {
    constructor(name, team, auras, types, pos, maxHP,
        ttl, owner, summoner, onDeath, flags) {

        this.name = name;
        this.team = team; //team is a color


        this.src = "pics/" + name.toLowerCase() +
            (name.toLowerCase() == "zombie" ? Math.floor(Math.random() * 2) : "")
            + ".png";
        if ((typeof window != 'undefined' && window.document) && this.src) {
            this.image = new Image();
            this.image.src = this.src;
        }
        this.auras = auras;
        this.types = [c.TYPES.ENTITY, ...types]
        this.pos = new Hex(pos.q, pos.r, pos.s)

        this.isInvulnerable = !maxHP;
        this.maxHP =  maxHP; //normally every player has got 4 max hp
        this.currentHP = this.maxHP;

        this.ttl = ttl;
        this.owner = owner; //player
        this.summoner = summoner; //entity
        this.onDeath = onDeath;


    }


    damage() { //all spells deal 1 damage in this game
        if (!this.armor) {
            this.currentHP--;
            console.log(this.name + " suffers damage !! HP:" + this.currentHP + "/" + this.maxHP)
            //traiter la mort
            if (this.currentHP <= 0) this.die(og);
        } else {
            this.armor--;
        }
    }

    heal() { //all spells deal 1 damage in this game
        if (this.currentHP < this.maxHP) this.currentHP++;
        console.log(this.name + " heals !! HP:" + this.currentHP + "/" + this.maxHP)
    }

    shield(value, color, casterEntity) { //all spells deal 1 damage in this game
        if (!value) value = 1;
        if (this.armor) this.armor += value; else this.armor = value;
        if (color) this.armorColor = color;
        if (casterEntity) this.armorSource =  casterEntity;
        console.log(this.name + " gains " + value + " armor !")
    }


    die(og) {
        console.log("entity " + this.name + " is dead...")
        this.dead = true;
        //remove from entities
        og.entities = og.entities.filter(e => e != this)

        //move onDeath function because of circular dependencies...
        // if (typeof this.onDeath === 'function') {
        //     this.onDeath(this)
        // }

        //if it is a player, kill the player too
        let targetplayer = utils.findPlayerFromEntity(this, og)
        if (targetplayer) targetplayer.die(og);
    }

    isEnemy(otherEntity) {
        if (otherEntity) return this.team != otherEntity.team;
    }
}