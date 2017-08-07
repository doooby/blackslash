import * as THREE from 'three';

export default class Gizmo {

    constructor (type, options) {
        this.type = Object.assign(options, type);

        const geometry = create_geometry(this.type.frame_size, this.type.pixel_size);
        const material = create_material(this.type.texture, this.type.frame_size);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.__d3o = this;
        this.uniforms = material.uniforms;

        this.sequences = this.type.sequences;
        this.frame = -1;
        this.seq = null;
        this.next_sequence = this.type.def_sequence;
    }

    update () {
        if (this.next_sequence) {
            this.seq = this.sequences[this.next_sequence];
            this.next_sequence = null;
            this.uniforms.sequence.value = (this.seq ? this.seq.index : -1);
            this.frame = -1;
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
        Gizmo.loadAndParseData(type, manager);
    });
};


Gizmo.loadAndParseData = function (name, manager) {
    const loader = new THREE.FileLoader(manager);
    loader.load('/assets/animations/' + name + '.json', data => {
        const {name, frame_size, sequences, image_data, error} = JSON.parse(data);

        if (error) {
            Gizmo.types[name] = {name, error};
            return;
        }

        const texture = new THREE.Texture();
        texture.image = (new THREE.ImageLoader(manager)).load('data:image/png;base64,' + image_data);
        texture.format = THREE.RGBAFormat;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestMipMapNearestFilter;
        texture.needsUpdate = true;

        Gizmo.types[name] = {
            name,
            frame_size,
            sequences,
            texture
        };
    });
};

function create_geometry (size, pixel_size) {
    const geometry = new THREE.BufferGeometry();

    const w = pixel_size * size[0];
    const h = pixel_size * size[1];
    const vertices = [ // 0, 2, 1, 1, 2, 3
        new THREE.Vector3(-w/2, -h, 0),
        new THREE.Vector3(-w/2, 0, 0),
        new THREE.Vector3(w/2, -h, 0),
        new THREE.Vector3(w/2, -h, 0),
        new THREE.Vector3(-w/2, 0, 0),
        new THREE.Vector3(w/2, 0, 0)
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

function create_material (texture, frame_size) {
    return new THREE.ShaderMaterial({
        uniforms: {
            tGizmo: {type: 't', value: texture},
            sequence: {type: 'i', value: 0},
            frame: {type: 'i', value: 0},
            fw: {type: 'f', value: (1 / texture.image.width * frame_size[0])},
            fh: {type: 'f', value: (1 / texture.image.height * frame_size[1])}
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