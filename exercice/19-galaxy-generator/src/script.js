import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import galaxyVertexShader from './shaders/galaxy/vertex.glsl'
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 360 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Galaxy
const parameters = {}
parameters.count = 40000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'
parameters.speed = 0.08

// Reset
let geometry = null
let material = null
let points = null

const generateGalaxy = () => {

  // Destroy previous galaxy
  if (points !== null) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }

  // Color
  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  // Geometry
  geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)
  const scales = new Float32Array(parameters.count * 1)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // Rayon
    const radius = Math.random() * parameters.radius

    // Branche angle
    const spinAngle = radius * parameters.spin

    // Branche angle
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

    positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX // X
    positions[i3 + 1] = randomY // Y
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ // Z

    // Color
    const mixedColor = colorInside.clone()
    mixedColor.lerp(colorOutside, radius / parameters.radius)

    colors[i3 + 0] = mixedColor.r // R
    colors[i3 + 1] = mixedColor.g // G
    colors[i3 + 2] = mixedColor.b // B

    // Scale
    scales[i] = Math.random() // Adding randomness to the size of the particles makes them more realistic

  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

  // Material
  material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
    uniforms: //Asign controls to dat.gui
    {
      uTime: { value: 0 },
      uSize: { value: 20 * renderer.getPixelRatio() }
    }
  })

  /* material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  })
  material.size = 0.1
  material.transparent = true
  material.alphaMap = particleTexture4
  material.depthWrite = false
  material.blending = THREE.AdditiveBlending
  material.vertexColors = true */

  // Mesh center
  points = new THREE.Points(geometry, material)
  scene.add(points)

}
/* generateGalaxy() */

// Gui
gui.add(parameters, 'count').min(100).max(1000000).step(100).name('Nombre d\'étoiles').onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).name('Taille des étoiles').onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).name('Taille de la galaxie').onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).name('Nombre de branches').onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).name('Rotation des branches').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).name('Attraction des branches').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).name('Attraction entre les étoiles').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').name('Couleur des étoiles').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').name('Couleur de la galaxie').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Generate Galaxy
 */

generateGalaxy()

/**
 * Animate 
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Rotation
  /* points.rotation.y = elapsedTime * parameters.speed */

  // Update material
  material.uniforms.uTime.value = elapsedTime / 10

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()