class Entity {
    constructor(team, src, auras, types, pos ) {

        this.team = team; //team is a color
        this.image = new Image();
        this.image.src = src;
        this.auras = auras;
        this.types = [ENTITY, ...types]
        this.pos = pos;
    }
}