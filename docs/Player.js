class Player {
    constructor(character, team, pos) {
        Object.assign(this, character);
        Object.assign(this, character.spells);

        this.entity = new Entity(team, this.src, [], [PLAYER] , pos)

        this.movePoint = 1;
        this.maxHP = 4; //every player has got 4 max hp
        this.currentHP = this.maxHP;
        this.spells.forEach(s => {
            s.currentCD = 0;
        });

        this.dead = false;

    }


    damage() { //all spells deal 1 damage in this game
        this.currentHP--;
        console.log(this.name + " suffers damage !! HP:"+this.currentHP+"/"+this.maxHP)
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