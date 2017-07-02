import preact from 'preact';
import Container from './container';
import D3O from '../../d3o/lib';
import * as THREE from 'three';

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
        width: 600,
        wh_ratio: 1.5,

        init_d3o (component) {
            const d3o = new D3OBattle(component.container.scene_container);
            component.d3o = d3o;

            const manager = new THREE.LoadingManager(() => {

                const bg = new BattleGround();
                bg.addToScene(d3o);

                const gizmo = new Gizmo();
                bg.setGizmoToField(0, gizmo, d3o);

                // const gridHelper = new THREE.GridHelper(60, 8, 0x888888, 0x888888);
                // gridHelper.rotation.x = 1/2 * Math.PI;
                // d3o.scene.add(gridHelper);

                // console.log(gridHelper);

                // d3o.scene.add(new THREE.AxisHelper(40));
                d3o.render();

            });

            Gizmo.loadTextures(manager);
            d3o.render();
        }

    });

    box.renderInto(document.getElementById('bs-container'));

});

class D3OBattle extends D3O {

    buildCamera () {
        // let scene_h2 = 50;
        // let scene_w2 = (this.container.clientWidth / this.container.clientHeight) * scene_h2;

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 100);
        const distance = 70;
        const angle = 1/12 * Math.PI;
        this.camera.position.y = distance * Math.sin(angle);
        this.camera.position.z = -distance * Math.cos(angle);

        const y_shift = 5;
        this.camera.position.y += y_shift;

        this.camera.up.y = -1; //x->right, y->down
        this.camera.lookAt(new THREE.Vector3(0, y_shift, 0));
    }

}