import preact from 'preact';
import Container from './container';
import D3O from '../../d3o/lib';

export default class BattleSandbox {

    constructor (settings) {
        this.settings = settings;
    }

    renderInto (container) {
        preact.render(
            <Container
                ref={c => this.container = c}
                sandbox={this}
                sceneSize={[this.settings.width, this.settings.width/this.settings.wh_ratio]}
                onMounted={this.settings.init_d3o.bind(null, this)}/>
            , container
        );
    }

}

document.addEventListener('DOMContentLoaded',function(){

    const box = new BattleSandbox({
        width: 600,
        wh_ratio: 1.5,

        init_d3o (component) {
            const d3o = new D3O(component.container.scene_container);
            d3o.render();
            component.d3o = d3o;
        }

    });

    box.renderInto(document.getElementById('bs-container'));

});
