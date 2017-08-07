import preact from 'preact';
import D3O from '../../d3o/lib';
import * as THREE from 'three';

const state = {
    gizmo: 'baf',
    sequence: 'walkl',
    animation_speed: 80,

    gizmos: []
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
        width: 500,
        wh_ratio: 1.5
    };

    function init_d3o (container) {
        d3o = new D3O(container.scene_container, {
            view_angle: 0
        });
        window.d3o = d3o;
        window.D3O = D3O;
        d3o.render();
        load_gizmos_types(on_loaded);
    }

    function load_gizmos_types (callback) {
        const changed = [];

        const manager = new THREE.LoadingManager(function () {
            callback(changed);
        });

        const status_loader = new THREE.FileLoader(manager);
        status_loader.load('/graphics_state.json', data => {
            const {animations} = JSON.parse(data);
            const new_types = {};

            animations.forEach(({gizmo, dirty}) => {
                const current_type = D3O.Gizmo.types[gizmo];
                if (current_type) new_types[gizmo] = current_type;

                if (!current_type || dirty) {
                    changed.push(gizmo);
                    D3O.Gizmo.loadAndParseData(gizmo, manager);
                }
            });

            D3O.Gizmo.types = new_types;
        });
    }

    function on_loaded () {

        const gizmos_checker = function (changed) {
            const gizmo = state.gizmo;
            if (changed.includes(gizmo)) {
                state.gizmo = null;
                on_sequence_change(gizmo, state.sequence);
            }

            const errors = Object.keys(D3O.Gizmo.types)
                .map(name => D3O.Gizmo.types[name].error)
                .filter(err => err);
            if (errors.length) console.log(errors);

            setTimeout(() => {
                load_gizmos_types(gizmos_checker);
            }, 7000);

        };
        gizmos_checker([state.gizmo]);


        setInterval(() => {
            state.gizmos.forEach(g => g.update());
            d3o.render();
        }, state.animation_speed);
    }

    function on_sequence_change (gizmo, sequence) {
        if (state.gizmo !== gizmo) {
            state.gizmo = gizmo;
            state.sequence = sequence;
            change_gizmos(gizmo, sequence);

        } else if (state.sequence !== sequence) {
            state.sequence = sequence;
            change_sequence(sequence);

        }
    }
    window.on_sequence_change = on_sequence_change;

    function change_sequence (sequence) {
        state.gizmos.forEach(g => {
            g.next_sequence = sequence;
            g.update();
        });
    }

    function change_gizmos (type_name, sequence) {
        state.gizmos.forEach(g => d3o.scene.remove(g.mesh));
        state.gizmos.length = 0;

        const type = D3O.Gizmo.types[type_name];
        if (!type || type.error) return;

        [
            [0.4, -38, -15],
            [0.5, -18, -15],
            [0.75, -25, 12],
            [1.5, 20, 0]
        ].forEach(([pixel_size, x, y]) => {

            const gizmo = new D3O.Gizmo(type, {
                def_sequence: sequence,
                pixel_size
            });
            gizmo.mesh.position.x = x;
            gizmo.mesh.position.y = y + gizmo.type.frame_size[1] * gizmo.type.pixel_size / 2;
            gizmo.update();
            state.gizmos.push(gizmo);
            d3o.scene.add(gizmo.mesh);
        });
    }

    preact.render(
        <Container
            sceneSize={[settings.width, settings.width/settings.wh_ratio]}
            onMounted={init_d3o}
            onSeqChange={on_sequence_change}
        />
        , document.getElementById('bs-container')
    );

});