import Phaser from "phaser";
import HealthBar from "../hud/HealthBar";
import initAnimations from './anims/playerAnims';
import collidable from "../mixins/collidable";
import anims from "../mixins/anims";
import Projectiles from "../attacks/Projectiles";
import MeleeWeapon from "../attacks/Melee";
import { getTimestamp } from "../utils/helpers";
import EventEmitter from "../events/Emitter";

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);


        Object.assign(this, collidable);
        Object.assign(this, anims);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 500;
        this.playerSpeed = 150;
        this.jumpCount = 0;
        this.consecutiveJumps = 1;
        this.hasBeenHit = false;
        this.isSliding = false;
        this.bounceVelocity = 250;
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.jumpSound = this.scene.sound.add('jump', {volume: 0.2});
        this.fireSound = this.scene.sound.add('projectile', {volume: 0.2});
        this.walkSound = this.scene.sound.add('step', {volume: 0.2});
        this.attackSound = this.scene.sound.add('swipe', {volume: 0.2});

        this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
        this.projectiles = new Projectiles(this.scene, 'iceball-1');
        this.meleeWeapon = new MeleeWeapon(this.scene, 0, 0, 'sword-default');
        this.timeFromLastSwing = null;

        this.health = 100;
        this.hp = new HealthBar(
            this.scene,
            this.scene.config.leftTopCorner.x + 10,
            this.scene.config.leftTopCorner.y + 10,
            2.5,
            this.health
        )

        this.body.setGravityY(this.gravity);
        this.setSize(22, 36);
        this.setCollideWorldBounds(true);

        initAnimations(this.scene.anims);

        this.handleAttacks();
        this.handleMovements();

        // Play walking sound
        this.scene.time.addEvent({
            delay: 300,
            repeat: -1,
            callbackScope: this,
            callback: () => {
                if(this.isPlayingAnims('run')) {
                    this.walkSound.play();
                }
            }
        })

    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update() {
        if (!this.body || this.hasBeenHit || this.isSliding) return;

        if(this.getBounds().top > this.scene.config.height) {
            EventEmitter.emit("PLAYER_LOSE");
        }
        const { left, right, space, up, down } = this.cursors;
        const onFloor = this.body.onFloor();
        const jumpBtnJustDown = Phaser.Input.Keyboard.JustDown(space) || Phaser.Input.Keyboard.JustDown(up);

        if (left.isDown) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
            this.setVelocityX(-this.playerSpeed);
            this.setFlipX(true);
        }
        else if (right.isDown) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
            this.setVelocityX(this.playerSpeed);
            this.setFlipX(false);
        }
        else {
            this.setVelocityX(0);
        }

        if (jumpBtnJustDown && (onFloor || this.jumpCount < this.consecutiveJumps)) {
            this.jumpSound.play();
            this.setVelocityY(-this.playerSpeed * 2);
            this.jumpCount++;
        }

        if (onFloor) {
            this.jumpCount = 0;
        }


        if (this.isPlayingAnims('throw') || this.isPlayingAnims('slide')) {
            return;
        }

        if (onFloor) {
            if (this.body.velocity.x !== 0) {
                this.play('run', true);
            }
            else {
                this.play('idle', true);
            }
        } else {
            this.play('jump', true);
        }
    }

    handleAttacks() {

        this.scene.input.keyboard.on('keydown-Q', () => {
            this.fireSound.play();
            this.play('throw', true);
            this.projectiles.fireProjectile(this, 'iceball');
        })
        this.scene.input.keyboard.on('keydown-E', () => {
            if (this.timeFromLastSwing &&
                this.timeFromLastSwing + this.meleeWeapon.attackSpeed > getTimestamp()) {
                return;
            }
            this.attackSound.play();
            this.play('throw', true);
            this.meleeWeapon.swing(this);
            this.timeFromLastSwing = getTimestamp();
        })
    }

    handleMovements() {
        this.scene.input.keyboard.on('keydown-DOWN', () => {
            if (!this.body.onFloor()) return;
            this.body.setSize(this.width, this.height * 0.5);
            this.setOffset(0, this.height * 0.5);
            this.setVelocityX(0);
            this.play('slide', true);
            this.isSliding = true;
        })
        this.scene.input.keyboard.on('keyup-DOWN', () => {
            this.body.setSize(this.width, this.height);
            this.setOffset(0, 0);
            this.isSliding = false;

        })
    }

    playDamageTween() {
        return this.scene.tweens.add({
            targets: this,
            duration: 100,
            repeat: -1,
            tint: 0xffffff
        });
    }

    bounceOff(source) {
        if (source.body) {
            this.body.touching.right ?
                this.setVelocityX(-this.bounceVelocity) :
                this.setVelocityX(this.bounceVelocity);
        }
        else {
            this.body.blocked.right ?
                this.setVelocityX(-this.bounceVelocity) :
                this.setVelocityX(this.bounceVelocity);
        }
        setTimeout(() => {
            this.setVelocityY(-this.bounceVelocity);
        }, 0);
    }

    takesHit(source) {
        if (this.hasBeenHit) return;
        this.health -= source.damage || source.properties.damage || 0;

        if (this.health <= 0) {
            this.hasBeenHit = false;
            EventEmitter.emit("PLAYER_LOSE")
            return;
        }

        this.hasBeenHit = true;
        this.bounceOff(source);
        const hitAnimation = this.playDamageTween();

        this.hp.decrease(this.health);

        source.deliversHit && source.deliversHit(this);
        this.scene.time.delayedCall(1000, () => {
            this.hasBeenHit = false;
            hitAnimation.stop();
            this.clearTint();
        });
    }

}

export default Player;