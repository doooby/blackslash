import preact from 'preact';
import UiContainer from './components/ui_container';

import D3O from './d3o/lib';
import * as THREE from 'three';

import AnimationVisualisation from './utils/anim_vis/animation_visualisation';

document.addEventListener('DOMContentLoaded',function(){

    const anim_vis = new AnimationVisualisation(document.querySelector('.container'));

    // const app_container = document.createElement('DIV');
    // app_container.style.width = '600px';
    // document.body.appendChild(app_container);
    //
    // const ui_container = document.createElement('DIV');
    // app_container.appendChild(ui_container);
    //
    // const d3o_container = document.createElement('DIV');
    // d3o_container.style.width = '600px';
    // d3o_container.style.height = '400px';
    // app_container.appendChild(d3o_container);
    //
    // const d3o = new D3O(d3o_container);
    // d3o.render();
    // preact.render(<UiContainer onChange={reset_scene.bind(null, d3o)}/>, ui_container);
    // commence_loop(d3o);
    //
    // (new THREE.ImageLoader()).load('/assets/chess.png', function (image) {
    //     reset_scene(d3o, 'IMG', image);
    // });
});

const sprite_definition = {
    size: [60, 60],
    texture: null,
    frame_size: [8, 8],
    sequences: (function () {
        const seqs = {};
        for (let i=0; i<8; i+=1) seqs[i.toString()] = {index: i, length: 8};
        return seqs;
    }())
};
let animation = 0;

function reset_scene (d3o, change, value) {
    switch (change) {

        case 'IMG':

            const texture = new THREE.Texture(value);
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
            texture.needsUpdate = true;
            sprite_definition.texture = texture;

            if (d3o.sprite) d3o.scene.remove(d3o.sprite.mesh);
            d3o.sprite = new D3O.Sprite(sprite_definition);
            d3o.scene.add(d3o.sprite.mesh);

            d3o.sprite.setAnimation(animation);
            break;

    }
}

function commence_loop (d3o) {
    let i = 0;
    setInterval(() => {

        i += 1;
        if (i >= 8) i = 0;

        if (d3o.sprite) d3o.sprite.update();
        d3o.render();

    }, 800);
    d3o.render();
}


// function default_stage (d) {
//
//     d.render();
//
//     const loader = new THREE.LoadingManager();
//     const assets = {
//         t_gfx2: (new THREE.TextureLoader(loader)).load('/assets/chess.png')
//     };
//
//     assets.t_gfx2.magFilter = THREE.NearestFilter;
//     assets.t_gfx2.minFilter = THREE.LinearMipMapLinearFilter;
//
//     let sprite = null;
//
//     let definition = {
//         size: [60, 60],
//         texture: assets.t_gfx2,
//         frame_size: [8, 8],
//         sequences: (function () {
//             const seqs = {};
//             for (let i=0; i<8; i+=1) seqs[i.toString()] = {index: i, length: 8};
//             return seqs;
//         }())
//     };
//
//     console.log(definition);
//
//
//     loader.onLoad = function () {
//         sprite = new D3O.Sprite(definition);
//         sprite.setAnimation('0');
//         d.scene.add(sprite.mesh);
//
//
//         let i = 0;
//         setInterval( () => {
//
//             i += 1;
//             if (i>=8) i = 0;
//
//             sprite.update();
//             d.render();
//
//         }, 800);
//         d.render();
//     };
//
// }