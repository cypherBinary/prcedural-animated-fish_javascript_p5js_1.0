class Segment {
	constructor(x, y, l, angle = 0, width = 1) {
		this.pos = createVector(x, y);
		this.length = l;
		this.width = width;
		this.angle = angle;
		this.calculateEnd();
	}

	calculateEnd() {
		this.end = this.pos.copy();
		this.end.add(
			createVector(Math.cos(this.angle) * this.length, Math.sin(this.angle) * this.length)
		);
	}

	moveTo(x, y) {
		let dir = createVector(x - this.pos.x, y - this.pos.y);
		this.angle = dir.heading();
		dir.normalize().mult(-this.length);
		this.pos = createVector(x + dir.x, y + dir.y);
		this.calculateEnd();
	}

	show(color = [255]) {
		stroke(...color);
		strokeWeight(this.width);
		noFill();
		line(this.pos.x, this.pos.y, this.end.x, this.end.y);
	}
}

class IKchain {
	constructor(x, y, length, bones, locked = false, tipThickness = 1, endThickness = 1) {
		this.pos = createVector(x, y);

		this.length = length;
		this.bones = bones;
		this.locked = locked;
		this.segments = [];
		this.load(tipThickness, endThickness);
	}

	load(tipW, tailW) {
		for (let i = 0; i < this.bones; i++) {
			let len = (1 / this.bones) * this.length;
			let w = lerp(tailW, tipW, i / (this.bones - 1));
			let seg = new Segment(this.pos.x, this.pos.y, len, 0, w);
			this.segments.unshift(seg);
		}
	}

	inverse(x, y) {
		for (let i = 0; i < this.segments.length; i++) {
			const seg = this.segments[i];
			if (i > 0) {
				let target = this.segments[i - 1];
				seg.moveTo(target.pos.x, target.pos.y);
			} else {
				seg.moveTo(x, y);
			}
		}
	}

	forward() {
		for (let i = this.segments.length - 1; i >= 0; i--) {
			const seg = this.segments[i];
			if (i != this.segments.length - 1) {
				seg.pos = this.segments[i + 1].end.copy();
				seg.calculateEnd();
			} else {
				seg.pos = this.pos.copy();
				seg.calculateEnd();
			}
		}
	}

	follow(x, y, loops = this.locked ? 30 : 0) {
		this.inverse(x, y);
		for (let i = 0; i < loops; i++) {
			this.forward();
			this.inverse(x, y);
		}
		if (loops > 0) {
			this.forward();
		}
	}

	show() {
		this.segments.forEach((segment) => {
			segment.show();
		});
	}
}
