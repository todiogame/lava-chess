const c = require('./const.js');
const { Hex } = require('./Hex.js');

module.exports = class Entity {
    constructor(name, team, auras, types, pos, maxHP,
        ttl, owner, summoner, onDeath, flags) {

        this.name = name;
        this.team = team; //team is a color


        this.src = "pics/" + name.toLowerCase() +
            (name.toLowerCase() == "zombie" ? Math.floor(Math.random() * 2) : "")
            + ".png";
        if (typeof window && this.src) {
            this.image = new Image();
            this.image.src = this.src;
        }
        this.auras = auras;
        this.types = [c.TYPES.ENTITY, ...types]
        this.pos = new Hex(pos.q, pos.r, pos.s)

        this.maxHP = maxHP || 4; //every player has got 4 max hp
        this.currentHP = this.maxHP;
        this.isInvulnerable = !maxHP;

        this.ttl = ttl;
        this.owner = owner; //player
        this.summoner = summoner; //entity
        this.onDeath = onDeath;


    }


    damage() { //all spells deal 1 damage in this game
        this.currentHP--;
        console.log(this.name + " suffers damage !! HP:" + this.currentHP + "/" + this.maxHP)
        //traiter la mort
        if (this.currentHP <= 0) this.die();
    }

    heal() { //all spells deal 1 damage in this game
        if (this.currentHP < this.maxHP) this.currentHP++;
        console.log(this.name + " heals !! HP:" + this.currentHP + "/" + this.maxHP)
    }

    die() {
        console.log("entity " + this.name + " is dead...")
        //remove from entities
        entities = entities.filter(e => e != this)
        //cast onDeath();
        if (typeof this.onDeath === 'function') {
            this.onDeath(this)
        }

        //if it is a player, kill the player too
        let targetplayer = utils.findPlayerFromEntity(this)
        if (targetplayer) targetplayer.die();

    }

    isEnemy(otherEntity) {
        if (otherEntity) return this.team != otherEntity.team;
    }
}