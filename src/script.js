import './style.css'

import * as THREE from 'three'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import CANNON from "cannon"

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const cursor = {
  x: 0,
  y: 0
}
const adjustedCursor = new THREE.Vector2();
const mouseCoordinates = new THREE.Vector2();
window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / sizes.width - 0.5
  cursor.y = -(e.clientY / sizes.height - 0.5)
  adjustedCursor.x = e.clientX / sizes.width * 2 - 1;
  adjustedCursor.y = -(e.clientY / sizes.height) * 2 + 1;
  mouseCoordinates.x = e.clientX
  mouseCoordinates.y = e.clientY
})

const options = {
  enableSwoopingCamera: false,
  enableRotation: true,
  transmission: 1,
  thickness: 1.2,
  roughness: 0.05,
  envMapIntensity: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  normalScale: 1,
  clearcoatNormalScale: 0.3,
  normalRepeat: 1,
  bloomThreshold: 0.85,
  bloomStrength: 0.5,
  bloomRadius: 0.33
}

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, 0, 0)

const fog = new THREE.Fog('#A842FF', 20, 40)
scene.fog = fog

const textureLoader = new THREE.TextureLoader()
const cubeTexureLoader = new THREE.CubeTextureLoader()
const matcapTexture = textureLoader.load('./textures/matcaps/10.jpeg')
const matcapMaterial = new THREE.MeshMatcapMaterial({
  matcap: matcapTexture
})
const fontLoader = new FontLoader()

fontLoader.load(
  './fonts/Mabry Pro Black_Regular.json',
  (font) => {
    const textGeometry = new TextGeometry(
      'small fps energy', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 3,
        // bevelEnabled: true,
        // bevelThickness: 0.03,
        // bevelSize: 0.02,
        // bevelOffset: 0,
        // bevelSegments: 2
      }
    )
    textGeometry.center()
    const text = new THREE.Mesh(textGeometry, matcapMaterial)
    scene.add(text)
  }
)

// const ambientLight = new THREE.AmbientLight('#ffffff', 3.3)
// scene.add(ambientLight)

// const hdrEquirect = new RGBELoader().load(
//   "./textures/environmentMaps/empty_warehouse_01_1k.hdr",
//   () => {
//     hdrEquirect.mapping = THREE.EquirectangularReflectionMapping
//   }
// )

const environmentMap = cubeTexureLoader.load([
  "./textures/environmentMaps/cubeMap/px.jpg",
  "./textures/environmentMaps/cubeMap/nx.jpg",
  "./textures/environmentMaps/cubeMap/py.jpg",
  "./textures/environmentMaps/cubeMap/ny.jpg",
  "./textures/environmentMaps/cubeMap/pz.jpg",
  "./textures/environmentMaps/cubeMap/nz.jpg"
])

scene.background = environmentMap

const normalMapTexture = textureLoader.load("./textures/environmentMaps/normal.jpeg")
normalMapTexture.wrapS = THREE.RepeatWrapping
normalMapTexture.wrapT = THREE.RepeatWrapping
normalMapTexture.repeat.set(options.normalRepeat, options.normalRepeat)

const MESH_COUNT = 48
const targets = []
const bodies = []

const material = new THREE.MeshPhysicalMaterial({
  transmission: options.transmission,
  thickness: options.thickness,
  roughness: options.roughness,
  // envMap: hdrEquirect,
  envMap: environmentMap,
  envMapIntensity: options.envMapIntensity,
  clearcoat: options.clearcoat,
  clearcoatRoughness: options.clearcoatRoughness,
  normalScale: new THREE.Vector2(options.normalScale),
  normalMap: normalMapTexture,
  clearcoatNormalMap: normalMapTexture,
  clearcoatNormalScale: new THREE.Vector2(options.clearcoatNormalScale)
})

const hoverMaterial = material.clone()

const plasticCannonMaterial = new CANNON.Material()

const plasticPlasticContactMaterial = new CANNON.ContactMaterial(
  plasticCannonMaterial,
  plasticCannonMaterial,
  {
    friction: 0.04,
    restitution: 0.01
  }
)

world.addContactMaterial(plasticPlasticContactMaterial)

const textCannon = new CANNON.Box(new CANNON.Vec3(2.640500068664551, 0.3187499940395355, 0.10000000149011612))
const textBody = new CANNON.Body({
  mass: 0,
  shape: textCannon,
  material: plasticCannonMaterial
})
world.addBody(textBody)

// const stickThree = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 12), matcapMaterial)
// scene.add(stickThree)

