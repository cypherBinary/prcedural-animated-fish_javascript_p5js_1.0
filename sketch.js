let canvas = document.getElementById('b');
let width = canvas.clientWidth;
let height = canvas.clientHeight;

let snake = [];
let boids = [];

function setup() {
	createCanvas(width, height);

	for (let i = 0; i < 5; i++) {
		const boid = new Boid(random() * width, random() * height, 12);
		boids.push(boid);
	}
	for (let i = 0; i < 5; i++) {
		let s = new ProceduralAnimationSnake(
			width / 2,
			height / 2,
			120,
			10,
			[19, 20, 20, 19, 18, 16, 14, 12, 10, 9],
			[0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
		);
		snake.push(s);
	}
}

function draw() {
	background(15, 15, 15);

	boids.forEach((boid) => {
		boid.wander(0, 0, width, height);
		boid.avoid_walls(0, 0, width, height, 200);
		boid.update();
	});

	for (let i = 0; i < snake.length; i++) {
		const s = snake[i];
		s.follow(boids[i].pos.x, boids[i].pos.y);
		s.show(true, [0, 120, 120], [255, 255, 255], (stroke_weight = 1));
	}
}
