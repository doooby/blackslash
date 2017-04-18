import * as THREE from 'three';

export default class Sprite {

    constructor (width, height, texture) {

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = create_material(texture);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.__sprite = this;

        this.animation_sequences = {
            'def': {
                index: 0,
                length: 8
            },
            'clock': {
                index: 3,
                length: 8
            }
        };

        calc_frame_dimensions(this, texture.image, 20, 20);
        this.setAnimation('def');
    }

    setAnimation (name) {
        this.animation = null;

        const sequence = this.animation_sequences[name];
        if (!sequence) return;

        this.animation = Object.assign({
            frame: 0
        }, sequence);
        this.setUVs(0, this.animation.index);
    }

    update () {
        if (this.animation) {
            this.animation.frame += 1;
            if (this.animation.frame >= this.animation.length) this.animation.frame = 0;

            this.setUVs(this.animation.frame, this.animation.index);
        }
    }

    setUVs (x, y) {
        const uvs = this.mesh.geometry.faceVertexUvs[0];
        uvs[0][0].set((0+x) * this.frame_width, 1 - (0+y) * this.frame_height);
        uvs[0][1].set((0+x) * this.frame_width, 1 - (1+y) * this.frame_height);
        uvs[0][2].set((1+x) * this.frame_width, 1 - (0+y) * this.frame_height);
        uvs[1][0].set((0+x) * this.frame_width, 1 - (1+y) * this.frame_height);
        uvs[1][1].set((1+x) * this.frame_width, 1 - (1+y) * this.frame_height);
        uvs[1][2].set((1+x) * this.frame_width, 1 - (0+y) * this.frame_height);
        this.mesh.geometry.uvsNeedUpdate = true;
    }

}

function create_material (texture) {
    return new THREE.MeshBasicMaterial({
        map: texture
    });
}

function calc_frame_dimensions (sprite, image, width, height) {
    sprite.frame_width = 1 / image.width * width;
    sprite.frame_height = 1 / image.height * height;
}
