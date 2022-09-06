import Enemy from "./enemy";
import initAnims from './anims/birdmanAnims'

class Birdman extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'birdman');
        initAnims(scene.anims);
    }

    init() {
        super.init();
        
        this.setSize(26, 45);
        this.setOffset(5, 20);
    }

    update(time, delta) {
        super.update(time, delta);
        if(!this.active) return;
        if(this.isPlayingAnims('birdman-hit')) return;
        this.play('birdman-idle', true);
    }

    takesHit(source) {
        super.takesHit(source)

        this.play('birdman-hit', true);

    }
}

export default Birdman;