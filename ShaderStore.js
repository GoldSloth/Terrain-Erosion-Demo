class ShaderStore {
    static get vertexShader() {
        return `
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
        `
    }
    static fragmentShader(terrainColorsLength) {
        return `#define TERRAIN_COLOR_ARRAY_LENGTH ` + terrainColorsLength + '\n' +
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
    }
}