const stickCannon = new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 6))
const stickBoby = new CANNON.Body({
  mass: 1,
  shape: stickCannon,
  material: plasticCannonMaterial,
  force: new CANNON.Vec3(1, 1, 1)
})
world.addBody(stickBoby)

const geometry = new RoundedBoxGeometry(0.3, 0.3, 0.3, 2, 0.05)
const mesh = new THREE.Mesh(geometry, material)
// const geometry = new THREE.TorusGeometry(0.5, 0.3, 32, 32)
// const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
// const mesh = new THREE.InstancedMesh(geometry, material, MESH_COUNT)

const cannonShape = new CANNON.Box(new CANNON.Vec3(0.15, 0.15, 0.15))

for (let i = 0; i < MESH_COUNT; i++) {
  const currentMesh = mesh.clone()

  const x = (Math.random() - 0.5) * 10
  const y = (Math.random() - 0.5) * 7
  const z = (Math.random() - 0.5) * 10
  currentMesh.position.set(x, y, z)

  const currentCannonBody = new CANNON.Body({
    mass: 200,
    position: new CANNON.Vec3(x, y, z),
    shape: cannonShape,
    material: plasticCannonMaterial,
    angularDamping: 0.8,
    linearDamping: 0.31,
    angularVelocity: new CANNON.Vec3(10, 10, 10),
    force: new CANNON.Vec3(10, 10, 10)
  })
  const axis = new CANNON.Vec3(x, y, z)
  currentCannonBody.quaternion.setFromAxisAngle(axis, x);

  currentMesh.quaternion.copy(currentCannonBody.quaternion)

  scene.add(currentMesh)
  world.addBody(currentCannonBody)
  targets.push(currentMesh)
  bodies.push(currentCannonBody)
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 30)
camera.position.z = 6
camera.lookAt(0, 0, 0)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.physicallyCorrectLights = true

const renderPass = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  options.bloomStrength,
  options.bloomRadius,
  options.bloomThreshold
)

const composer = new EffectComposer(renderer)
composer.addPass(renderPass)
composer.addPass(bloomPass)

const clock = new THREE.Clock()
let oldElapsedTime = 0

const raycaster = new THREE.Raycaster()
let currentIntersect
let intersected = []

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  raycaster.setFromCamera(adjustedCursor, camera)

  const intersects = raycaster.intersectObjects(targets)

  for (const target of targets) {
    hoverMaterial.roughness = Math.max(0.05, hoverMaterial.roughness -= 0.001)
    if (hoverMaterial.roughness === 0.05) {
      target.material = material
    }
  }
  for (let intersect of intersects) {
    currentIntersect = intersects[0]
    currentIntersect.object.material = hoverMaterial
    currentIntersect.object.material.roughness = Math.min(0.35, currentIntersect.object.material.roughness += 0.09)
    intersected.push(currentIntersect)
  }

  camera.rotation.x = Math.sin(elapsedTime / 10)
  camera.rotation.x += (Math.sin(elapsedTime) * 0.5) * .01
  camera.rotation.z = (Math.sin(elapsedTime / 4) * cursor.x) * 0.5
  camera.lookAt(0, 0, 0)
  stickBoby.quaternion.copy(camera.quaternion)
  // stickThree.quaternion.copy(camera.quaternion)

  camera.position.x += (cursor.x * 15 - camera.position.x) * .01
  camera.position.y += (cursor.y * 15 - camera.position.y) * .01
  const screenPosition = new THREE.Vector3(cursor.x, cursor.y, 0)
  screenPosition.unproject(camera)
  stickBoby.position.set(screenPosition.x / 2, screenPosition.y / 2, 0)
  // stickThree.position.copy(stickBoby.position)


  world.step(1 / 60, deltaTime, 3)

  for (let i = 0; i < targets.length; i++) {
    const impulse = new CANNON.Vec3(
      -bodies[i].position.x * deltaTime * (50 * (0.5 - Math.abs(cursor.x))),
      -bodies[i].position.y * deltaTime * (50 * (0.5 - Math.abs(cursor.x))),
      -bodies[i].position.z * deltaTime * (50 * (0.5 - Math.abs(cursor.x)))
    )
    bodies[i].applyImpulse(impulse, new CANNON.Vec3(0, 0, 0))
    targets[i].position.copy(bodies[i].position)
    targets[i].quaternion.copy(bodies[i].quaternion)
  }

  // Update controls
  // controls.update()

  composer.render()
  // renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}
tick()
