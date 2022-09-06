import BaseScene from "./BaseScene";


class LevelsScene extends BaseScene {
    constructor(config) {
        super('LevelsScene', {...config, canGoBack : true});

    }

    preload() {
    }

    create() {
        super.create();

        this.menu = [];

        const levels = this.registry.get('unlocked-levels');

        for(let i = 1; i<=levels; i++) {
            this.menu.push({
                scene: 'PlayScene',
                text: `Level ${i}`,
                level: i
            })
        }

        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGameObject = menuItem.textGameObject;
        textGameObject.setInteractive();
        textGameObject.on('pointerover', () => {
            textGameObject.setStyle({
                fill: '#f00'
            });
        })

        textGameObject.on('pointerout', () => {
            textGameObject.setStyle({
                fill: '#713e01'
            });
        })
        
        textGameObject.on('pointerup', () => {
            if(menuItem.scene) {
                this.registry.set('level', menuItem.level);
                this.scene.start(menuItem.scene);
            }

            if(menuItem.text === 'Exit'){
                this.game.destroy(true);
            }
        })
    }
}

export default LevelsScene;