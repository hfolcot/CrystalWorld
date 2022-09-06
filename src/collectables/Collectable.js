import Phaser from "phaser";

class Collectable extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);

        this.score = 1;

        scene.tweens.add({
            targets: this,
            y: this.y - 5,
            duration: Phaser.Math.Between(750, 1250),
            repeat: -1,
            ease: 'linear',
            yoyo: true
        })
    }

}

export default Collectable;