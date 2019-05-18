var scene = new THREE.Scene()
var simplex = new SimplexNoise(Math.random())

camera = new THREE.PerspectiveCamera(27, window.innerWidth/ window.innerHeight, 1, 3500)
camera.position.z = 64

// var ambientLight = new THREE.AmbientLight(0x222222)

// scene.add(ambientLight)
// var light1 = new THREE.DirectionalLight(0xffffff, 0.5)
// light1.position.set(1, 1, 1)
// scene.add(light1)

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(10, 100, 10)
scene.add(directionalLight)


var geometry = new THREE.BufferGeometry();
var indices = [];
var vertices = [];
var normals = [];
var colors = [];
var size = 40;
var segments = 500;
var halfSize = size / 2;
var segmentSize = size / segments;
var magnitudeY = 6
var magY = magnitudeY/2
// generate vertices, normals and color data for a simple grid geometry
for ( var i = 0; i <= segments; i ++ ) {
    var y = ( i * segmentSize ) - halfSize;
    for ( var j = 0; j <= segments; j ++ ) {
        var x = ( j * segmentSize ) - halfSize;
        var zVal = (simplex.noise2D(x/10, y/10)+1) * magY
        // console.log(zVal)
        vertices.push( x, zVal, y );
        normals.push( 0 , 1, 0 );
        colors.push( Math.random(), Math.random(), Math.random() );
    }
}
// generate indices (data for element array buffer)
for ( var i = 0; i < segments; i ++ ) {
    for ( var j = 0; j < segments; j ++ ) {
        var a = i * ( segments + 1 ) + ( j + 1 );
        var b = i * ( segments + 1 ) + j;
        var c = ( i + 1 ) * ( segments + 1 ) + j;
        var d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );
        // generate two faces (triangles) per iteration
        indices.push( a, b, d ); // face one
        indices.push( b, c, d ); // face two
    }
}

geometry.setIndex( indices );
geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

geometry.computeVertexNormals()


terrainColors =  [
    new THREE.Vector4(0.2, 1.0, 0.2, 0.2),
    new THREE.Vector4(0.4, 0.4, 1.0, 0.4),
    new THREE.Vector4(0.6, 0.6, 0.6, 1.0),
    new THREE.Vector4(0.8, 1.0, 0.8, 0.8),
    new THREE.Vector4(1.0, 1.0, 0.0, 1.0),
]

var material = new THREE.ShaderMaterial( {
    side: THREE.DoubleSide,
    uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        {
            'lightIntensity': {type: 'f', value: 1.0},
            'terrainColors': {value: terrainColors, type: 'v4v'},
            'magnitudeY': {type: 'f', value: magnitudeY}
        }
    ]),
    transparent: true,
    lights: true,
    vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vectorPos;

    void main()
    {
        vectorPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vPosition = position;
        vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    #define TERRAIN_COLOR_ARRAY_LENGTH ` + terrainColors.length + '\n' +
    `precision highp float;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vectorPos;

    uniform float lightIntensity;
    uniform float magnitudeY;

    uniform vec4 terrainColors[TERRAIN_COLOR_ARRAY_LENGTH];

    #if NUM_DIR_LIGHTS > 0 
        struct DirectionalLight {
            vec3 direction;
            vec3 color;
            int shadow;
            float shadowBias;
            float shadowRadius;
            vec2 shadowMapSize;
        };
        uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
    #endif
    
    void main()
    {
        vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);
        if(NUM_DIR_LIGHTS > 0) {
            for(int l0 = 0; l0 < NUM_DIR_LIGHTS; l0++) {
                vec3 lightDirection = normalize(vectorPos - directionalLights[l0].direction);
                addedLights.rgb += (clamp(dot(lightDirection, -vNormal), 0.0, 0.9) + 0.1) * directionalLights[l0].color * lightIntensity;
            }
        }
        for (int l1 = 0; l1 < TERRAIN_COLOR_ARRAY_LENGTH; l1 ++) {
            if (terrainColors[l1].x < vPosition.y/magnitudeY) {
                gl_FragColor = vec4(terrainColors[l1].y, terrainColors[l1].z, terrainColors[l1].w, 1.0) * addedLights;
            }
        }
        
    }
    `
} );
// gl_FragColor = vec4(vec3(vColor), 1.0);
var mesh = new THREE.Mesh(geometry, material)
mesh.position.y -= 10

console.log(mesh)

scene.add(mesh)

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

function animate() {
    requestAnimationFrame( animate );
    render();
}
function render() {
    var time = Date.now() * 0.001;

    // var lightIntensity = Math.cos(time) + 1;
    // material.uniforms.lightIntensity.value = lightIntensity;

    // mesh.rotation.x = time * 0.5;
    mesh.rotation.y = time * 0.5;
    renderer.render( scene, camera );

}
animate()
