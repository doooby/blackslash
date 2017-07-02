import * as THREE from 'three';
import constants from '../constants';

export default class Gizmo {


    createSprite (vertices) { // 0, 2, 1, 1, 2, 3
        if (vertices.length !== 6) throw 'Gizmo.createSprite: bad vertices count';

        const geometry = new THREE.BufferGeometry();

        const attr = new THREE.BufferAttribute(new Float32Array(18), 3)
            .copyVector3sArray(vertices);
        geometry.addAttribute('position', attr);

        const typed_uvs = new Float32Array([
            0, 1,
            0, 0,
            1, 1,
            1, 1,
            0, 0,
            1, 0
        ]);
        geometry.addAttribute('uv', new THREE.BufferAttribute(typed_uvs, 2));
        const material = new THREE.MeshBasicMaterial({map: Gizmo.textures.karel,transparent: true});

        this.mesh = new THREE.Mesh(geometry, material);
    }

    static loadTextures (manager) {
        Gizmo.textures = {
            karel: (new THREE.TextureLoader(manager)).load('/assets/karel.png')
        };
    }

}