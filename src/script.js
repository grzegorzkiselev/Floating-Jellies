import './style.css'
import * as THREE from 'three'
import {
  RGBELoader
} from "three/examples/jsm/loaders/RGBELoader.js"
import {
  EffectComposerk
} from "three/examples/jsm/postprocessing/EffectComposer.js"
import {
  RenderPass
} from "three/examples/jsm/postprocessing/RenderPass.js"
import {
  UnrealBloomPass
} from "three/examples/jsm/postprocessing/UnrealBloomPass.js"

import {
  FontLoader
} from "three/examples/jsm/loaders/FontLoader.js"

import {
  TextGeometry
} from "three/examples/jsm/geometries/TextGeometry.js"

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

const fog = new THREE.Fog('#A842FF', 20, 40)
scene.fog = fog

const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/10.jpeg')
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

const hdrEquirect = new RGBELoader().load(
  "./textures/environmentMaps/empty_warehouse_01_1k.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping
  }
)

const normalMapTexture = textureLoader.load("./textures/environmentMaps/normal.jpeg")
normalMapTexture.wrapS = THREE.RepeatWrapping
normalMapTexture.wrapT = THREE.RepeatWrapping
normalMapTexture.repeat.set(options.normalRepeat, options.normalRepeat)

const material = new THREE.MeshPhysicalMaterial({
  transmission: options.transmission,
  thickness: options.thickness,
  roughness: options.roughness,
  envMap: hdrEquirect,
  envMapIntensity: options.envMapIntensity,
  clearcoat: options.clearcoat,
  clearcoatRoughness: options.clearcoatRoughness,
  normalScale: new THREE.Vector2(options.normalScale),
  normalMap: normalMapTexture,
  clearcoatNormalMap: normalMapTexture,
  clearcoatNormalScale: new THREE.Vector2(options.clearcoatNormalScale)
})
const hoverMaterial = material.clone()

const geometry = new THREE.TorusGeometry(0.5, 0.3, 32, 32)
const MESH_COUNT = 48
const targets = []
// const mesh = new THREE.InstancedMesh(geometry, material, MESH_COUNT)
const mesh = new THREE.Mesh(geometry, material)

for (let i = 0; i < MESH_COUNT; i++) {
  const currentMesh = mesh.clone()
  currentMesh.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 20
  )
  currentMesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  )
  currentMesh.rotation.set(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  )
  scene.add(currentMesh)
  targets.push(currentMesh)
}

// const matrixDummy = new THREE.Object3D()

// const instanceData = [...Array(MESH_COUNT)].map(() => {
//   const position = new THREE.Vector3(
//     (Math.random() - 0.5) * 7,
//     (Math.random() - 0.5) * 7,
//     (Math.random() - 0.5) * 7
//   )

//   const rotation = new THREE.Euler(
//     Math.random() * Math.PI * 2,
//     Math.random() * Math.PI * 2,
//     Math.random() * Math.PI * 2
//   )

//   const axis = new THREE.Vector3(
//     Math.random() * 2 - 1,
//     Math.random() * 2 - 1,
//     Math.random() * 2 - 1
//   )

//   const BASE_SCALE = 1
//   const scale = BASE_SCALE * (0.25 + 0.75 * Math.random())

//   const rotateTime = 5 + 15 * Math.random()

//   return {
//     position,
//     rotation,
//     axis,
//     scale: new THREE.Vector3(scale, scale, scale),
//     rotateTime
//   }
// })

// const updateInstances = (deltaTime) => {
//   for (let i = 0; i < MESH_COUNT; i++) {
//     const data = instanceData[i]

//     matrixDummy.position.copy(data.position)
//     matrixDummy.scale.copy(data.scale)
//     matrixDummy.quaternion.setFromEuler(data.rotation)
//     if (options.enableRotation) {
//       matrixDummy.rotateOnWorldAxis(data.axis, deltaTime / data.rotateTime)
//       data.rotation.copy(matrixDummy.rotation)
//     }
//     matrixDummy.updateMatrix()
//     mesh.setMatrixAt(i, matrixDummy.matrix)
//   }
//   mesh.instanceMatrix.needsUpdate = true
// }

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, w))
})

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const cursor = {
  x: 0,
  y: 0
}
window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / sizes.width - 0.5
  cursor.y = -(e.clientY / sizes.height - 0.5)
})

const adjustedCursor = new THREE.Vector2();
window.addEventListener('mousemove', (_event) => {
  adjustedCursor.x = _event.clientX / sizes.width * 2 - 1;
  adjustedCursor.y = -(_event.clientY / sizes.height) * 2 + 1;
})

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 30)
camera.position.z = 6
camera.lookAt(0, 0, 0)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#272727')

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
// updateInstances(24)

const raycaster = new THREE.Raycaster()
const raycasterForDisclaimer = new THREE.Raycaster()
let currentIntersect
let intersected = []
let currentBlur = options.roughness
const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  // controls.update()

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
    currentIntersect.object.material.roughness = Math.min(0.5, currentIntersect.object.material.roughness += 0.05)
    intersected.push(currentIntersect)
  }

  // if (intersects.length) {
  //   if (currentIntersect === null) {
  //     console.log('m e')
  //     intersects[0].object.material.ior = 0.5
  //     console.log(intersects[0].object.material.ior)
  //   }
  //   currentIntersect = intersects[0]
  // } else {
  //   if (currentIntersect) {
  //     console.log('m l')
  //     currentIntersect.object.material.ior = 1.5
  //     console.log(currentIntersect.object.material.ior)
  //     // currentIntersect.material.ior = 1.5
  //   }
  //   currentIntersect = null
  // }

  camera.rotation.x = Math.sin(elapsedTime / 10)
  camera.rotation.x += (Math.sin(elapsedTime) * 0.5) * .01
  camera.rotation.z = (Math.sin(elapsedTime / 4) * cursor.x) * 0.5

  camera.position.x += (cursor.x * 15 - camera.position.x) * .01
  camera.position.y += (cursor.y * 15 - camera.position.y) * .01

  camera.lookAt(0, 0, 0)

  // Render
  composer.render()
  // renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
