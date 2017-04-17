// import preact from 'preact';

import D3O from './d3o/lib';
import * as THREE from 'three';

document.addEventListener('DOMContentLoaded',function(){
    const container = document.createElement('DIV');
    container.style.width = '600px';
    container.style.height = '400px';
    document.body.appendChild(container);

    const d3o = new D3O(container, {default_stage});
});


function default_stage (d) {

    d.render();

    const texture = new THREE.TextureLoader().load('/assets/gfx.png', function () {
        const material = new THREE.MeshBasicMaterial({map: texture});

        const uv_item_size = 0.5;
        const uv_shifts= [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1]
        ].map(([x, y]) => {
            return function (uvs) {
                uvs[0][0].set((0+x) * uv_item_size, (1+y) * uv_item_size);
                uvs[0][1].set((0+x) * uv_item_size, (0+y) * uv_item_size);
                uvs[0][2].set((1+x) * uv_item_size, (1+y) * uv_item_size);
                uvs[1][0].set((0+x) * uv_item_size, (0+y) * uv_item_size);
                uvs[1][1].set((1+x) * uv_item_size, (0+y) * uv_item_size);
                uvs[1][2].set((1+x) * uv_item_size, (1+y) * uv_item_size);
            };
        });

        // [-40, -15, 15, 40].map((x, i) => {
        //     const geometry = new THREE.PlaneGeometry(20, 20);
        //
        //      uv_shifts[i](geometry.faceVertexUvs[0]);
        //
        //     const mesh = new THREE.Mesh(geometry, material);
        //     mesh.position.x = x;
        //     d.scene.add(mesh);
        //
        // });


        const geometry = new THREE.PlaneGeometry(40, 40);
        window.ggg =geometry;

        // geometry.faceVertexUvs[0] = uv_shifts[i];

        const mesh = new THREE.Mesh(geometry, material);
        d.scene.add(mesh);





        let i = 0;
        setInterval( () => {

            uv_shifts[i](geometry.faceVertexUvs[0]);
            geometry.uvsNeedUpdate = true;
            mesh.uvsNeedUpdate = true;


            i += 1;
            if (i>=4) i = 0;

            d.render();

        }, 100);




    });




}