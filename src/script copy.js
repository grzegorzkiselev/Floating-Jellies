import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'

// Cursor
const cursor = { 
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = -(e.clientY / sizes.height - 0.5)
})

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/10.png')

// Fonts
const fontLoader = new THREE.FontLoader();

fontLoader.load(
    '/fonts/YS Text Medium_Italic.json',
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            'Яндекс Плюс',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 6
            }
)
        textGeometry.center();

        // const textMaterial = new THREE.MeshNormalMaterial();
        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
        // material.flatShading = true;
        // material.wireframe = true;

        const text = new THREE.Mesh(textGeometry, material);
        scene.add(text);

        // const donutGeometry = new THREE.TorusBufferGeometry(
        //         0.3,
        //         0.3,
        //         20,
        //         45
        //     )
        // const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
        
        for (let i = 0; i < 20; i++) {
            gltfLoader.load(
                '/models/wv.glb',
                (gltf) =>
                {
                    gltf.scene.position.set(0, 0, 0);
                    
                    const angle = Math.random() * Math.PI * 2;

                    const radius = 2 + Math.random() * 2;

                    gltf.scene.position.x = (Math.random() - 0.5) * radius * 5;
                    gltf.scene.position.y = Math.sin(angle) * radius;
                    gltf.scene.position.z = Math.cos(angle) * radius;

                    gltf.scene.rotation.x = Math.random() * Math.PI;
                    gltf.scene.rotation.y = Math.random() * Math.PI;

                    const scale = Math.random();
                    gltf.scene.scale.x = scale;
                    gltf.scene.scale.y = scale;
                    gltf.scene.scale.z = scale;
            
                    scene.add(gltf.scene);
                }
            )
            // const donut = new THREE.Mesh(donutGeometry, material);
            
            // const angle = Math.random() * Math.PI * 2;
            // const radius = 2 + Math.random() * 8;

            // donut.position.x = Math.sin(angle) * radius;
            // donut.position.y = Math.sin(angle) * radius;
            // donut.position.z = Math.cos(angle) * radius;

            // donut.rotation.x = Math.random() * Math.PI;
            // donut.rotation.y = Math.random() * Math.PI;

            // const scale = Math.random();
            // donut.scale.x = scale;
            // donut.scale.y = scale;
            // donut.scale.z = scale;
            
            // scene.add(donut)
        }
        // textGeometry.computeBoundingBox();
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x - 0.02)/ 2,
        //     - (textGeometry.boundingBox.max.y / 2) - 0.02,
        //     - (textGeometry.boundingBox.max.z / 2) - 0.03,
        // )

    }
)

/**
 * Object
 */
const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

cube.visible = false;
scene.add(cube)

const pointLight = new THREE.PointLight('#ffffff', 3);
pointLight.position.set(0, 0, 0);
pointLight.castShadow;
pointLight.shadow.camera.far = 15;
pointLight.shadow.mapSize.set(1024, 1024);
pointLight.shadow.normalBias = 0.05;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
camera.position.z = 3;
camera.lookAt(cube);
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// // Axis heper
// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#F5F8FF');

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Camera
        // camera.rotation.y = Math.cos(elapsedTime) * 0.2;
    // scene.rotation.x = Math.sin(elapsedTime / 10);
    // scene.rotation.x += (Math.sin(elapsedTime) * 0.5) * .01;
    

    // scene.rotation.z = (Math.sin(elapsedTime / 4) * cursor.x) * 0.5;

    // camera.position.x += (cursor.x * 15 - camera.position.x) * .01;
    // camera.position.y += (cursor.y * 15 - camera.position.y) * .01;
    

    // camera.position.x = cursor.x * 10;
    // camera.position.y = cursor.y * 10;
    camera.lookAt(cube.position);

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()