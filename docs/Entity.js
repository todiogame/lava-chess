class Entity {
    constructor(name, team, auras, types, pos,
        ttl, owner, summoner) {
        this.name = name,
        this.team = team; //team is a color
        this.image = new Image();
        this.image.src = "pics/"+name.toLowerCase()+".png";
        this.auras = auras;
        this.types = [ENTITY, ...types]
        this.pos = pos;

        this.ttl = ttl;
        this.owner = owner; //player
        this.summoner = summoner; //entity
    }
}