class Raindrop {
    constructor(position, capacity, pickupRate, depositRate, terrainMap, gradientMap) {
        this.position = position
        this.capacity = capacity
        this.pickupRate = pickupRate
        this.depositRate = depositRate
        this.velocity = new THREE.Vector2()
    }
    
    _move() {
        this.position.x += this.velocity.x
        this.position.z += this.velocity.y

    }


}