class Entity {
    constructor(name, team, auras, types, pos, maxHP,
        ttl, owner, summoner, onDeath, flags) {

        this.name = name,
            this.team = team; //team is a color
        this.image = new Image();
        this.image.src = "pics/" + name.toLowerCase() + ".png";
        this.auras = auras;
        this.types = [ENTITY, ...types]
        this.pos = pos;

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
        Anim.splash(this.pos, "-1")
        //traiter la mort
        if (this.currentHP <= 0) this.die();
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
        let targetplayer = findPlayerFromEntity(this)
        if (targetplayer) targetplayer.die();

    }

    isEnemy(otherEntity) {
        if (otherEntity) return this.team != otherEntity.team;
    }
}