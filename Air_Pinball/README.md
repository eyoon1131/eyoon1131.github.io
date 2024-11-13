# Tiny Pinball
CS 174A Spring 2023  
Aneesh Bonthala, Izzy Qian, Kaiway Tang, Eliot Yoon

Our project is a recreation of the classic game of pinball using TinyGraphics and WebGL. The game has a space exploration theme, with the obstacles as planets and other celestial bodies while the ball and flippers are fiery meteors that travel through space. The objects used in this project were all implemented using TinyGraphics while the physics and collision mechanics (our two advanced features) were created by us. 

Using our collision detection system, the ball is able to detect when it is touching an obstacle, wall, or flipper and is able to properly bounce off with the correct angle of deflection using our physics system, which is also responsible for the ball constantly accelerating downward due to gravity. When a collision with an obstacle is detected, points are added to the score based on the obstacle type, and these points are reflected in the scoreboard. We also implemented a debugging system that can display velocity vectors, collision points, and more useful debugging information.

## How to Play
1) Clone the repository and run the file index.html.
2) Begin the game by pressing enter.
3) Propel the ball upward by using the left and right flippers, which are controlled using the x and m keys respectively.
4) Try to hit the obstacles to win points, with different obstacles having different point values and bounciness depending on difficulty to hit, while also trying to prevent the ball from falling out of the board.
5) Press q to exit the game and reset the ball.
