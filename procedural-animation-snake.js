class CircleSegment {
	constructor(x, y, r, size, xdir = 1, ydir = 0) {
		this.pos = createVector(x, y);
		this.dir = createVector(xdir, ydir);
		this.r = r;
		this.size = size;
	}

	get_sides() {
		let left = this.pos.copy().add(
			this.dir
				.copy()
				.rotate(Math.PI / 2)
				.normalize()
				.mult(this.size)
		);
		let right = this.pos.copy().add(
			this.dir
				.copy()
				.rotate(-Math.PI / 2)
				.normalize()
				.mult(this.size)
		);

		return [
			[left.x, left.y],
			[right.x, right.y],
		];
	}

	get_head() {
		const numPoints = 6;
		let points = [];
		for (let i = 0; i < numPoints; i++) {
			const point = this.pos.copy().add(
				this.dir
					.copy()
					.rotate(lerp(Math.PI / 2, -Math.PI / 2, i / (numPoints - 1)))
					.normalize()
					.mult(this.size)
			);
			points.push([point.x, point.y]);
		}
		return points;
	}

	get_tail() {
		const numPoints = 6;
		let points = [];
		for (let i = 0; i < numPoints; i++) {
			const point = this.pos.copy().add(
				this.dir
					.copy()
					.rotate(lerp(-Math.PI / 2, (-3 * Math.PI) / 2, i / (numPoints - 1)))
					.normalize()
					.mult(this.size)
			);
			points.push([point.x, point.y]);
		}
		return points;
	}

	move_close(x, y) {
		if ((this.pos.x - x) ** 2 + (this.pos.y - y) ** 2 > this.r ** 2) {
			let dir_to_me = this.pos.copy().sub(createVector(x, y)).normalize();
			this.dir = dir_to_me.copy().mult(-1);
			this.pos = dir_to_me.mult(this.r).add(createVector(x, y));
		}
	}

	showDebug() {
		stroke(255);
		noFill();
		strokeWeight(1);
		circle(this.pos.x, this.pos.y, 5);
		circle(this.pos.x, this.pos.y, this.size * 2);
	}

	show() {
		noStroke();
		fill(255);
		circle(this.pos.x, this.pos.y, this.size * 2);
	}

	show_eyes(color = [255, 255, 255], diameter = 8) {
		const forward = 0.4 * this.size;
		const side = 0.4 * this.size;
		const eye1 = this.pos
			.copy()
			.add(this.dir.copy().normalize().mult(forward))
			.add(
				this.dir
					.copy()
					.rotate(Math.PI / 2)
					.normalize()
					.mult(side)
			);
		const eye2 = this.pos
			.copy()
			.add(this.dir.copy().normalize().mult(forward))
			.add(
				this.dir
					.copy()
					.rotate(-Math.PI / 2)
					.normalize()
					.mult(side)
			);

		noStroke();
		fill(...color);
		circle(eye1.x, eye1.y, diameter);
		circle(eye2.x, eye2.y, diameter);
	}

	show_side_fins(x = 0, y = 0, color = [0, 200, 200], filled = true) {
		let dir = createVector(x, y);
		if (x == 0 && y == 0) dir = this.dir.copy();
		const side = 1 * this.size;

		const fin1 = this.pos.copy().add(
			dir
				.copy()
				.rotate(Math.PI / 2)
				.normalize()
				.mult(side)
		);
		const fin2 = this.pos.copy().add(
			dir
				.copy()
				.rotate(-Math.PI / 2)
				.normalize()
				.mult(side)
		);

		stroke(255);
		strokeWeight(1);
		if (filled) {
			fill(...color);
		} else {
			noFill();
		}

		push();
		translate(fin1.x, fin1.y);
		rotate(dir.heading() - Math.PI / 4);
		ellipse(0, 0, 28, 15);
		pop();

		push();
		translate(fin2.x, fin2.y);
		rotate(dir.heading() + Math.PI / 4);
		ellipse(0, 0, 28, 15);
		pop();
	}
}

class ProceduralAnimationSnake {
	constructor(x, y, length, boneCount, boneSizes = [], boneFins = []) {
		this.pos = createVector(x, y);
		this.length = length;
		this.boneCount = boneCount;
		this.bone_fins = boneFins;
		this.load(boneSizes);
	}

	load(ls) {
		this.bones = [];
		if (ls.length == 0) {
			for (let i = 0; i < this.boneCount; i++) {
				let bone = new CircleSegment(
					this.pos.x,
					this.pos.y,
					this.length / this.boneCount,
					this.length / this.boneCount
				);
				this.bones.push(bone);
			}
		} else {
			for (let i = 0; i < this.boneCount; i++) {
				const r = ls[i];
				let bone = new CircleSegment(
					this.pos.x,
					this.pos.y,
					this.length / this.boneCount,
					r
				);
				this.bones.push(bone);
			}
		}
	}

	follow(x, y) {
		for (let i = 0; i < this.bones.length; i++) {
			const bone = this.bones[i];
			if (i == 0) {
				bone.move_close(x, y);
			} else {
				bone.move_close(this.bones[i - 1].pos.x, this.bones[i - 1].pos.y);
			}
		}
	}

	show(
		filling = false,
		fill_color = [0, 200, 200],
		stroke_color = [255, 255, 255],
		stroke_weight = 2,
		draw_eyes = true
	) {
		// vertexes
		let vertexes = [];
		for (let i = 0; i < this.bones.length; i++) {
			if (i != this.bones.length - 1) {
				const points = this.bones[i].get_sides();
				vertexes.push(points[1]);
			} else {
				const points = this.bones[i].get_tail();
				vertexes = vertexes.concat(points);
			}
		}

		for (let i = this.bones.length - 1; i >= 0; i--) {
			if (i != 0) {
				const points = this.bones[i].get_sides();
				vertexes.push(points[0]);
			} else {
				const points = this.bones[i].get_head();
				vertexes = vertexes.concat(points);
			}
		}

		// drawing fins
		if (this.bone_fins.length > 0) {
			for (let i = 0; i < this.bone_fins.length; i++) {
				const fin = this.bone_fins[i];

				if (fin == 1) {
					// this will cause an error if any of the first three bones have fins.
					this.bones[i].show_side_fins(this.bones[i - 3].dir.x, this.bones[i - 1].dir.y);
				}
			}
		}

		// drawing basic shape
		stroke(...stroke_color);
		strokeWeight(stroke_weight);

		if (filling) {
			fill(...fill_color);
		} else {
			noFill();
		}

		beginShape();

		for (let i = 0; i < vertexes.length; i++) {
			const vert = vertexes[i];
			vertex(...vert);
		}
		vertex(...vertexes[0]);

		endShape(CLOSE);

		// eyes
		if (draw_eyes) this.bones[0].show_eyes();
	}
}
