var scene = new THREE.Scene()
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
var camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500)
var controls = new THREE.OrbitControls(camera, renderer.domElement)
camera.position.z = 64
camera.position.y = 60
camera.lookAt(new THREE.Vector3(0, 0, 0))

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(0, 100, 0)
scene.add(directionalLight)

var magnitudeY = 6

var terra = new SimplexTerrain(20, 200, 20)
terra.generateTerrain()
terrainColors = [
    new THREE.Vector4(0.0, 0.0, 1.0, 1.0),
    new THREE.Vector4(0.2, 0.0, 1.0, 0.8),
    new THREE.Vector4(0.4, 0.0, 1.0, 0.6),
    new THREE.Vector4(0.6, 0.0, 1.0, 0.4),
    new THREE.Vector4(0.8, 0.0, 1.0, 0.2),
    new THREE.Vector4(1.0, 0.0, 1.0, 0.0)
]

var material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        {
            'lightIntensity': {
                type: 'f',
                value: 1.0
            },
            'terrainColors': {
                value: terrainColors,
                type: 'v4v'
            },
            'magnitudeY': {
                type: 'f',
                value: magnitudeY
            }
        }
    ]),
    transparent: true,
    lights: true,
    vertexShader: ShaderStore.vertexShader,
    fragmentShader: ShaderStore.fragmentShader(terrainColors.length)
});
var mat = new THREE.MeshLambertMaterial({side:THREE.DoubleSide})

var mesh = terra.createMesh(mat)
scene.add(mesh)

terra.addLayer(800, 0.5)
terra.addLayer(200, 0.35)
terra.addLayer(100, 0.135)
terra.addLayer(40, 0.025)

function xcubed(value) {
    return Math.pow(value, 3)
}

terra.applyFunction(xcubed)

terra.scaleTerrain(5)

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    render();
}

let lasttime = performance.now()
let origin = new THREE.Vector3(0, 0, 0)


for (let i=0; i<3000; i++) {
    let rain = new Raindrop(new THREE.Vector2(Math.random() * 190 + 5, Math.random() * 190 + 5), terra)
    while (!rain.isDead) {
        rain.move()
    }
}



terra.update()

function render() {
    controls.update()
    renderer.render(scene, camera);
}
animate()