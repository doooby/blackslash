import * as THREE from 'three';

export default class Sprite {

    constructor (def) {

        const geometry = new THREE.PlaneGeometry(def.size[0], def.size[1]);
        const material = create_material(def.texture, def.frame_size[0], def.frame_size[1]);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.__sprite = this;

        this.animation_sequences = def.sequences;
        this.setAnimation('def');
    }

    setAnimation (name) {
        this.animation = null;

        const sequence = this.animation_sequences[name];
        if (!sequence) return;

        this.animation = Object.assign({
            frame: 0
        }, sequence);
        this.mesh.material.uniforms.anim_i.value = this.animation.index;
        this.mesh.material.uniforms.anim_f.value = this.animation.frame;
    }

    update () {
        if (this.animation) {
            this.animation.frame += 1;
            if (this.animation.frame >= this.animation.length) this.animation.frame = 0;
            this.mesh.material.uniforms.anim_f.value = this.animation.frame;
        }
    }

}

function create_material (texture, frame_width, frame_height) {
    return new THREE.ShaderMaterial({
        uniforms: {
            tFrames: {type: 't', value: texture},
            anim_i: {type: 'i', value: 0},
            anim_f: {type: 'i', value: 0},
            frame_w: {type: 'f', value: (1 / texture.image.width * frame_width)},
            frame_h: {type: 'f', value: (1 / texture.image.height * frame_height)}
        },
        vertexShader: vertext_shader,
        fragmentShader: fragment_shader
    });
}


const vertext_shader = `
uniform float anim_i;
uniform float anim_f;
uniform float frame_w;
uniform float frame_h;
varying vec2 vUv;

void main() {
  vUv = vec2( (uv.x + anim_f) * frame_w, (uv.y + anim_i) * frame_h );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment_shader = `
uniform sampler2D tFrames;
varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(tFrames, vUv);
}`
;