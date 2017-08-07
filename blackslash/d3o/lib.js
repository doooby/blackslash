import * as THREE from 'three';

import BattleGround from './battleground';
import Gizmo from './gizmo';

export default class D3O {

    constructor (container, opts={}) {
        this.settings = default_options(opts);
        this.container = container;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(this.settings.bg_color);
        this.setSize();

        container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.buildCamera();
    }

    setSize () {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    buildCamera () {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspect = width / height;

        // this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 50, 100);
        this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 100);
        const distance = 70;

        this.camera.position.y = distance * Math.sin(this.settings.view_angle);
        this.camera.position.z = -distance * Math.cos(this.settings.view_angle);

        this.camera.up.y = -1; //x->right, y->down
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    onContainerSizeChanged () {
        this.setSize();
        this.buildCamera();
        this.render();
    }

    render () {
        if (this.renderer) this.renderer.render(this.scene, this.camera);
    }

    // mouse_hit_position (event) {
    //     let element = this.renderer.domElement;
    //     let x = event.clientX - element.offsetLeft + document.documentElement.scrollLeft;
    //     let y = event.clientY -  element.offsetTop + document.documentElement.scrollTop;
    //     let v = new THREE.Vector2(
    //         2 * (x / element.clientWidth) - 1,
    //         -2 * (y / element.clientHeight) + 1
    //     );
    //
    //     let ray = new THREE.Raycaster();
    //     ray.setFromCamera(v, this.camera);
    //     let hit = ray.intersectObjects(this.board.positions.map(p => p.mesh))[0];
    //     if (hit) return hit.object.__kerkel_position;
    // }

}

D3O.BattleGround = BattleGround;
D3O.Gizmo = Gizmo;

function default_options (opts) {
    return Object.assign({
        bg_color: 0x4f74c2,
        view_angle: 2/24 * Math.PI
    }, opts);
}

// function on_mouse_down(event) {
//     if (!this.session || this.session.local_player_i !== this.board.player_on_move) return;
//
//     let position = this.mouse_hit_position(event);
//     if (position) {
//         let possible_positions = this.board.possibleMoves(position);
//         if (!possible_positions) return;
//
//         this.move_context = {
//             start: position,
//             possible_positions
//         };
//
//         possible_positions.forEach(p => p.setMoveColor());
//         this.render();
//     }
// }
//
// function on_mouse_up (event) {
//     let move = this.move_context;
//
//     if (move) {
//         this.move_context = null;
//         move.possible_positions.forEach(p => p.resetColor());
//
//         let end_position = this.mouse_hit_position(event);
//         if (end_position && move.possible_positions.includes(end_position)) {
//             this.board.player_on_move = null;
//             this.board.move(move.start, end_position);
//             if (this._on_move_callback) this._on_move_callback(move.start.i, end_position.i);
//         }
//
//         this.render();
//     }
// }
//
// function on_mouse_out () {
//     if (this.move_context) {
//         this.move_context.possible_positions.forEach(p => p.resetColor());
//         this.render();
//     }
//     this.move_context = null;
// }


