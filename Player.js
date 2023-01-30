class Player {
    constructor(character, team, entity) {
        Object.assign(this, character);
        Object.assign(this, character.spells);

        this.entity = entity;
        this.team = team; //team is a boolean

        this.entity.image = new Image();
        this.entity.image.src = this.src;
        this.entity.auras = [];
        this.entity.types = new Set([])

        this.movePoint = 1;
        this.riseLavaPoint = 1;
        this.currentHP = this.maxHP;
        this.spells.forEach(s => {
            s.currentCD = 0;
        });

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
    loseRiseLavaPoint() {
        this.riseLavaPoint -= 1;
    }

    die() {
        console.log(this.name + " is dead...")
        entities = entities.filter(e => e != this.entity)
        PLAYERS = PLAYERS.filter(p => p != this);
        // drawMap();
        checkWinCondition();
        // if we are here, nobody won yet
        if (currentPlayer == this) passTurn();
    }
}