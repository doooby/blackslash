import preact from 'preact';
import Container from './container';
import D3O from '../../d3o/lib';
import * as THREE from 'three';
import './enhanced_three';

const constants = {
    field_size: 7.6,
    pixel_size: 0.23,
    bg_width: 10,
    bg_height: 8,
    view_angle: 2/24 * Math.PI
};

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
        width: 1000,
        wh_ratio: 1.5,

        init_d3o (component) {
            const d3o = new D3O(component.container.scene_container, {
                bg_color: 0x2B2B2B
            });
            component.d3o = d3o;
            window.d3o = d3o;

            const manager = new THREE.LoadingManager(() => {

                const bg = new D3O.BattleGround(constants.bg_width,
                    constants.bg_height, constants.field_size);
                bg.addToScene(d3o);

                [0, 10, 11, 17, 24, 31, 45, 46, 48, 61, 64, 66, 70, 75].forEach(i => {
                    const gizmo = new D3O.Gizmo(D3O.Gizmo.types.baf, {
                        def_sequence: ((Math.random() > 0.5) ? 'walkl' : 'walkr'),
                        pixel_size: constants.pixel_size
                    });
                    gizmo.mesh.position.copy(bg.xy2vector(bg.i2xy(i)));
                    gizmo.mesh.rotation.x = constants.view_angle;
                    gizmo.update();
                    bg.addEntity(gizmo, d3o);
                });

                d3o.render();

                setInterval(function () {
                    bg.entities.forEach(e => e.update());
                    d3o.render();
                }, 400);
            });

            D3O.Gizmo.loadTypes(manager);


            const controls = new THREE.OrbitControls(d3o.camera, d3o.renderer.domElement);
            controls.addEventListener('change', d3o.render.bind(d3o));
            d3o.scene.add(new THREE.AxisHelper(40));

            d3o.render();
        }

    });

    box.renderInto(document.getElementById('bs-container'));

});