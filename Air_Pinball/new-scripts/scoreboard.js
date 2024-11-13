import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Textured_Phong} = defs

const scale_factor = 2;

export class Scoreboard {
    constructor(position) {
        this.position = position;
        this.score = 0;
        this.displayScore = 0;
        this.timer = 0;

        this.shapes = {
            cube: new defs.Cube(),
        }

        this.panel1 = this.shapes.cube;
        this.panel2 = this.shapes.cube;
        this.panel3 = this.shapes.cube;
        this.panel4 = this.shapes.cube;
        this.top_wall = this.shapes.cube;
        this.bot_wall = this.shapes.cube;
        this.left_wall = this.shapes.cube;
        this.right_wall = this.shapes.cube;

        this.materials = {
            zero: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/zero.png")
            }),
            one: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/one.png")
            }),
            two: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/two.png")
            }),
            three: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/three.png")
            }),
            four: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/four.png")
            }),
            five: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/five.png")
            }),
            six: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/six.png")
            }),
            seven: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/seven.png")
            }),
            eight: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/eight.png")
            }),
            nine: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/numbers/nine.png")
            }),
            wall: new Material(new Textured_Phong(), {
                ambient: 1,
                color: hex_color("#000000"),
                texture: new Texture("assets/metal.jpg")
            }),
        }

        this.numbers = [
            this.materials.zero,
            this.materials.one,
            this.materials.two,
            this.materials.three,
            this.materials.four,
            this.materials.five,
            this.materials.six,
            this.materials.seven,
            this.materials.eight,
            this.materials.nine,

        ]

        let model_transform = Mat4.identity().times(Mat4.translation(this.position[0], this.position[1], this.position[2]));
        this.panel1_transform = model_transform.times(Mat4.scale(scale_factor, 0.1, scale_factor));
        this.panel2_transform = model_transform.times(Mat4.translation(scale_factor * 2, 0, 0)).times(Mat4.scale(scale_factor, 0.1, scale_factor));
        this.panel3_transform = model_transform.times(Mat4.translation(scale_factor * 4, 0, 0)).times(Mat4.scale(scale_factor, 0.1, scale_factor));
        this.panel4_transform = model_transform.times(Mat4.translation(scale_factor * 6, 0, 0)).times(Mat4.scale(scale_factor, 0.1, scale_factor));

        this.top_wall_transform = model_transform.times(Mat4.translation(scale_factor * 3, 0, scale_factor + scale_factor/2)).times(Mat4.scale(scale_factor * 5, 1, scale_factor/2));
        this.bot_wall_transform = model_transform.times(Mat4.translation(scale_factor * 3, 0, -scale_factor - scale_factor/2)).times(Mat4.scale(scale_factor * 5, 1, scale_factor/2));
        this.left_wall_transform = model_transform.times(Mat4.translation(-scale_factor - scale_factor/2, 0, 0)).times(Mat4.scale(scale_factor/2, 1, scale_factor));
        this.right_wall_transform = model_transform.times(Mat4.translation(scale_factor * 7 + scale_factor/2, 0, 0)).times(Mat4.scale(scale_factor/2, 1, scale_factor));
    }
    
    addToScore(score) {
        this.score += score;
    }
    resetScore() {
        this.score = 0;
        this.displayScore = 0;
    }

    render(context, program_state) {

        if (this.displayScore < this.score) {
            if (this.timer > 0)
            {
                this.timer -= program_state.animation_delta_time / 1000;
            } else{
                if (this.score - this.displayScore > 100) {
                    this.timer = .001;
                } else{
                    this.timer = .005;
                }
                this.displayScore += 1;
            }
        }

        let digit1 = Math.floor(this.displayScore / 1000);
        let digit2 = Math.floor((this.displayScore % 1000) / 100);
        let digit3 = Math.floor((this.displayScore % 100) / 10);
        let digit4 = Math.floor(this.displayScore % 10);
        this.panel1.draw(context, program_state, this.panel1_transform, this.numbers[digit1]);
        this.panel2.draw(context, program_state, this.panel2_transform, this.numbers[digit2]);
        this.panel3.draw(context, program_state, this.panel3_transform, this.numbers[digit3]);
        this.panel4.draw(context, program_state, this.panel4_transform, this.numbers[digit4]);

        this.top_wall.draw(context, program_state, this.top_wall_transform, this.materials.wall);
        this.bot_wall.draw(context, program_state, this.bot_wall_transform, this.materials.wall);
        this.left_wall.draw(context, program_state, this.left_wall_transform, this.materials.wall);
        this.right_wall.draw(context, program_state, this.right_wall_transform, this.materials.wall);
    }
}