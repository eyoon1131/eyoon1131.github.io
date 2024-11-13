import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Debug_Point {
    constructor(material, position, life = 1, debug_points = []) {
        this.material = material;
        this.position = position;
        this.shape = new defs.Subdivision_Sphere(4);
        this.life = life;

        this.debug_points = debug_points;
        this.vertices = [];
    }

    render(context, program_state) {

        this.life -= program_state.animation_delta_time / 1000;

        if (this.life <= 0) {
            console.log("array length: " + this.debug_points.length);
            this.debug_points.splice(this.debug_points.indexOf(this), 1);
            delete this;
            return;
        }

        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1], 0))
            .times(Mat4.scale(1, 1, 2)), this.material);
    }
}