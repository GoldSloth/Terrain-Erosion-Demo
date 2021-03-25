class Raindrop {
    constructor(position, terrain) {
        this.position = position.clone()
        this.velocity = new THREE.Vector2(0, 0)
        this.terrain = terrain
        this.capacity = 5
        this.currentlyHolding = 0.5
        this.pickupRate = 0.001
        this.depositRate = 1
        
        this.isDead = false
        this.gravity = 5

        this.maxLife = 100;

        this.positionHistory = []
    }
    
    move() {
        let gradient = this.terrain.bilerp_gradient(this.position.x, this.position.y)

        this.velocity.add(gradient.multiplyScalar(this.gravity))
        if (this.velocity.lengthSq() > 1) {
            this.velocity = this.velocity.normalize()
        }
        this.position.add(this.velocity)

        let x = this.position.x
        let y = this.position.y

        if (this.position.x <= 1 || this.position.x >= this.terrain.segments-1 || this.position.y <= 1 || this.position.y >= this.terrain.segments-1) {
            this.isDead = true
        }

        let currentHeight = this.terrain.bilerp_height(x, y)

        let uphill = this.terrain.bilerp_gradient(this.position.x, this.position.y).dot(this.velocity) < 0

        if (this.currentlyHolding <= this.capacity && this.velocity.lengthSq() > 0.1) {
            // Subtract
            let toSubtract = Math.min(Math.abs(currentHeight - this.terrain.getSurroundingMinHeight(x, y)), this.pickupRate * this.velocity.length())

            this.currentlyHolding += toSubtract
            this.terrain.bilerp_changeHeight(x, y, -toSubtract)
        } else {
            if (!uphill && this.currentlyHolding > 0) {
                let toAdd = Math.min(Math.abs(this.terrain.getSurroundingMaxHeight(x, y) - currentHeight), this.depositRate, this.currentlyHolding * 1/this.velocity.lengthSq())
                this.currentlyHolding -= toAdd
                this.terrain.bilerp_changeHeight(x, y, toAdd)
            }
        }
        this.velocity.multiplyScalar(0.9)
        // Death
        if (this.positionHistory.length > this.maxLife || this.checkForOscillation()) {
            this.isDead = true
        }
        this.positionHistory.push(this.position.clone())
    }

    checkForOscillation() {
        return this.positionHistory.length>4 && 
        this.position.distanceToSquared(this.positionHistory[this.positionHistory.length-1])<2
        && this.position.distanceToSquared(this.positionHistory[this.positionHistory.length-2])<2
        && this.position.distanceToSquared(this.positionHistory[this.positionHistory.length-3])<2
    }
}
