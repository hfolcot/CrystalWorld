import Phaser from "phaser";
import EffectManager from "../effects/EffectManager";

class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 300;
        this.maxDistance = 700;
        this.travelledDistance = 0;

        this.coolDown = 250;
        this.damage = 10;
        this.body.setSize(this.width - 15, this.height - 20);

        this.effectManager = new EffectManager(scene);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.travelledDistance += this.body.deltaAbsX()
        if (this.isOutOfRange()) {
            this.body.reset(0, 0);
            this.travelledDistance = 0;
            this.activateProjectile(false);
        }
    }

    deliversHit(target) {
        this.activateProjectile(false);
        this.travelledDistance = 0;
        const impactPosition = { x: this.x, y: this.y };
        this.body.reset(0, 0);
        this.effectManager.playEffectOn('hit-effect', target, impactPosition);
    }

    activateProjectile(active) {
        this.setActive(active);
        this.setVisible(active);

    }

    fire(x, y, anim) {
        this.activateProjectile(true);
        this.body.reset(x, y);
        this.setVelocityX(this.speed);
        anim && this.play(anim, true);
    }

    isOutOfRange() {
        return this.travelledDistance && this.travelledDistance >= this.maxDistance;
    }
}

export default Projectile;