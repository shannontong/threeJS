export default "uniform float uTime;\nuniform float uSize;\n\nattribute vec3 aRandomness;\nattribute float aScale;\n\nvarying vec3 vColor;\n\nvoid main()\n{\n    /**\n    * Position - using position and converting to vector 4\n    */\n    vec4 modelPosition = modelMatrix * vec4(position, 1.0);\n\n    // Spin\n    float angle = atan(modelPosition.x, modelPosition.z); // Atan stands for arc-tangent providing x z axis and gives us the angle\n    float distanceToCenter = length(modelPosition.xz); // Getting distance to make particles closer to the center spin faster simulating gravity\n    float angleOffset = (1.0 / distanceToCenter) * uTime; // Calculate offset angle according to the time and disatnce how much the particle should spin\n    angle += angleOffset;\n    modelPosition.x = cos(angle) * distanceToCenter;\n    modelPosition.z = sin(angle) * distanceToCenter;\n\n    // Randomness\n    modelPosition.xyz += aRandomness;\n    \n    vec4 viewPosition = viewMatrix * modelPosition;\n    vec4 projectedPosition = projectionMatrix * viewPosition;\n    gl_Position = projectedPosition;\n\n    /**\n    * Size\n    */\n    gl_PointSize = uSize * aScale; // Multiplying the size by a random value between 0-1 as it makes the particles appear more realistic.\n    gl_PointSize *= (1.0 / - viewPosition.z); // Adding size attenuation to give perspective to make the pixles closest to the camera appear bigger\n\n    /**\n    * Colour\n    */\n    vColor = color;\n}";