import {defs, tiny} from '../examples/common.js';
import {Debug_Point} from "./visual_debugger.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Obstacle {
    constructor(shape, material, position, bounciness, points = 0) {
        this.bounciness = bounciness;
        this.position = position;
        this.shape = shape;
        this.material = material;

        this.vertices = [];
        this.debug_points = [];
        this.points = points;
    }
    getVertices() {
        return this.vertices;
    }
}

export class Rectangular extends Obstacle {
    constructor(shape, material, position, bounciness, width, height, depth, rotation, z_scale, points = 0) {
        super(shape, material, position, bounciness, points);
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.rotation = rotation * Math.PI / 180;
        this.z_scale = z_scale;

        let v1_prev = vec4(-width - 1, height + 1, 0, 1);
        let v2_prev = vec4(width + 1, height + 1, 0, 1);
        let v3_prev = vec4(width + 1, -height - 1, 0, 1);
        let v4_prev = vec4(-width - 1, -height - 1, 0, 1);

        const rotation_matrix = Mat4.rotation(this.rotation, 0, 0, 1);

        let v1 = rotation_matrix.times(v1_prev);
        let v2 = rotation_matrix.times(v2_prev);
        let v3 = rotation_matrix.times(v3_prev);
        let v4 = rotation_matrix.times(v4_prev);

        const translation_matrix = Mat4.translation(this.position[0], this.position[1], 0);

        this.vertices.push(translation_matrix.times(v1));
        this.vertices.push(translation_matrix.times(v2));
        this.vertices.push(translation_matrix.times(v3));
        this.vertices.push(translation_matrix.times(v4));

        let colors = [hex_color("#EE4B2B"), hex_color("#eec12b"), hex_color("#3fee2b"), hex_color("#2b45ee")];

        for (let i = 0; i < this.vertices.length; i++) {
            //override color to red
            this.debug_points.push(new Debug_Point(this.material.override({color: colors[i]}), this.vertices[i]))
        }
    }

    render(context, program_state) {
        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1], this.depth))
            .times(Mat4.rotation(this.rotation,0,0,1))
            .times(Mat4.scale(this.width, this.height, this.z_scale)), this.material);

        /*for (let i = 0; i < this.debug_points.length; i++) {
            this.debug_points[i].render(context, program_state);
        }*/
    }
}

export class Cylindrical extends Obstacle {
    constructor(shape, material, position, bounciness, radius) {
        super(shape, material, position, bounciness);
        this.radius = radius;
    }

    render(context, program_state) {
        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1],this.position[2])), this.material);
    }
}