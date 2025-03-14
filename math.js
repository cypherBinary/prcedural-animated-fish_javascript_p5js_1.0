class Vector {
	constructor(x, y, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.mag = this.magnitude();
		this.heading = this.angle();
	}

	static fromAngle(a) {
		return new Vector(cos(a), sin(a));
	}

	copy() {
		return new Vector(this.x, this.y, this.z);
	}

	angle() {
		return atan2(this.y, this.x);
	}

	magnitude() {
		return sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	mult(n) {
		this.x *= n;
		this.y *= n;
		this.z *= n;
		this.mag *= n;
		return this;
	}

	add(vector) {
		return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
	}

	sub(vector) {
		return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
	}

	normalize() {
		this.x /= this.mag;
		this.y /= this.mag;
		this.z /= this.mag;
		this.mag = 1;
		return this;
	}

	normalized() {
		let x = this.x / this.mag;
		let y = this.y / this.mag;
		let z = this.z / this.mag;
		return new Vector(x, y, z);
	}

	reversed() {
		return new Vector(-this.x, -this.y, -this.z);
	}

	scale(n) {
		this.normalize();
		this.mult(n);
		return this;
	}

	dist(vector) {
		return this.sub(vector).mag;
	}

	dot(vector) {
		return this.x * vector.x + this.y * vector.y + this.z * vector.z;
	}

	lerp(vector, t) {
		let x = Utils.lerp(this.x, vector.x, t);
		let y = Utils.lerp(this.y, vector.y, t);
		let z = Utils.lerp(this.z, vector.z, t);
		return new Vector(x, y, z);
	}

	angleTo(vector) {
		let a = this.copy().normalized();
		let b = vector.normalized();
		return a.heading - b.heading;
	}

	reflect(n) {
		return this.sub(n.mult(2 * this.dot(n.normalized())));
	}
}

class Utils {
	constructor() {}

	static lerp(a, b, t) {
		return (1 - t) * a + t * b;
	}

	static ilerp(a, b, v) {
		return (v - a) / (b - a);
	}

	static remap(v, a, b, a2, b2) {
		return this.lerp(a2, b2, this.ilerp(a, b, v));
	}
}

class Matrix {
	constructor(rs, cs) {
		this.rows = rs;
		this.cols = cs;
		this.data = [];
		this.Setup();
		return this;
	}

	static Sub(a, b) {
		if (a.rows != b.rows || a.cols != b.cols) {
			console.error('invalid elementwise matrix Multiplecation');
		}
		let m = new Matrix(a.rows, a.cols);
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				m.data[i][j] = a.data[i][j] - b.data[i][j];
			}
		}
		return m;
	}

	static Map(m, func) {
		let res = new Matrix(m.rows, m.cols);
		for (let i = 0; i < m.rows; i++) {
			for (let j = 0; j < m.cols; j++) {
				res.data[i][j] = func(m.data[i][j]);
			}
		}
		return res;
	}

	static FromArray(arr) {
		let m = new Matrix(arr.length, 1);
		for (let i = 0; i < arr.length; i++) {
			m.data[i][0] = arr[i];
		}

		return m;
	}

	Copy() {
		let x = new Matrix(this.rows, this.cols);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				x.data[i][j] = this.data[i][j];
			}
		}
		return x;
	}

	ToArray() {
		let arr = [];
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				arr.push(this.data[i][j]);
			}
		}
		return arr;
	}

	Transposed() {
		let resault = new Matrix(this.cols, this.rows);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				resault.data[j][i] = this.data[i][j];
			}
		}
		return resault;
	}

	Setup() {
		for (let i = 0; i < this.rows; i++) {
			let row = [];
			for (let j = 0; j < this.cols; j++) {
				row.push(0);
			}
			this.data.push(row);
		}
	}

	Randomized() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] = Math.random() * 2 - 1;
			}
		}
		return this;
	}

	Add(n) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] += n;
			}
		}
		return this;
	}

	MatAdd(n) {
		if (n.rows != this.rows || n.cols != this.cols) {
			console.error('invalid addition');
		}
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] += n.data[i][j];
			}
		}
		return this;
	}

	MatSub(n) {
		if (n.rows != this.rows || n.cols != this.cols) {
			console.error('invalid addition');
		}
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] -= n.data[i][j];
			}
		}
		return this;
	}

	Mult(n) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] *= n;
			}
		}
		return this;
	}

	MatMul(n) {
		if (this.cols != n.rows) {
			console.error('invalid Matrix Multiplecation');
		} else {
			let resault = new Matrix(this.rows, n.cols);
			let a = this.data;
			let b = n.data;
			for (let i = 0; i < resault.rows; i++) {
				for (let j = 0; j < resault.cols; j++) {
					let sum = 0;
					for (let k = 0; k < this.cols; k++) {
						sum += a[i][k] * b[k][j];
					}
					resault.data[i][j] = sum;
				}
			}
			return resault;
		}
	}

	MatMulElementwise(n) {
		if (this.rows != n.rows || this.cols != n.cols) {
			console.error('invalid elementwise matrix Multiplecation');
		} else {
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					this.data[i][j] *= n.data[i][j];
				}
			}
			return this;
		}
	}

	Map(func) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.data[i][j] = func(this.data[i][j]);
			}
		}
		return this;
	}

	CrossCorrelate(n) {
		let rows = this.rows - n.rows + 1;
		let cols = this.cols - n.cols + 1;
		let res = new Matrix(rows, cols);
		let value = 0;

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				for (let i2 = 0; i2 < n.rows; i2++) {
					for (let j2 = 0; j2 < n.cols; j2++) {
						value += this.data[i + i2][j + j2] * n.data[i2][j2];
					}
				}

				res.data[i][j] = value;
				value = 0;
			}
		}

		return res;
	}

	FullCrossCorrelate(n) {
		let rows = this.rows + n.rows - 1;
		let cols = this.cols + n.cols - 1;
		let res = new Matrix(rows, cols);
		let value = 0;

		console.log(rows);
		console.log(cols);
		for (let i = -(n.rows - 1); i < rows; i++) {
			for (let j = -(n.cols - 1); j < cols; j++) {
				for (let i2 = 0; i2 < n.rows; i2++) {
					for (let j2 = 0; j2 < n.cols; j2++) {
						if (this.IndexValid(i + i2, j + j2)) {
							value += n.data[i2][j2] * this.data[i + i2][j + j2];
						}
					}
				}
				let row = i + (n.rows - 1);
				let col = j + (n.cols - 1);
				if (res.IndexValid(row, col)) {
					res.data[row][col] = value;
				}
				value = 0;
			}
		}

		return res;
	}

	Rot180() {
		let res = new Matrix(this.rows, this.cols);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let i2 = this.rows - 1 - i;
				let j2 = this.cols - 1 - j;
				res.data[i2][j2] = this.data[i][j];
			}
		}
		return res;
	}

	IndexValid(i, j) {
		return i < this.rows && i >= 0 && j < this.cols && j >= 0;
	}

	Show() {
		console.table(this.data);
	}
}

