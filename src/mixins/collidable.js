export default {
    addCollider(collisionObj, callback, context) {
        this.scene.physics.add.collider(this, collisionObj, callback, null, context || this);
        return this;
    },
    
    addOverlap(collisionObj, callback, context) {
        this.scene.physics.add.overlap(this, collisionObj, callback, null, context || this);
        return this;
    },

    bodyPositionDifferenceX: 0,
    previousRay: null,
    previousHasHit: null,

    raycast(body, layer, rayLength = 30, precision = 0, steepness = 0.5) {
        const { x, y, width, halfHeight } = body;

        this.bodyPositionDifferenceX += body.x - body.prev.x;

        if ((Math.abs(this.bodyPositionDifferenceX) <= precision) && (this.previousHasHit !== null)) {
            return {
                ray: this.previousRay, hasHit: this.hasHit
            }
        }

        const line = new Phaser.Geom.Line();
        let hasHit = false;

        switch (body.facing) {
            case Phaser.Physics.Arcade.FACING_RIGHT:
                line.x1 = x + width;
                line.x2 = line.x1 + rayLength * steepness;
                line.y1 = y + halfHeight;
                line.y2 = line.y1 + rayLength;
                break;
            case Phaser.Physics.Arcade.FACING_LEFT:
                line.x1 = x;
                line.x2 = line.x1 - rayLength * steepness;
                line.y1 = y + halfHeight;
                line.y2 = line.y1 + rayLength;
                break;
        }

        const hits = layer.getTilesWithinShape(line);

        if (hits.length > 0) {
            hasHit = this.previousHasHit = hits.some(hit => hit.index !== -1);
        }

        this.previousRay = line;
        this.bodyPositionDifferenceX = 0;

        return { ray: line, hasHit };
    }
}