export default class Orb{
    constructor(size=40, position={x:0, y:0}, color={r:0, g:0, b:0}, move={x: 0, y: 0}){
        this.size=size;
        this.position=position;
        this.move=move;
        this.color=color;
    }
    updatePosition(){
        this.position.x+=this.move.x;
        this.position.y+=this.move.y;
    }
}