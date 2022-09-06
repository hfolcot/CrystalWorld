import BaseScene from "./BaseScene";


class CreditsScene extends BaseScene {
    constructor(config) {
        super('CreditsScene', {...config, canGoBack: true});

        this.menu = [
            {
                scene: null,
                text: 'Thank you for playing!'
            },
            {
                scene: null,
                text: 'Author: Heather Olcot'
            },
            {
                scene: null,
                text: 'Made as part of the Udemy course'
            },
            {
                scene: null,
                text: '"Game Development in JS - The Complete Guide (w/ Phaser 3)"'
            }
            
        ]
    }

    preload() {
    }

    create() {
        super.create();
        this.createMenu(this.menu, ()=>{}, true);
    }

}

export default CreditsScene;