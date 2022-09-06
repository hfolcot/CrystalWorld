import Phaser from "phaser";

class BaseScene extends Phaser.Scene {
    constructor(key, config) {
        super(key);
        this.config = config;
        this.fontSize = 65;
        this.smallFontSize = 32;
        this.lineHeight = 82;
        this.smallLineHeight = 42;
        this.fontOptions = {
            fontSize: `${this.fontSize}px`, 
            fill: '#713e01',
            fontFamily: 'sans-serif'
        }
        this.screenCenter = [config.width / 2, config.height / 2 - 65];
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
    }

    create() {
        this.add.image(0, 0, 'menu-bg')
        .setOrigin(0, 0)
        .setScale(2.75);

        if(this.config.canGoBack) {
            this.createBackButton();
        }
    }

    createMenu(menu, setupMenuEvents, smallText=false) {
        let lastMenuPositionY = 0;

        menu.forEach(item => {
            if(smallText) {
                this.fontOptions.fontSize = this.smallFontSize;
            }
            const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPositionY];
            item.textGameObject = this.add.text(...menuPosition, item.text, this.fontOptions)
            .setOrigin(0.5, 1);
            lastMenuPositionY += smallText ? this.smallLineHeight : this.lineHeight;
            setupMenuEvents(item);
        })
    }

    
    createBackButton() {
        const backButton = this.add.image(10, 10, 'backButton')
        .setScale(2)
        .setOrigin(0)
        .setInteractive();

        backButton.on('pointerup', () => {
            this.scene.start('MenuScene');
        })
    }
}

export default BaseScene;