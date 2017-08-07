import * as THREE from 'three';

export default class BattleGround {

    constructor (width, height, field_size) {
        this.width = width;
        this.height = height;
        this.field_size = field_size;

        this.buildVertices();
        this.mLines = this.createLines();

        // this.gizmos_map = new Array(this.width * this.height);
        this.entities = [];
    }

    buildVertices () {
        const middle = new THREE.Vector2(
            - (this.field_size * this.width) / 2,
            - (this.field_size * this.height) / 2
        );
        const vertices = [];

        for (let y=0; y<this.height+1; y+=1) for (let x=0; x<this.width+1; x+=1) {
            vertices.push(new THREE.Vector3(
                x * this.field_size + middle.x,
                y * this.field_size + middle.y,
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
        this.entities.forEach(e => d3o.scene.add(e));
    }

    addEntity (entity, d3o) {
        this.entities.push(entity);
        d3o.scene.add(entity.mesh);
    }

    xy2vector ({x, y}, v=new THREE.Vector3()) {
        const index = (y + 1) * (this.width + 1) + x;
        v.copy(this.vertices[index]);
        v.x += this.field_size / 2;
        return v;
    }

    i2xy (i) {
        return {
            i: i,
            x: i % this.width,
            y: Math.floor(i / this.width)
        };
    }

    xy2i ({x, y}) {
        return this.width * y + x;
    }

}