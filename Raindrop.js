function isBetween(value, lower, upper) {
    return (value >= lower && value <= upper)
}

class Raindrop {
    constructor(position, pickupRate, depositRate, terrain) {
        this.position = position.clone()
        this.capacity = 0
        this.maxlife = 400
        this.pickupRate = pickupRate
        this.depositRate = depositRate
        this.velocity = new THREE.Vector2(0, 0)
        this.isDead = false
        this.terrain = terrain
        this.lineGeom = new THREE.Geometry()
        this.lineMaterial = new THREE.LineBasicMaterial({color: 0xffefff})
        this.line = new THREE.Line(this.lineGeom, this.lineMaterial)
        scene.add(this.line)
    }
    
    move() {
        if (isBetween(this.position.x, 2, this.terrain.segments - 1) > 0 && isBetween(this.position.y, 2, this.terrain.segments - 1) && this.maxlife > 0) {
            let currentHeight = this.terrain.bilerp_height(this.position.x, this.position.y)
            let lastPos = this.position.clone()

            let m = this.terrain.bilerp_gradient(this.position.x, this.position.y)
            let dx = m.x
            let dy = m.y

            this.velocity.x = dx + (this.velocity.x * 0.9)
            this.velocity.y = dy + (this.velocity.y * 0.9)

            // if (this.velocity.length() < 0.01) {
            //     this.isDead = true
            // }

            this.position.add(this.velocity)

            let newHeight = this.terrain.bilerp_height(this.position.x, this.position.y)

            let deltaH = currentHeight - newHeight
            if (this.capacity < 1 || this.velocity.length() > 0.05) {
                let deltaCap = deltaH * this.pickupRate
                this.terrain.bilerp_setHeight(lastPos.x, lastPos.y, -deltaH)
                this.capacity += deltaCap
            } else {
                let deltaCap = deltaH * this.depositRate
                this.terrain.bilerp_setHeight(lastPos.x, lastPos.y, deltaH)
                this.capacity -= deltaCap
            }
            this.plotPath()
            console.log("Velocity: " + this.velocity.length())
            console.log("Capacity: " + this.capacity)
            this.maxlife--
        } else {
            this.isDead = true
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

class RainManager {
    constructor(raindropPickupRate, raindropDepositRate, terrain) {
        this.raindropPickupRate = raindropPickupRate
        this.raindropDepositRate = raindropDepositRate
        this.terrain = terrain
    }

    runRaindrop(position) {
        let raindrop = new Raindrop(position, this.raindropPickupRate, this.raindropDepositRate, this.terrain)
        while (!raindrop.isDead) {
            raindrop.move()
        }
    }

    runManyRaindrops(locations) {
        for (var place of locations) {
            this.runRaindrop(place)
        }
        this.terrain.update()
    }
}

