import {defs, tiny} from '../examples/common.js';
import {PhysicsCalculations} from "./physics-calculations.js";
import {Debug_Point} from "./visual_debugger.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Ball {
    constructor(shape, material, position, velocity, scene) {
        this.shape = shape;
        this.material = material;
        this.debug_material = this.material.override({color: hex_color('#00ff0d')});
        this.position = position;
        this.velocity = velocity;
        this.gravity = -40; //-300
        this.bounciness = .97;
        this.scene = scene;

        this.travel_segment_start = vec3(0, 10, 0);
        this.travel_segment_end = vec3(0, 10, 0);

        this.dt = 0;

        this.debug_points = [];
        this.PhysicsCalculations = new PhysicsCalculations();

        this.closestObstacle = null;
        this.closestColPoint = null;
        this.closestObstacleIndex = null;

        this.flipperCooldown = 0;
    }

    reset_object(context, program_state) {
        this.velocity = vec3(0, 0, 0)
        this.position = vec3(-29, -10, 0);
        this.dt = 0;
        this.debug_points = [];
    }

    update_object(context, program_state) {
        this.dt = program_state.animation_delta_time / 1000;
        this.velocity[1] = this.velocity[1] + this.gravity * this.dt;

        this.update_position();

        this.render(context, program_state);
        for (let i = 0; i < this.debug_points.length; i++) {
            this.debug_points[i].render(context, program_state);
        }

        if (this.flipperCooldown > 0) {
            this.flipperCooldown -= this.dt;
        }
    }

    update_position() {
        this.travel_segment_start = this.position;
        this.position = this.PhysicsCalculations.addVectors(this.position, this.PhysicsCalculations.multiplyVectorByScalar(this.velocity, this.dt));
        this.travel_segment_end = this.position;
        for (let i = 0; i < this.scene.obstacles.length; i++) {
            this.handle_obstacle_collision(this.scene.obstacles[i]);
        }

        if (this.closestObstacle !== null) {

            let second_vertex_index = this.closestObstacleIndex + 1;
            if (second_vertex_index === this.closestObstacle.vertices.length) {
                second_vertex_index = 0;
            }

            //this.collide(this.PhysicsCalculations.normal_of_line_segment(obstacle.vertices[i], obstacle.vertices[second_vertex_index]),obstacle.bounciness, collision_point);
            this.collide(this.PhysicsCalculations.normal_of_line_segment(this.closestObstacle.vertices[this.closestObstacleIndex], this.closestObstacle.vertices[second_vertex_index]), this.closestObstacle.bounciness, this.closestColPoint);
            this.scene.scoreboard.addToScore(this.closestObstacle.points);

            this.closestObstacle = null;
            this.closestColPoint = null;
            this.closestObstacleIndex = null;
        }

        for (let i = 0; i < this.scene.flippers.length; i++) {
            this.handle_flipper_collision(this.scene.flippers[i]);
        }
        //this.handle_boundary_collision(8, 6);
    }

    collide(normal, bounciness, collision_point) {

        //used for continuous collision detection (call recursively until no collision)
        // let travel_proportion =
        //     this.PhysicsCalculations.magnitude(vec3(this.travel_segment_start[0] - collision_point[0], this.travel_segment_start[1] - collision_point[1], 0))
        //     / this.PhysicsCalculations.magnitude(vec3(this.travel_segment_start[0] - this.travel_segment_end[0], this.travel_segment_start[1] - this.travel_segment_end[1], 0));
        //
        // this.dt = this.dt * (1 - travel_proportion);

        //this.debug_points.push(new Debug_Point(this.material.override({color: hex_color('#ff0000')}), this.travel_segment_start));
        //this.debug_points.push(new Debug_Point(this.material.override({color: hex_color('#ffb700')}), this.travel_segment_end));

        this.update_bounce_velocity(normal, bounciness);

        this.position = this.PhysicsCalculations.addVectors(collision_point, this.PhysicsCalculations.multiplyVectorByScalar(this.velocity, .00001));
    }

    update_bounce_velocity(normal, bounciness) {

        let tangent = vec3(normal[1], -normal[0], 0)

        let normal_component_magnitude = this.PhysicsCalculations.dot_product(this.velocity, normal)
            / this.PhysicsCalculations.sqr_magnitude(normal);

        let normal_component = vec3(normal_component_magnitude * normal[0], normal_component_magnitude * normal[1], 0);

        //supposed to allow for sliding
        /*if (this.PhysicsCalculations.sqr_magnitude(normal_component) < this.dt * 2000){
            normal_component[0] = 0;
            normal_component[1] = 0;
        }*/

        let tangent_component_magnitude = this.PhysicsCalculations.dot_product(this.velocity, tangent)
            / this.PhysicsCalculations.sqr_magnitude(tangent);

        let tangent_component = vec3(tangent_component_magnitude * tangent[0], tangent_component_magnitude * tangent[1], 0);

        this.velocity = vec3(normal_component[0] * -bounciness * this.bounciness + tangent_component[0],
            normal_component[1] * -bounciness * this.bounciness + tangent_component[1], 0);
        //this.velocity = vec3((-normal_component[0] + tangent_component[0]) * bounciness * this.bounciness,
        //    (-normal_component[1] + tangent_component[1]) * bounciness * this.bounciness, 0);

        //this.update_position();
    }

    handle_flipper_collision(flipper) {
        if (this.flipperCooldown <= 0 && this.PhysicsCalculations.isPointInTriangle(this.position, flipper.triangleVertices[0], flipper.triangleVertices[1], flipper.triangleVertices[2]))
        {
            //console.log("flipper collision");

            this.velocity = this.PhysicsCalculations.normal_of_line_segment(flipper.triangleVertices[0], flipper.triangleVertices[2]);
            if (flipper.isLeft) {this.velocity = this.PhysicsCalculations.multiplyVectorByScalar(this.velocity, 5);}
            else {this.velocity = this.PhysicsCalculations.multiplyVectorByScalar(this.velocity, -5);}

            let tangentVector = this.PhysicsCalculations.projection(this.velocity, this.PhysicsCalculations.subtractVectors(flipper.triangleVertices[0], flipper.triangleVertices[1]));
            this.velocity[0] += tangentVector[0];
            this.velocity[1] += tangentVector[1];

            this.scene.scoreboard.addToScore(25);
            this.flipperCooldown = .2;
        }
    }

    handle_obstacle_collision(obstacle) {
        let collision_point = null;
        let second_vertex_index = 0;

        for (let i = 0; i < obstacle.vertices.length; i++)
        {
            second_vertex_index = i + 1;
            if (second_vertex_index === obstacle.vertices.length) {
                second_vertex_index = 0;
            }

            collision_point = this.PhysicsCalculations.findIntersectionPoint1(this.travel_segment_start, this.travel_segment_end, obstacle.vertices[i], obstacle.vertices[second_vertex_index]);

            if (collision_point !== null) {
                //this.collide(this.PhysicsCalculations.normal_of_line_segment(obstacle.vertices[i], obstacle.vertices[second_vertex_index]),obstacle.bounciness, collision_point);
                // this.add_debug_points(obstacle.vertices[i]);
                // this.add_debug_points(obstacle.vertices[second_vertex_index]);
                //this.scene.scoreboard.incrementScore(obstacle.points);
                if (this.closestObstacle == null ||
                    this.PhysicsCalculations.sqr_magnitude(
                    this.PhysicsCalculations.subtractVectors(this.travel_segment_start, collision_point))
                    < this.PhysicsCalculations.sqr_magnitude(
                        this.PhysicsCalculations.subtractVectors(this.travel_segment_start, this.closestColPoint)
                    ))
                {
                    this.closestObstacle = obstacle;
                    this.closestColPoint = collision_point;
                    this.closestObstacleIndex = i;
                }

                //return true;
            }
        }
        //return false;
    }

    handle_boundary_collision(width, height) {

        //wall_points are denoted in pairs of points that make up a line segment
        const wall_points = [
            vec3(-999, 999 * .7, 0), vec3(0, -height, 0),
            vec3(0, -height, 0), vec3(999, 999 * .7, 0),

            vec3(-999, height, 0), vec3(999, height, 0),
            vec3(-width, -999, 0), vec3(-width, 999, 0),
            vec3(width, -999, 0), vec3(width, 999, 0)
        ];

        let collision_point = null;

        for (let i = 0; i < wall_points.length; i += 2)
        {
            collision_point = this.PhysicsCalculations.findIntersectionPoint(this.travel_segment_start, this.travel_segment_end, wall_points[i], wall_points[i + 1]);
            this.add_debug_points(wall_points[i]);
            this.add_debug_points(wall_points[i + 1]);

            if (collision_point !== null){
                this.collide(this.PhysicsCalculations.normal_of_line_segment(wall_points[i], wall_points[i + 1]),1.02, collision_point);
            }
        }
    }

    add_debug_points(position) {
        if (this.debug_points.length < 10) {
            //this.debug_points.push(new Debug_Point(this.debug_material, position, 1, this.debug_points));
        }
    }

    //this.shapes.torus.draw(context, program_state, model_transform, this.materials.test.override({color: yellow}));
    render(context, program_state) {
        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1],this.position[2])), this.material);
    }
}