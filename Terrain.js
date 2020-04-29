class SimplexTerrain {
	constructor(size, segments, magnitudeY) {
		this.size = size
		this.segments = segments
		this.magnitudeY = magnitudeY
		this.geom = new THREE.BufferGeometry()
		this.makeAttribs()
		this.scalefactor = this.size/this.segments
	}

	makeAttribs() {
		this.indices = []
		this.vertices = []
		this.normals = []
		this.colors = []
	}

	generateTerrain() {
		var halfSize = this.size / 2;
		var segmentSize = this.size / this.segments;
		for (var i = 0; i <= this.segments; i++) {
			var y = (i * segmentSize)
			for (var j = 0; j <= this.segments; j++) {
				var x = (j * segmentSize)
				var zVal = 0
				this.vertices.push(x, zVal, y);
				this.normals.push(0, 1, 0);
				this.colors.push(0, 0, 0);
			}
		}

		for (var i = 0; i < this.segments; i++) {
			for (var j = 0; j < this.segments; j++) {
				var a = i * (this.segments + 1) + (j + 1);
				var b = i * (this.segments + 1) + j;
				var c = (i + 1) * (this.segments + 1) + j;
				var d = (i + 1) * (this.segments + 1) + (j + 1);
				// generate two faces (triangles) per iteration
				this.indices.push(a, b, d); // face one
				this.indices.push(b, c, d); // face two
			}
		}

		this.geom.setIndex(this.indices);
		this.geom.addAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
		this.geom.addAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
		this.geom.addAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
		this.geom.computeVertexNormals()
	}

	createMesh(shaderMat) {
		this.mesh = new THREE.Mesh(this.geom, shaderMat)
		return this.mesh
	}

	getHeight(x, y) {
		return this.geom.getAttribute('position').getY((y * (this.segments + 1)) + x)
	}

	setHeight(x, y, value) {
		this.geom.getAttribute('position').setY((y * (this.segments + 1)) + x, value)
	}

	addLayer(wavelength, amplitude) {
		let simplex = new SimplexNoise(Math.random())
		for (var x = 0; x <= this.segments; x++) {
			for (var y = 0; y <= this.segments; y++) {
				let modheight = (simplex.noise2D(x / wavelength, y / wavelength) + 1) * amplitude * 0.5
				let preheight = this.getHeight(x, y)
				this.setHeight(x, y, preheight + modheight)
			}
		}
	}

	scaleTerrain() {
		for (var x = 0; x <= this.segments; x++) {
			for (var y = 0; y <= this.segments; y++) {
				this.setHeight(x, y, this.getHeight(x, y) * this.magnitudeY)
			}
		}
		this.geom.computeVertexNormals()
	}

	update() {
		this.geom.attributes.position.needsUpdate = true;
		this.geom.computeVertexNormals()
	}

	bilerp_height(x, y) {
		let lx = Math.floor(x)
		let ly = Math.floor(y)
		let hx = lx + 1
		let hy = ly + 1
		
		let cx = x - lx
		let cy = y - ly

		return (this.getHeight(lx, ly) * (1 - cx) * (1 - cy)) + 
		(this.getHeight(hx, ly) * cx * (1 - cy)) +
		(this.getHeight(lx, hy) * (1 - cx) * cy) +
		(this.getHeight(hx, hy) * cx * cy)
	}

	bilerp_gradient(x, y) {
		let lx = Math.floor(x)
		let ly = Math.floor(y)
		let hx = lx + 1
		let hy = ly + 1
		
		let cx = x - lx
		let cy = y - ly

		let cbl = this.getHeight(lx, ly)
		let cbr = this.getHeight(hx, ly)
		let ctl = this.getHeight(lx, hy)
		let ctr = this.getHeight(hx, hy)

		let dydx1 = cbl - cbr
		let dydx2 = ctl - ctr
		let dydz1 = cbl - ctl
		let dydz2 = cbr - ctr
		return {'x': (cx * dydx1) + ((1 - cx) * dydx2), 'y': (cy * dydz1) + ((1 - cy) * dydz2)}
	}

	bilerp_setHeight(x, y, delta) {
		let lx = Math.floor(x)
		let ly = Math.floor(y)
		let hx = lx + 1
		let hy = ly + 1
		let dx = x - lx
		let dy = y - ly

		this.setHeight(lx, ly, this.getHeight(lx, ly) + (delta * dx * dy))
		this.setHeight(hx, ly, this.getHeight(hx, ly) + (delta * (1 - dx) * dy))
		this.setHeight(lx, hy, this.getHeight(lx, hy) + (delta * dx * (1 - dy)))
		this.setHeight(hx, hy, this.getHeight(hx, hy) + (delta * (1 - dx) * (1 - dy)))
	} 
}
