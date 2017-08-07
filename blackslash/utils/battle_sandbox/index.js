import preact from 'preact';
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

class Container extends preact.Component {

    render ({sceneSize}) {
        return <div
            id="bsu-battle-sandbox"
            style={`width: ${sceneSize[0]}px;`}>

            <div
                className="ui">
            </div>

            <div
                ref={el => this.scene_container = el}
                className="scene"
                style={`height: ${sceneSize[1]}px;`}/>
        </div>;
    }

    componentDidMount () {
        this.props.onMounted(this);
    }

}

document.addEventListener('DOMContentLoaded',function(){

    let d3o = null;

    const settings = {
        width: 1000,
        wh_ratio: 1.5
    };

    const init_d3o = function (container) {
        d3o = new D3O(container.scene_container, {
            bg_color: 0x2B2B2B
        });
        window.d3o = d3o;

        const manager = new THREE.LoadingManager(on_loaded);
        D3O.Gizmo.loadTypes(manager);

        const controls = new THREE.OrbitControls(d3o.camera, d3o.renderer.domElement);
        controls.addEventListener('change', d3o.render.bind(d3o));
        d3o.scene.add(new THREE.AxisHelper(40));

        d3o.render();
    };

    const on_loaded = function () {
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
    };

    preact.render(
        <Container
            sceneSize={[settings.width, settings.width/settings.wh_ratio]}
            onMounted={init_d3o}/>
        , document.getElementById('bs-container')
    );

});