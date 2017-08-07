import preact from 'preact';
import D3O from '../../d3o/lib';
import * as THREE from 'three';

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
    let gizmos = [];

    const settings = {
        width: 500,
        wh_ratio: 1.5
    };

    function init_d3o (container) {
        d3o = new D3O(container.scene_container, {
            view_angle: 0
        });
        window.d3o = d3o;

        const manager = new THREE.LoadingManager(on_loaded);
        D3O.Gizmo.loadTypes(manager);

        d3o.render();
    }

    function on_loaded () {
        build_gizmos(D3O.Gizmo.types.baf, 'walkr');
        d3o.render();
        setInterval(() => {
            gizmos.forEach(g => g.update());
            d3o.render();
        }, 500);
    }

    function build_gizmos (type, def_sequence) {
        gizmos.forEach(g => d3o.scene.remove(g.mesh));
        gizmos.length = 0;

        [
            [0.4, -38, -15],
            [0.5, -18, -15],
            [0.75, -25, 12],
            [1.5, 20, 0]
        ].forEach(([pixel_size, x, y]) => {

            const gizmo = new D3O.Gizmo(type, {
                def_sequence,
                pixel_size
            });
            gizmo.mesh.position.x = x;
            gizmo.mesh.position.y = y + gizmo.type.frame_size[1] * gizmo.type.pixel_size / 2;
            gizmo.update();
            gizmos.push(gizmo);
            d3o.scene.add(gizmo.mesh);
        });
    }

    preact.render(
        <Container
            sceneSize={[settings.width, settings.width/settings.wh_ratio]}
            onMounted={init_d3o}
            buildGizmos={build_gizmos}
        />
        , document.getElementById('bs-container')
    );

});