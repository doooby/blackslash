// import preact from 'preact';

import D3O from './d3o/lib';
import * as THREE from 'three';

document.addEventListener('DOMContentLoaded',function(){
    const container = document.createElement('DIV');
    container.style.width = '600px';
    container.style.height = '400px';
    document.body.appendChild(container);

    const d3o = new D3O(container);
    default_stage(d3o);
});


function default_stage (d) {

    d.render();

    const loader = new THREE.LoadingManager();
    const assets = {
        t_gfx2: (new THREE.TextureLoader(loader)).load('/assets/gfx2.png')
    };

    assets.t_gfx2.magFilter = THREE.NearestFilter;
    assets.t_gfx2.minFilter = THREE.LinearMipMapLinearFilter;

    let sprite = null;

    loader.onLoad = function () {
        sprite = new D3O.Sprite(20, 20, assets.t_gfx2);
        d.scene.add(sprite.mesh);

        sprite.setAnimation('clock');
        let i = 0;
        setInterval( () => {

            i += 1;
            if (i>=8) i = 0;

            sprite.update();
            d.render();

        }, 100);
    };

}