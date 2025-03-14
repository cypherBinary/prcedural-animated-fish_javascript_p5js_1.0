class Boid {
	constructor(x, y, size) {
		this.pos = createVector(x, y);
		this.vel = createVector(random() * 2 - 1, random() * 2 - 1);
		this.acc = createVector(0, 0);
		this.maxSpeed = 4;
		this.maxForce = 0.4;

		// wander
		this.wanderCircleDistance = 150;
		this.wanderCircleRadius = 70;
		this.wanderAngle = 90;
		this.wanderIntensity = 0.3;

		this.size = size;
	}

	update() {
		this.acc.limit(this.maxForce);
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);

		this.acc = createVector(0, 0);
	}

	wrap(width, height) {
		if (this.pos.x > width) {
			this.pos.x -= width;
		} else if (this.pos.x < 0) {
			this.pos.x += width;
		}

		if (this.pos.y > height) {
			this.pos.y -= height;
		} else if (this.pos.y < 0) {
			this.pos.y += height;
		}
	}

	addForce(f) {
		this.acc.add(f);
	}

	seek(x, y) {
		let dir = createVector(x, y);
		dir.sub(this.pos).sub(this.vel).normalize().mult(this.maxForce);
		this.addForce(dir);
	}

	show() {
		stroke(0);
		fill(255);
		strokeWeight(2);
		let dir = this.vel.copy().normalize().mult(this.size);
		let forward = this.pos.copy().add(dir.copy().mult(3));
		dir.rotate(90);
		let left = this.pos.copy().add(dir);
		dir.rotate(-180);
		let right = this.pos.copy().add(dir);
		triangle(forward.x, forward.y, left.x, left.y, right.x, right.y);
	}

	getCloseBoids(boids, d) {
		let closeBoids = [];
		boids.forEach((boid) => {
			if (this != boid) {
				if ((this.pos.x - boid.pos.x) ** 2 + (this.pos.y - boid.pos.y) ** 2 < d * d) {
					closeBoids.push(boid);
				}
			}
		});
		return closeBoids;
	}

	seperation(others, d) {
		let force = createVector(0, 0);
		others.forEach((boid) => {
			let dir = this.pos.copy().sub(boid.pos);
			let distance = dir.mag();
			let forceStrength = Utils.remap(distance, d, 0, 0, this.maxForce);
			dir.normalize().mult(forceStrength);
			force.add(dir);
		});
		force.limit(this.maxForce);
		this.addForce(force);
	}

	alignment(others) {
		let force = createVector(0, 0);
		others.forEach((boid) => {
			let dir = boid.vel.copy().normalize().mult(this.maxForce);
			force.add(dir);
		});
		force.limit(this.maxForce);
		this.addForce(force);
	}

	cohesion(others) {
		let pos = createVector(0, 0);
		others.forEach((boid) => {
			pos.add(boid.pos.copy());
		});
		pos.div(others.length);
		this.seek(pos.x, pos.y);
	}

	flock(boids, d) {
		let others = this.getCloseBoids(boids, d);
		// print(others.length);
		this.seperation(others, d);
		this.alignment(others);
		this.cohesion(others);
	}

	avoid_walls(x0, y0, width, height, buffer = 50) {
		if (
			this.pos.x < x0 + buffer ||
			this.pos.x > width - buffer ||
			this.pos.y < y0 + buffer ||
			this.pos.y > height - buffer
		) {
			this.seek(x0 + width / 2, y0 + height / 2);
		}
	}

	wander(x0, y0, width, height, buffer = 50) {
		let pos = this.pos.copy().add(this.vel.copy().normalize().mult(this.wanderCircleDistance));

		// stroke(255);
		// strokeWeight(2);
		// noFill();
		// circle(pos.x, pos.y, this.wanderCircleRadius * 2);

		let dir = createVector(
			cos(this.wanderAngle + this.vel.heading()) * this.wanderCircleRadius,
			sin(this.wanderAngle + this.vel.heading()) * this.wanderCircleRadius
		);
		pos.add(dir);

		this.wanderAngle += (random() * 2 - 1) * this.wanderIntensity;

		// stroke(0, 255, 0);
		// strokeWeight(15);
		// point(pos.x, pos.y);
		// stroke(150);
		// strokeWeight(1);
		// noFill();
		// circle(pos.x, pos.y, 50);
		// line(this.pos.x, this.pos.y, pos.x, pos.y);

		this.seek(pos.x, pos.y);
	}
}
