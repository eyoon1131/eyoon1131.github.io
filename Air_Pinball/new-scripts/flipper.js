import {defs, tiny} from '../examples/common.js';
import {PhysicsCalculations} from "./physics-calculations.js";
import {Debug_Point} from "./visual_debugger.js";
import {Obstacle} from "./obstacles.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Flipper extends Obstacle {
    constructor(shape, material, position, scene, isLeft) {
        super(shape, material, position, .5);

        this.shape = shape;
        this.material = material;
        this.position = position;
        this.scene = scene;

        this.rotationRate = 20;
        this.rotationRange = 3.14159/6;
        this.edgeLength = 13;

        if (isLeft) {this.offset = 2;}
        else {this.offset = -2;}
        this.isLeft = isLeft;
        if (isLeft) { this.rotation = -this.rotationRange; }
        else {this.rotation = this.rotationRange;}

        this.status = 0; //0 = at rest, 1 = flicking up, 2 = flicking down

        this.dt = 0;

        this.debug_points = [];
        this.PhysicsCalculations = new PhysicsCalculations();

        this.triangleVertices = [];

        if (isLeft) {
            this.vertices.push(vec4(this.position[0] + this.edgeLength * Math.cos(this.rotationRange) + .9, this.position[1] - this.edgeLength * Math.sin(this.rotationRange) + 2, 0, 1));
            this.vertices.push(vec4(this.position[0], this.position[1], 0, 1));

            this.triangleVertices.push(vec4(this.position[0] + this.edgeLength * Math.cos(this.rotationRange), this.position[1] + this.edgeLength * Math.sin(this.rotationRange), 0, 1));
            this.triangleVertices.push(vec4(this.position[0] + this.edgeLength * Math.cos(this.rotationRange), this.position[1] - this.edgeLength * Math.sin(this.rotationRange), 0, 1));
            this.triangleVertices.push(vec4(this.position[0], this.position[1], 0, 1));

            //this.vertices.push(vec4(this.position[0] + 6, this.position[1] - 2, 0, 1));
        } else {
            this.vertices.push(vec4(this.position[0] - this.edgeLength * Math.cos(this.rotationRange) - .9, this.position[1] - this.edgeLength * Math.sin(this.rotationRange) + 2, 0, 1));
            this.vertices.push(vec4(this.position[0], this.position[1], 0, 1));

            this.triangleVertices.push(vec4(this.position[0] - this.edgeLength * Math.cos(this.rotationRange), this.position[1] + this.edgeLength * Math.sin(this.rotationRange), 0, 1));
            this.triangleVertices.push(vec4(this.position[0] - this.edgeLength * Math.cos(this.rotationRange), this.position[1] - this.edgeLength * Math.sin(this.rotationRange), 0, 1));
            this.triangleVertices.push(vec4(this.position[0], this.position[1], 0, 1));
        }

        let colors = [hex_color("#EE4B2B"), hex_color("#eec12b"), hex_color("#3fee2b"), hex_color("#2b45ee")];
        for (let i = 0; i < this.triangleVertices.length; i++) {
            this.debug_points.push(new Debug_Point(this.material.override({color: colors[i]}), this.triangleVertices[i], 999))
        }
    }

    flick(){
        if (this.status === 0) {
            this.status = 1;
            this.bounciness = 2;
        }
    }

    update_object(context, program_state) {
        this.dt = program_state.animation_delta_time / 1000;

        if (this.isLeft) { this.update_position_left();}
        else {this.update_position_right();}
        this.render(context, program_state);

        for (let i = 0; i < this.debug_points.length; i++) {
            //NOTE: DEBUG TOGGLE
            //this.debug_points[i].render(context, program_state);
        }
    }

    update_position_right()
    {
        if (this.status === 1) {
            this.rotation -= this.rotationRate * this.dt;
            if (this.rotation <= -this.rotationRange) {
                this.status = 2;
                this.rotation = -this.rotationRange;
                this.bounciness = 0.5;
            }
        } else if (this.status === 2) {
            this.rotation += this.rotationRate * this.dt;
            if (this.rotation >= this.rotationRange) {
                this.rotation = this.rotationRange;
                this.status = 0;
            }
        }

        this.triangleVertices[0] = vec4(this.position[0] - this.edgeLength * Math.cos(this.rotation), this.position[1] - this.edgeLength * Math.sin(this.rotation), 0, 1);
        this.debug_points[0].position = this.triangleVertices[0];
    }

    update_position_left() {
        if (this.status === 1) {
            this.rotation += this.rotationRate * this.dt;
            if (this.rotation >= this.rotationRange) {
                this.rotation = this.rotationRange;
                this.status = 2;
                this.bounciness = 0.5;
            }
        } else if (this.status === 2) {
            this.rotation -= this.rotationRate * this.dt;
            if (this.rotation <= -this.rotationRange) {
                this.rotation = -this.rotationRange;
                this.status = 0;
            }
        }

        this.triangleVertices[0] = vec4(this.position[0] + this.edgeLength * Math.cos(this.rotation), this.position[1] + this.edgeLength * Math.sin(this.rotation), 0, 1);
        this.debug_points[0].position = this.triangleVertices[0];
    }

    render(context, program_state) {
        this.shape.draw(context, program_state,
            Mat4.identity()
                .times(Mat4.translation(this.position[0],this.position[1],this.position[2]))
                .times(Mat4.rotation(this.rotation,0,0,1))
                .times(Mat4.scale(4.2, .5, 1))
                .times(Mat4.translation(this.offset,0,0))
            , this.material);
    }
}