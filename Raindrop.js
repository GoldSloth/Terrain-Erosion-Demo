class Raindrop {
    constructor(position, pickupRate, depositRate, capacity, terrain, minVelocity, gravity) {
        this.position = position.clone()
        this.velocity = new THREE.Vector2(0, 0)
        this.capacity = capacity
        this.currentlyHolding = 0
        this.pickupRate = pickupRate
        this.depositRate = depositRate
        this.terrain = terrain
        this.isDead = false
        this.minVelocity = minVelocity
        this.gravity = gravity

        this.lineGeom = new THREE.Geometry()
        this.lineMaterial = new THREE.LineBasicMaterial({color: 0xffefff})
        this.line = new THREE.Line(this.lineGeom, this.lineMaterial)
        scene.add(this.line)
    }
    
    move() {
        let gradient = this.terrain.bilerp_gradient(this.position.x, this.position.y)

        this.velocity.add(gradient.multiplyScalar(-this.gravity))
        this.position.add(this.velocity)
        console.log("New Move")
        console.log(this.position)
        console.log(this.velocity)

        let x = this.position.x
        let y = this.position.y

        if (this.position.x <= 0 || this.position.x >= this.terrain.segments || this.position.y <= 0 || this.position.y >= this.terrain.segments) {
            this.isDead = true
            console.log("Out of bounds")
        }
        let currentHeight = this.terrain.bilerp_height(x, y)

        let uphill = this.terrain.bilerp_gradient(this.position.x, this.position.y).dot(this.velocity) < 0

        if (this.currentlyHolding <= this.capacity) {
            // Subtract
            let toSubtract = Math.min(Math.abs(currentHeight - this.terrain.getSurroundingMinHeight(x, y)), this.pickupRate)

            this.currentlyHolding += toSubtract
            this.terrain.bilerp_changeHeight(x, y, -toSubtract)
        } else {
            if (!uphill) {
                let toAdd = Math.min(Math.abs(this.terrain.getSurroundingMaxHeight(x, y) - currentHeight), this.depositRate, this.currentlyHolding)
                this.currentlyHolding -= toSubtract
                this.terrain.bilerp_changeHeight(x, y, toAdd)
            }
        }

        // Death
        if (this.velocity.length() < this.minVelocity) {
            this.isDead = true
            console.log("Too slow")
        }
    }

    plotPath() {
        let pos = new THREE.Vector3()
        pos.x = this.position.x * this.terrain.scalefactor
        pos.y = this.terrain.bilerp_height(this.position.x, this.position.y) + 0.05
        pos.z = this.position.y * this.terrain.scalefactor
        this.lineGeom.vertices.push(pos)
    }
}
