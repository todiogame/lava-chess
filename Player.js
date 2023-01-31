class Player {
    constructor(character, team, entity) {
        Object.assign(this, character);
        Object.assign(this, character.spells);

        this.entity = entity;
        this.team = team; //team is a boolean

        this.entity.image = new Image();
        this.entity.image.src = this.src;
        this.entity.auras = [];
        this.entity.types = [PLAYER, ENTITY]

        this.movePoint = 1;
        this.maxHP = 4; //every player has got 4 max hp
        this.currentHP = this.maxHP;
        this.spells.forEach(s => {
            s.currentCD = 0;
        });

        this.dead = false;

    }


    damage() { //all spells deal 1 damage in this game
        console.log(this.name + " suffers damage !!")
        this.currentHP--;
        //traiter la mort
        if (this.currentHP <= 0) this.die();
    }

    buffPM(value) {
        console.log("buff PM " + this.name + " by " + value)
        if (parseInt(value)) this.movePoint += value;
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
        console.log(this.name + " is dead...")
        entities = entities.filter(e => e != this.entity)
        this.dead = true;
        checkWinCondition();
        // if we are here, nobody won yet
        if (currentPlayer == this) passTurn();
    }
}