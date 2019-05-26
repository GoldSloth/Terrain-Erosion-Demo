var scene = new THREE.Scene()

camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500)
camera.position.z = 64

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(0, 100, 0)
directionalLight.target
scene.add(directionalLight)

var magnitudeY = 6

var terra = new SimplexTerrain(40, 200, 6)
terra.generateTerrain()
terrainColors = [
    new THREE.Vector4(0.0, 0.0, 1.0, 0.0),
    new THREE.Vector4(0.2, 0.0, 1.0, 0.2),
    new THREE.Vector4(0.4, 0.0, 1.0, 0.4),
    new THREE.Vector4(0.6, 0.0, 0.8, 0.6),
    new THREE.Vector4(0.8, 0.0, 0.6, 0.8),
    new THREE.Vector4(1.0, 0.2, 0.2, 1.0),
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

var mesh = terra.createMesh(material)
mesh.position.y -= 10
scene.add(mesh)

terra.addLayer(100, 1)

terra.scaleTerrain(5)

renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    var time = Date.now() * 0.001;

    // var lightIntensity = Math.cos(time) + 1;
    // material.uniforms.lightIntensity.value = lightIntensity;

    // mesh.rotation.x = time * 0.5;
    mesh.rotation.y = time * 0.5;
    renderer.render(scene, camera);

}
animate()