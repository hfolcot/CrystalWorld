import Phaser from "phaser";
import Collectable from "../collectables/Collectable";

class Collectables extends Phaser.Physics.Arcade.StaticGroup {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createFromConfig({
            classType: Collectable
        })
    }

    mapProperties(propertiesList){

        if(!propertiesList || propertiesList.length === 0) {
            return {};
        }

        return propertiesList.reduce((map, object) => {
            map[object.name] = object.value;
            return map;
        }, {})
    }

    addFromLayer(layer) {
        const {score: defaultScore, type} = this.mapProperties(layer.properties);
        layer.objects.forEach(object => {
            const collectable = this.get(object.x, object.y, type);
            const objProperties = this.mapProperties(object.properties);
            
            collectable.score = objProperties.score || defaultScore;
        })
    }
}

export default Collectables;