import preact from 'preact';
import Container from './container';
import D3O from '../../d3o/lib';
import * as THREE from 'three';
import './enhanced_three';

import constants from './constants';
import BattleGround from './d3o/battleground';
import Gizmo from './d3o/gizmo';

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
            const d3o = new D3OBattle(component.container.scene_container, {
                bg_color: 0x2B2B2B
            });
            component.d3o = d3o;
            window.d3o = d3o;

            const manager = new THREE.LoadingManager(() => {

                const bg = new BattleGround(constants.bg_width,
                    constants.bg_height, constants.field_size);
                bg.addToScene(d3o);

                [0, 10, 11, 17, 24, 31, 45, 46, 48, 61, 64, 66, 70, 75].forEach(i => {
                    const gizmo = new Gizmo(Gizmo.types.baf);
                    gizmo.mesh.position.copy(bg.xy2vector(bg.i2xy(i)));
                    gizmo.mesh.rotation.x = constants.view_angle;
                    if (Math.random() > 0.5) gizmo.next_sequence = 'walkl';
                    gizmo.update();
                    bg.addEntity(gizmo, d3o);
                });

                d3o.render();

                setInterval(function () {
                    bg.entities.forEach(e => e.update());
                    d3o.render();
                }, 400);
            });

            Gizmo.loadTypes(manager);


            const controls = new THREE.OrbitControls(d3o.camera, d3o.renderer.domElement);
            controls.addEventListener('change', d3o.render.bind(d3o));
            d3o.scene.add(new THREE.AxisHelper(40));

            d3o.render();
        }

    });

    box.renderInto(document.getElementById('bs-container'));

});

class D3OBattle extends D3O {

    buildCamera () {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspect = width / height;

        // this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 50, 100);
        this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 100);
        const distance = 70;

        this.camera.position.y = distance * Math.sin(constants.view_angle);
        this.camera.position.z = -distance * Math.cos(constants.view_angle);

        const y_shift = 0;
        this.camera.position.y += y_shift;

        this.camera.up.y = -1; //x->right, y->down
        this.camera.lookAt(new THREE.Vector3(0, y_shift, 0));
    }



}