import Phaser from "phaser";
import collidable from "../mixins/collidable";
import anims from '../mixins/anims';

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.config = scene.config;

        Object.assign(this, collidable);
        Object.assign(this, anims);

        this.init();
        this.initEvents();
    }

    init() {

        this.gravity = 500;
        this.speed = 50;
        this.timeFromLastTurn = 0;
        this.maxPatrolDistance = 100;
        this.currentPatrolDistance = 0;
        this.platformCollidersLayer = null;
        this.rayGraphics = this.scene.add.graphics({
            lineStyle: {
                width: 2,
                color: 0xe3491F
            }
        })

        this.health = 20;
        this.damage = 20;

        this.body.setGravityY(this.gravity);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        this.setVelocityX(this.speed)
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update(time, delta) {
        
        if(this.getBounds().bottom > 600) {
            this.scene.events.removeListener(Phaser.Scenes.Events.UPDATE, this.update, this);
            this.setActive(false);
            this.rayGraphics.clear();
            this.destroy();
            return;
        }
        this.patrol(time);
    }

    patrol(time) {
        if (!this.body || !this.body.onFloor()) {
            return;
        }

        this.currentPatrolDistance += Math.abs(this.body.deltaX);

        const { ray, hasHit } = this.raycast(this.body, this.platformCollidersLayer);

        if ((!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) && this.timeFromLastTurn + 100 < time) {
            this.setFlipX(!this.flipX);
            this.setVelocityX(this.speed = -this.speed);
            this.timeFromLastTurn = time;
            this.currentPatrolDistance = 0;
        }

        if (this.config.debug) {
            this.rayGraphics.clear();
            this.rayGraphics.strokeLineShape(ray);
        }
    }

    takesHit(source) {
        this.health -= source.damage;

        source.deliversHit(this);

        if(this.health <= 0){
            this.setTint(0xff0000);
            this.setVelocity(0, -200);
            this.body.checkCollision.none = true;
            this.setCollideWorldBounds(false);
        }
    }

    setPlatformColliders(platformCollidersLayer) {
        this.platformCollidersLayer = platformCollidersLayer;
    }


}

export default Enemy;