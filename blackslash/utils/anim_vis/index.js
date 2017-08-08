import preact from 'preact';
import D3O from '../../d3o/lib';
import * as THREE from 'three';

let d3o = null;
let form = null;
const state = {
    gizmo: 'baf',
    sequence: 'walkl',
    animation_speed: 80,
};

const settings = {
    width: 500,
    wh_ratio: 1.5,
    samples: [
        [0.4, -38, -15],
        [0.5, -18, -15],
        [0.75, -25, 12],
        [1.5, 20, 0]
    ]
};

function init_d3o (scene_container) {
    d3o = new D3O(scene_container, {
        view_angle: 0
    });
    window.d3o = d3o;
    window.D3O = D3O;
    d3o.render();

    d3o.gizmos = [];
    load_gizmos_types(() => {
        update_from_resources();
        change_gizmos(state.gizmo, state.sequence);
        gismos_loader();
        animation_loop();
    });
}

function animation_loop () {
    d3o.gizmos.forEach(g => g.update());
    d3o.render();
    setTimeout(animation_loop, state.animation_speed);
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

function gismos_loader () {
    load_gizmos_types(changed => {
        if (changed.includes(state.gizmo)) change_gizmos(state.gizmo, state.sequence);

        const errors = Object.keys(D3O.Gizmo.types)
            .map(name => D3O.Gizmo.types[name].error)
            .filter(err => err);
        if (errors.length) console.log(errors);

        setTimeout(gismos_loader, 6000);
    });
}

function update_from_resources () {
    form.setState(Object.assign({types: D3O.Gizmo.types}, state));
}

function on_speed_changed (e) {
    const value = e.target.value;
    const number = Number(value);
    if (value !== '' && !isNaN(number) && number >= 10 && number <= 2000) state.animation_speed = number;
}

function change_sequence (sequence) {
    state.sequence = sequence;
    d3o.gizmos.forEach(g => {
        g.next_sequence = sequence;
        g.update();
    });
}

function change_gizmos (type_name, sequence) {
    state.gizmo = type_name;
    state.sequence = sequence;
    d3o.gizmos.forEach(g => d3o.scene.remove(g.mesh));
    d3o.gizmos.length = 0;

    const type = D3O.Gizmo.types[type_name];
    if (!type || type.error) return;

    settings.samples.forEach(([pixel_size, x, y]) => {

        const gizmo = new D3O.Gizmo(type, {
            def_sequence: sequence,
            pixel_size
        });
        gizmo.mesh.position.x = x;
        gizmo.mesh.position.y = y + gizmo.type.frame_size[1] * gizmo.type.pixel_size / 2;
        gizmo.update();
        d3o.gizmos.push(gizmo);
        d3o.scene.add(gizmo.mesh);
    });
}

document.addEventListener('DOMContentLoaded',function(){

    preact.render(
        <Container
            sceneSize={[settings.width, settings.width/settings.wh_ratio]}
            onMounted={init_d3o}
        />
        , document.getElementById('bs-container')
    );

});

class Container extends preact.Component {

    render ({sceneSize}) {
        return <div
            id="bsu-anim-vis"
            style={`width: ${sceneSize[0]}px;`}>

            <AnimForm
                ref={el => form = el}/>

            <div
                ref={el => this.scene_container = el}
                style={`height: ${sceneSize[1]}px;`}/>
        </div>;
    }

    componentDidMount () {
        this.props.onMounted(this.scene_container);
    }

}

class AnimForm extends preact.Component {

    render (_, {types, gizmo, sequence, animation_speed}) {
        const gizmos_enabled = types && types.length!==0;
        const sequences = (gizmos_enabled && Object.keys(types).includes(gizmo) &&
            Object.keys(types[gizmo].sequences)) || [];

        return <div
            className="ui">

            <div
                className="form-group row">
                <label
                    className="col-3 col-form-label">
                    gizmo:
                </label>
                <div
                    className="col-3">
                    <select
                        value={gizmo}
                        className="form-control"
                        disabled={!gizmos_enabled}
                        onChange={e => {
                            change_gizmos(e.target.value, sequence);
                            this.setState({gizmo: e.target.value});
                        }}>
                        {gizmos_enabled && Object.keys(types).map(name => <option value={name}>{name}</option>)}
                    </select>
                </div>

                <label
                    className="col-3 col-form-label">
                    sequence:
                </label>
                <div
                    className="col-3">
                    <select
                        value={sequence}
                        className="form-control"
                        disabled={sequences.length === 0}
                        onChange={e => {
                            change_sequence(e.target.value);
                            this.setState({sequence: e.target.value})
                        }}>
                        {sequences.map(name => <option value={name}>{name}</option>)}
                    </select>
                </div>
            </div>

            <div
                className="form-group row">
                <label
                    className="offset-3 col-6 col-form-label">
                    animation delay:
                </label>
                <div
                    className="col-3">
                    <input
                        type="text"
                        className="form-control"
                        value={animation_speed}
                        onKeyUp={on_speed_changed}/>
                </div>
            </div>

        </div>;
    }

}