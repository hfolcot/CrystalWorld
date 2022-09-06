import BaseScene from "./BaseScene";


class MenuScene extends BaseScene {
    constructor(config) {
        super('MenuScene', config);

        this.menu = [
            {
                scene: 'PlayScene',
                text: 'Play'
            },
            {
                scene: 'LevelsScene',
                text: 'Levels'
            },
            {
                scene: null,
                text: 'Exit'
            }
        ]
    }

    preload() {
    }

    create() {
        super.create();
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
                this.scene.start(menuItem.scene);
            }

            if(menuItem.text === 'Exit'){
                this.game.destroy(true);
            }
        })
    }
}

export default MenuScene;