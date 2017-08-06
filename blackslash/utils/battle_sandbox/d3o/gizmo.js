import * as THREE from 'three';
import constants from '../constants';

export default class Gizmo {

    constructor (type) {
        this.type = type;
        const geometry = create_geometry(type.size);
        const material = create_material(type.texture, type.frame_size[0], type.frame_size[1]);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.__d3o = this;
        this.uniforms = material.uniforms;

        this.sequences = type.sequences;
        this.frame = -1;
        this.seq = null;
        this.next_sequence = type.def_sequence;
    }

    update () {
        if (this.next_sequence) {
            this.seq = this.sequences[this.next_sequence];
            this.next_sequence = null;
            this.frame = -1;
            this.uniforms.sequence.value = this.seq.index;
        }

        if (this.seq) {
            this.frame += 1;
            if (this.frame >= this.seq.length) this.frame = 0;
            this.uniforms.frame.value = this.frame;
        }
    }

}

Gizmo.types = {};
Gizmo.loadTypes = function (manager) {
    ['baf'].forEach(type => {
        Gizmo.loadAndParseData('/assets/animations/' + type + '.json', manager, {size: 1, def_sequence: 'walkr'});
    });
};

Gizmo.loadAndParseData = function (url, manager, preset) {

    const loader = new THREE.FileLoader(manager);
    loader.load(url, data => {
        const {name, frame_size, sequences, image_data} = JSON.parse(data);

        const image = new Image();
        image.src = 'data:image/png;base64,' + image_data;
        const texture = new THREE.Texture();
        texture.image = image;
        texture.format = THREE.RGBAFormat;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestMipMapNearestFilter;
        texture.needsUpdate = true;

        Gizmo.types[name] = Object.assign(preset, {
            name,
            frame_size,
            sequences,
            texture
        });
    });
};

function create_geometry (size) {
    const geometry = new THREE.BufferGeometry();

    size = constants.field_size * size;
    const vertices = [ // 0, 2, 1, 1, 2, 3
        new THREE.Vector3(-size/2, -size, 0),
        new THREE.Vector3(-size/2, 0, 0),
        new THREE.Vector3(size/2, -size, 0),
        new THREE.Vector3(size/2, -size, 0),
        new THREE.Vector3(-size/2, 0, 0),
        new THREE.Vector3(size/2, 0, 0)
    ];
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

    return geometry;
}

function create_material (texture, frame_width, frame_height) {
    return new THREE.ShaderMaterial({
        uniforms: {
            tGizmo: {type: 't', value: texture},
            sequence: {type: 'i', value: 0},
            frame: {type: 'i', value: 0},
            fw: {type: 'f', value: (1 / texture.image.width * frame_width)},
            fh: {type: 'f', value: (1 / texture.image.height * frame_height)}
        },
        vertexShader: vertext_shader,
        fragmentShader: fragment_shader,
        transparent: true
    });
}

const vertext_shader = `
uniform float sequence;
uniform float frame;
uniform float fw;
uniform float fh;
varying vec2 vUv;

void main() {
  vUv = vec2( (uv.x + frame) * fw, (uv.y + sequence) * fh );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment_shader = `
uniform sampler2D tGizmo;
varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(tGizmo, vUv);
}`
;