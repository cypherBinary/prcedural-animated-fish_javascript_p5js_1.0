class QuadTree {
	constructor(x, y, w, h, copacity = 1) {
		this.boundry = new Rect(x, y, w, h);
		this.copacity = copacity;
		this.points = [];
		this.isDevided = false;
	}

	show() {
		stroke(100, 100, 100);
		strokeWeight(1);

		line(
			this.boundry.left + this.boundry.width / 2,
			this.boundry.top,
			this.boundry.left + this.boundry.width / 2,
			this.boundry.bottom
		);
		line(
			this.boundry.left,
			this.boundry.top + this.boundry.height / 2,
			this.boundry.right,
			this.boundry.top + this.boundry.height / 2
		);

		if (this.isDevided) {
			this.nw.show();
			this.ne.show();
			this.sw.show();
			this.se.show();
		}
	}

	insert(point) {
		if (!this.boundry.contains(point)) return false;

		if (this.points.length < this.copacity) {
			this.points.push(point);
			return true;
		}

		if (!this.isDevided) {
			this.subdevide();
			this.isDevided = true;
		}

		if (this.nw.insert(point)) return true;
		if (this.ne.insert(point)) return true;
		if (this.sw.insert(point)) return true;
		if (this.se.insert(point)) return true;
	}

	subdevide() {
		const x = this.boundry.left;
		const y = this.boundry.top;
		const w = this.boundry.width;
		const h = this.boundry.height;

		this.nw = new QuadTree(x, y, w / 2, h / 2, this.copacity);
		this.ne = new QuadTree(x + w / 2, y, w / 2, h / 2, this.copacity);
		this.sw = new QuadTree(x, y + h / 2, w / 2, h / 2, this.copacity);
		this.se = new QuadTree(x + w / 2, y + h / 2, w / 2, h / 2, this.copacity);
	}

	clear() {
		this.points = [];
		if (this.isDevided) {
			this.nw = 0;
			this.ne = 0;
			this.sw = 0;
			this.se = 0;
		}
		this.isDevided = false;
	}

	queryCirclePrivate(rec, x, y, r) {
		let ls = [];
		if (!this.boundry.intesects(rec)) return ls;
		this.points.forEach((point) => {
			if (rec.contains(point)) {
				if ((point.x - x) ** 2 + (point.y - y) ** 2 < r * r) {
					ls.push(point);
				}
			}
		});
		if (!this.isDevided) return ls;
		let nw = this.nw.queryCirclePrivate(rec, x, y, r);
		let ne = this.ne.queryCirclePrivate(rec, x, y, r);
		let sw = this.sw.queryCirclePrivate(rec, x, y, r);
		let se = this.se.queryCirclePrivate(rec, x, y, r);

		return [...ls, ...nw, ...ne, ...sw, ...se];
	}

	queryCircle(x, y, r) {
		let rec = new Rect(x - r, y - r, 2 * r, 2 * r);
		return this.queryCirclePrivate(rec, x, y, r);
	}

	queryRectPrivate(rec) {
		let ls = [];
		if (!this.boundry.intesects(rec)) return ls;
		this.points.forEach((point) => {
			if (rec.contains(point)) {
				ls.push(point);
			}
		});
		if (!this.isDevided) return ls;
		let nw = this.nw.queryRectPrivate(rec);
		let ne = this.ne.queryRectPrivate(rec);
		let sw = this.sw.queryRectPrivate(rec);
		let se = this.se.queryRectPrivate(rec);

		return [...ls, ...nw, ...ne, ...sw, ...se];
	}

	queryRect(x, y, w, h) {
		let rec = new Rect(x, y, w, h);
		return this.queryRectPrivate(rec);
	}
}

class Rect {
	constructor(x, y, w, h) {
		this.left = x;
		this.right = x + w;
		this.top = y;
		this.bottom = y + h;
		this.width = w;
		this.height = h;
	}

	contains(p) {
		let x = p.x <= this.right && p.x >= this.left && p.y <= this.bottom && p.y >= this.top;

		return x;
	}

	intesects(rec) {
		let x =
			rec.left > this.right ||
			rec.right < this.left ||
			rec.bottom < this.top ||
			rec.top > this.bottom;

		return !x;
	}

	show() {
		stroke(0, 255, 255);
		strokeWeight(3);
		noFill();
		rect(this.left, this.top, this.width, this.height);
	}
}

class MovingPoint {
	constructor(x, y, w, h, content) {
		this.x = x;
		this.y = y;
		this.xSpeed = random(-5, 5);
		this.ySpeed = random(-5, 5);
		this.w = w;
		this.h = h;
		this.content = content;
	}

	move() {
		this.x += this.xSpeed;
		this.y += this.ySpeed;
	}

	border() {
		if (this.x > this.w) {
			this.x = 0;
		} else if (this.x < 0) {
			this.x = this.w;
		}
		if (this.y > this.h) {
			this.y = 0;
		} else if (this.y < 0) {
			this.y = this.h;
		}
	}

	show() {
		stroke(255, 0, 0);
		strokeWeight(8);
		point(this.x, this.y);
	}

	showGreen() {
		stroke(0, 255, 0);
		strokeWeight(8);
		point(this.x, this.y);
	}

	update() {
		this.move();
		this.border();
	}
}
