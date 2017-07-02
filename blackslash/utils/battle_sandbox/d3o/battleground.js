import * as THREE from 'three';
import constants from '../constants';

export default class BattleGround {

    constructor () {
        this.width = 10;
        this.height = 8;

        this.buildVertices(7.6);
        this.mLines = this.createLines();
        this.gizmos = new Array(this.width * this.height);
    }

    buildVertices (field_size) {
        const middle = new THREE.Vector2(
            - (field_size * this.width) / 2,
            - (field_size * this.height) / 2
        );
        const vertices = [];

        for (let y=0; y<this.height+1; y+=1) for (let x=0; x<this.width+1; x+=1) {
            vertices.push(new THREE.Vector3(
                middle.x + x*field_size,
                middle.y + y*field_size,
                0
            ));
        }

        this.vertices = vertices;
    }

    createLines () {
        const vertices = [];
        const color = new THREE.Color(0x888888);
        const colors = [];

        let iv = 0, ic = 0;
        const columns = this.width + 1;
        const rows = this.height + 1;
        for (let y=0; y<rows; y+=1) {
            this.vertices[y * columns].toArray(vertices, iv); iv += 3;
            color.toArray(colors, ic); ic += 3;
            this.vertices[(y + 1) * columns - 1].toArray(vertices, iv); iv += 3;
            color.toArray(colors, ic); ic += 3;
        }

        const last_row_index = this.height * columns;
        for (let x=0; x<columns; x+=1) {
            this.vertices[x].toArray(vertices, iv); iv += 3;
            color.toArray(colors, ic); ic += 3;
            this.vertices[last_row_index + x].toArray(vertices, iv); iv += 3;
            color.toArray(colors, ic); ic += 3;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});
        return new THREE.LineSegments(geometry, material);
    }

    addToScene (d3o) {
        d3o.scene.add(this.mLines);
    }

    setGizmoToField (field_index, gizmo, d3o) {
        const columns = this.width + 1;
        const y = Math.floor(field_index / this.width);
        const x = field_index % this.width;
        const i = (y + 1) * columns + x;

        const vertices = [
            this.vertices[i - columns],      // 0
            this.vertices[i],                // 2
            this.vertices[i - columns + 1],  // 1
            this.vertices[i - columns + 1],  // 1
            this.vertices[i],                // 2
            this.vertices[i + 1],            // 3
        ];

        gizmo.createSprite(vertices);
        this.gizmos[field_index] = gizmo;
        console.log(gizmo.mesh);
        d3o.scene.add(gizmo.mesh);
    }

}