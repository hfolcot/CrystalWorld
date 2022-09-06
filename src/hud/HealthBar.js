import Phaser from "phaser";

class HealthBar {
    constructor(scene, x, y, scale = 1, health) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.bar.setScrollFactor(0, 0);
        this.x = x / scale;
        this.y = y / scale;
        this.scale = scale;
        this.value = health;

        this.size = {
            width: 40,
            height: 8
        }

        this.pixelsPerHealth = this.size.width / this.value;

        scene.add.existing(this.bar);
        this.draw(this.x, this.y, this.scale);
    }

    decrease(amount) {
        if(!amount) {
            return;
        }
        
        if (amount <= 0) {
            amount = 0;
        }

        this.value = amount;
        this.draw(this.x, this.y, this.scale);
    }

    draw(x, y, scale) {

        this.bar.clear();
        const { width, height } = this.size;

        const margin = 1;

        this.bar.fillStyle(0x222222);
        this.bar.fillRect(x, y, width + margin, height + margin);

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(x + margin, y + margin, width - margin, height - margin);

        const healthWidth = Math.floor(this.value * this.pixelsPerHealth);


        if (healthWidth <= this.size.width / 3) {
            this.bar.fillStyle(0xff0000);
        }
        else {
            this.bar.fillStyle(0x00ff00);
        }

        if (healthWidth > 0) {
            this.bar.fillRect(x + margin, y + margin, healthWidth - margin, height - margin);
        }

        this.bar.setScrollFactor(0, 0).setScale(scale);
    }
}

export default HealthBar;