class NeuralNetwork {
	constructor(arr) {
		this.nodes = arr;
		this.inputs = arr[0];
		this.weights = [];
		this.biases = [];
		// we set up the weights and biases from the first hidden layer on.
		this.SetupWeights();
		this.SetupBiases();

		this.learningRate = 0.01;
	}

	SetLearningRate(lr) {
		this.learningRate = lr;
	}

	SetupWeights() {
		for (let i = 1; i < this.nodes.length; i++) {
			let m = new Matrix(this.nodes[i], this.nodes[i - 1]).Randomized();
			this.weights.push(m);
		}
	}

	SetupBiases() {
		for (let i = 1; i < this.nodes.length; i++) {
			let m = new Matrix(this.nodes[i], 1).Randomized();
			this.biases.push(m);
		}
	}

	Guess(input) {
		let data = Matrix.FromArray(input);
		for (let i = 0; i < this.weights.length; i++) {
			data = this.weights[i].MatMul(data).MatAdd(this.biases[i]).Map(Sigmoid);
		}

		return data.ToArray();
	}

	Train(input, t) {
		let target = Matrix.FromArray(t);
		let data = Matrix.FromArray(input);
		let outputs = [data];
		for (let i = 0; i < this.weights.length; i++) {
			data = this.weights[i].MatMul(data).MatAdd(this.biases[i]).Map(Sigmoid);
			outputs.push(data);
		}

		let errors = Matrix.Sub(data, target);

		for (let i = outputs.length - 1; i > 0; i--) {
			let gradients = Matrix.Map(outputs[i], dSigmoid);
			let weightDeltas = gradients
				.MatMulElementwise(errors)
				.MatMul(outputs[i - 1].Transposed())
				.Mult(this.learningRate);
			errors = this.weights[i - 1].Transposed().MatMul(errors);
			this.weights[i - 1].MatSub(weightDeltas);
		}
	}
}

function Sigmoid(n) {
	return 1 / (1 + Math.exp(-n));
}

function dSigmoid(n) {
	return n * (1 - n);
}

function SigmoidDirivitive(n) {
	return Sigmoid(n) * (1 - Sigmoid(n));
}
