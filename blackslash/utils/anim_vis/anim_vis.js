import preact from 'preact';
import Container from './container';

const ANIM_VIM = {


};


class Component {

    constructor (container, settings) {

        settings = Component.default_settings;

        this.container = <Container
            cmp={this}
            sceneSize={[settings.width, settings.width/settings.wh_ratio]}
            onMounted={init_d3o_scene.bind(null, this)}
        />;
        preact.render(this.container, container);
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

Component.default_settings = {
    width: 600,
    wh_ratio: 1.5
};


function init_d3o_scene (cmp) {
    const d3o = new D3O(cmp.container.scene_container);
    d3o.render();
}

