import preact from 'preact';
import Container from './container';
import * as THREE from 'three';
import D3O from '../../d3o/lib';

export default class AnimationVisualisation {

    constructor (container, settings) {

        settings = AnimationVisualisation.default_settings;

        preact.render(
            <Container
                ref={c => this.container = c}
                cmp={this}
                sceneSize={[settings.width, settings.width/settings.wh_ratio]}
                onMounted={init_d3o_scene.bind(null, this)}
                onTemporaryAnimation={this.setAnimation.bind(this)}/>
            , container
        );
    }

    setAnimation (animation) {
        if (animation.image === null) return;

        if (!this.last_texture || this.last_texture.image !== animation.image) {
            const texture = new THREE.Texture(animation.image);
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.needsUpdate = true;
            this.last_texture = texture;
        }

        const sprite_definition = {
            size: [60, 60],
            texture: this.last_texture,
            frame_size: animation.frame_size,
            sequences: {
                def: {index: 0, length: animation.length}
            }
        };

        this.setSprite(sprite_definition);
        this.setLooper(600);
    }

    setSprite (sprite_definition) {
        if (this.sprite) this.d3o.scene.remove(this.sprite.mesh);

        this.sprite = new D3O.Sprite(sprite_definition);
        this.d3o.scene.add(this.sprite.mesh);

        this.sprite.setAnimation('def');
        this.d3o.render();
    }

    setLooper (time) {
        if (this.looper) clearInterval(this.looper);
        if (!this.d3o || ! this.sprite) return;

        this.looper = setInterval(() => {
            if (this.sprite) this.sprite.update();
            this.d3o.render();
        }, time);
    }

}

AnimationVisualisation.default_settings = {
    width: 600,
    wh_ratio: 1.5
};


function init_d3o_scene (cmp) {
    const d3o = new D3O(cmp.container.scene_container);
    d3o.render();
    cmp.d3o = d3o;
}

