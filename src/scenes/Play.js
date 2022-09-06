import Phaser from "phaser";
import Player from "../models/Player";
import Enemies from "../groups/Enemies";
import initAnims from "../anims";
import Collectables from "../groups/Collectables";
import Hud from "../hud";
import EventEmitter from '../events/Emitter'

class Play extends Phaser.Scene {
    constructor(config) {
        super('PlayScene');
        this.config = config;
    }

    create({gameStatus}) {
        this.score = 0;
        this.hud = new Hud(this, 0, 0).setDepth(20);

        //this.playTheme();
        this.collectSound = this.sound.add('coin-pickup', {volume: 0.2});
        
        const map = this.createMap();
        initAnims(this.anims);
        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);
        const player = this.createPlayer(playerZones.start);
        const enemies = this.createEnemies(layers.enemySpawns, layers.ground);
        const collectables = this.createCollectables(layers.collectables);


        this.createEnemyColliders(enemies, {
            colliders: {
                platformColliders: layers.ground,
                player
            }
        });

        this.createPlayerColliders(player, {
            colliders: {
                platformColliders: layers.ground,
                projectiles: enemies.getProjectiles(),
                collectables: collectables,
                traps: layers.traps
            }
        });

        this.createBackButton();

        this.createEndOfLevel(playerZones.end, player);
        
        this.setupFollowupCameraOn(player);
        
        if(gameStatus === "PLAYER_LOSE") return;

        else this.createGameEvents();
    }

    createMap() {
        const map = this.make.tilemap({ key: `level-${this.getCurrentLevel()}` });
        map.addTilesetImage('main_lev_build_1', 'tiles-1');
        map.addTilesetImage('bg_spikes_tileset', 'bg-spikes-tileset');
        return map;
    }

    createLayers(map) {
        const tileset1 = map.getTileset('main_lev_build_1');
        const tilesetBG = map.getTileset('bg_spikes_tileset');
        map.createStaticLayer('distance', tilesetBG).setDepth(-10);
        const ground = map.createStaticLayer('platform_colliders', tileset1);
        const environment = map.createStaticLayer('environment', tileset1).setDepth(-2);
        const platforms = map.createStaticLayer('platforms', tileset1);
        const traps = map.createStaticLayer('traps', tileset1);
        const playerZones = map.getObjectLayer('player_zones');
        const enemySpawns = map.getObjectLayer('enemies');
        const collectables = map.getObjectLayer('collectables');

        this.createBG(map);

        ground.setCollisionByProperty({ collides: true });
        traps.setCollisionByExclusion(-1);

        return {
            ground,
            environment,
            platforms,
            playerZones,
            enemySpawns,
            collectables,
            traps
        };
    }

    playTheme() {
        if(this.sound.get('theme')) return;
        this.sound.add('theme', {loop: true, volume: 0.5}).play();
    }

    createBG(map) {
        const bgObject = map.getObjectLayer('distance_bg').objects[0];


        this.spikesImage = this.add.tileSprite(bgObject.x, bgObject.y, this.config.width, bgObject.height, 'bg-spikes-dark')
            .setOrigin(0, 1)
            .setDepth(-10)
            .setScrollFactor(0, 1);

         this.skyImage = this.add.tileSprite(0, 0, this.config.width, 180, 'bg-sky')
            .setOrigin(0, 0)
            .setDepth(-11)
            .setScale(1.1)
            .setScrollFactor(0, 1);
    }

    createBackButton() {
        const btn = this.add.image(this.config.rightBottomCorner.x, this.config.rightBottomCorner.y, 'backButton')
        .setOrigin(1)
        .setScrollFactor(0)
        .setScale(2)
        .setInteractive();

        btn.on('pointerup', () => {
            this.scene.start('MenuScene');
        })
    }

    createGameEvents() {
        EventEmitter.on('PLAYER_LOSE', () => {
            this.scene.restart({gameStatus: "PLAYER_LOSE"});
        })
    }

    createCollectables(collectableLayer) {
        const collectables = new Collectables(this).setDepth(-1);
        collectables.addFromLayer(collectableLayer);

        collectables.playAnimation('diamond-shine');

        return collectables;
    }

    createPlayer(start) {
        return new Player(this, start.x, start.y);
    }

    createEnemies(spawnLayer, ground) {
        const enemies = new Enemies(this);
        const enemyTypes = enemies.getTypes();

        spawnLayer.objects.map(spawnPoint => {
            const spawnType = spawnPoint.properties.find(p => p.name == 'type');
            const enemy = new enemyTypes[spawnType.value](this, spawnPoint.x, spawnPoint.y);
            enemy.setPlatformColliders(ground);
            enemies.add(enemy);
        })

        return enemies;
    }

    onPlayerCollision(enemy, player) {
        player.takesHit(enemy);
    }

    onHit(entity, source) {
        entity.takesHit(source);
    }

    onCollect(entity, collectable) {
        this.collectSound.play();
        this.score += collectable.score;
        this.hud.updateScoreboard(this.score);
        collectable.disableBody(true, true);
    }

    createEnemyColliders(enemies, { colliders }) {
        enemies
            .addCollider(colliders.platformColliders)
            .addCollider(colliders.player, this.onPlayerCollision)
            .addCollider(colliders.player.projectiles, this.onHit)
            .addOverlap(colliders.player.meleeWeapon, this.onHit);
    }

    createPlayerColliders(player, { colliders }) {
        player
            .addCollider(colliders.platformColliders)
            .addCollider(colliders.projectiles, this.onHit)
            .addCollider(colliders.traps, this.onHit)
            .addOverlap(colliders.collectables, this.onCollect, this);
    }

    setupFollowupCameraOn(player) {
        const { height, width, mapOffset, zoomFactor } = this.config;
        this.physics.world.setBounds(0, 0, width + mapOffset, height + 200);
        this.cameras.main.setBounds(0, 0, width + mapOffset, height).setZoom(zoomFactor);
        this.cameras.main.startFollow(player);
    }

    getPlayerZones(zones) {
        const playerZones = zones.objects;
        return {
            start: playerZones.find(zone => zone.name == 'startZone'),
            end: playerZones.find(zone => zone.name == 'finishZone')
        }
    }

    getCurrentLevel() {
        return this.registry.get('level') || 1;
    }

    createEndOfLevel(endLocation, player) {
        const endZone = this.physics.add.sprite(endLocation.x, endLocation.y, 'end')
            .setAlpha(0)
            .setSize(5, 200)
            .setOrigin(0.5, 1);

        const eolOverlap = this.physics.add.overlap(player, endZone, () => {
            eolOverlap.active = false;
            if(this.registry.get('level') === this.config.lastLevel) {
                this.scene.start('CreditsScene');
                return;
            }
            this.registry.inc('level', 1);
            this.registry.inc('unlocked-levels', 1);
            this.scene.restart({gameStatus: 'LEVEL_COMPLETE'});
        });

        this.add.image(endLocation.x, endLocation.y, 'exit').setDepth(-1);
    }

    update() {
        this.spikesImage.tilePositionX = this.cameras.main.scrollX * 0.3;
        this.skyImage.tilePositionX = this.cameras.main.scrollX * 0.1;

    }
}

export default Play;