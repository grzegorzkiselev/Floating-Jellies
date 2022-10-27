import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import { DirectionalLightShadow, PCFShadowMap } from 'three'
import Stats from "stats.js";

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

// Are we mobile...

let isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 isMobile = true;
}

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

/**
 * Models
 */
// THREE.Cache.enabled = true;

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/draco/")
gltfLoader.setDRACOLoader(dracoLoader)
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/10.png')

const environmentMap = cubeTextureLoader.load([
    './textures/environmentMaps/0/px.jpg',
    './textures/environmentMaps/0/nx.jpg',
    './textures/environmentMaps/0/py.jpg',
    './textures/environmentMaps/0/ny.jpg',
    './textures/environmentMaps/0/pz.jpg',
    './textures/environmentMaps/0/nz.jpg'
])

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();
scene.environment = environmentMap;

/**
 * Fog
 */
const fog = new THREE.Fog('#F5F8FF', 1, 6)
scene.fog = fog

// Fonts
const fontLoader = new THREE.FontLoader();

// Materials
const matcapMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
const phongMaterial = new THREE.MeshPhongMaterial({
    color: '#CBD3EA'
});

fontLoader.load(
    './fonts/YS Text Medium_Italic.json',
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            'Яндекс Плюс',
            {
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
        textGeometry.center();

        // material.flatShading = true;
        // material.wireframe = true;

        const text = new THREE.Mesh(textGeometry, matcapMaterial);
        scene.add(text);
    }
)

const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMap;
            // child.material.envMapIntensity = 2;
            child.material = phongMaterial;
            // child.material = carsMaterial;
            child.material.needsUpdate = true;
            child.castShadow = false;
            child.receiveShadow = false;
            // console.log(child.material);
    }})
}

// debugObject.envMapIntensity = 5;
// gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.01).onChange(updateAllMaterials)

let cars = [];
const gltfs = ['./models/Draco/wv.glb', './models/Draco/hph.glb', './models/Draco/mic.glb']

for (let model of gltfs) {
    gltfLoader.load(
        model,
        (gltf) => {
            const mesh = gltf.scene;
            for (let i = 0; i < 10; i++) {
                const currentMesh = mesh.clone()
                const angle = Math.random() * Math.PI * 2;
                const radius = 2 + Math.random() * 2;

                currentMesh.position.x = (Math.random() - 0.5) * radius * 5;
                currentMesh.position.y = Math.sin(angle) * radius;
                currentMesh.position.z = Math.cos(angle) * radius;

                currentMesh.rotation.x = Math.random() * Math.PI;
                currentMesh.rotation.y = Math.random() * Math.PI;

                const scale = Math.random();
                currentMesh.scale.x = scale;
                currentMesh.scale.y = scale;
                currentMesh.scale.z = scale;

                scene.add(currentMesh);

                updateAllMaterials();
                cars.push(currentMesh);
            }
        }
    )
}

//
// Points
//
const points = [
    {
        position: new THREE.Vector3(0, 0, 0.25),
        element: document.querySelector(".point-0")
    }
]

const ambientLight = new THREE.AmbientLight('#ffffff', 3.3);
scene.add(ambientLight);

gui.add(ambientLight, 'intensity').min(0).max(10).step(0.01)
    // .onChange(updateAllMaterials)

const pointLight = new THREE.PointLight('#B941EF');
pointLight.intensity = 2;
pointLight.distance = 0.05;

gui.add(pointLight, 'intensity').min(0).max(10).step(0.01)

// Raycaster
const raycaster = new THREE.Raycaster();
const raycasterForDisclaimer = new THREE.Raycaster();

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

const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (_event) => {
    mouse.x = _event.clientX / sizes.width * 2 - 1;
    mouse.y = - (_event.clientY / sizes.height) * 2 + 1;

    // console.log(mouse);
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3;
camera.lookAt(0,0,0);
scene.add(camera)

const pointer = new THREE.Vector2();

window.addEventListener('mousemove', (_event) => {
    pointer.x = _event.clientX / sizes.width * 2 - 1;
    pointer.y = - (_event.clientY / sizes.height) * 2 + 1;
})

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
renderer.setClearColor('#F5F8FF');
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 5;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = PCFShadowMap;

gui
    .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
    .onFinishChange(() => {
        renderer.toneMapping = Number(renderer.toneMapping);
        updateAllMaterials();
    })

/**
 * Animate
 */

let dimmer = 0;

const clock = new THREE.Clock()

let currentIntersect = null;

const carLights = (car) => {
    car.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshMatcapMaterial) {
                child.material = phongMaterial;
                // child.material.envMap = environmentMap;
                // child.material.envMapIntensity = 2;
            }
            else if (child instanceof THREE.PointLight)
                Math.min(child.distance, 0.5);
                child.distance = child.distance - child.distance / 2;
})
}

const hoverObject = (intersect) => {
intersect.object.parent.add(pointLight);
    intersect.object.parent.traverse((child) => {
            if (child.material instanceof THREE.MeshPhongMaterial) {
                child.material = carsMaterial;
            }
        })
}

const tick = () => {

    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    if (isMobile) {
        // Go through each point
        for(const point of points)
        {
            // Get 2D screen position
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            // Set the raycaster
            raycasterForDisclaimer.setFromCamera(screenPosition, camera)
            const intersects = raycasterForDisclaimer.intersectObjects(scene.children, true)

            // No intersect found
            if(intersects.length === 0)
            {
                // Show
                point.element.classList.add('visible')
            }

            // Intersect found
            else
            {
                // Get the distance of the intersection and the distance of the point
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)

                // Intersection is close than the point
                if(intersectionDistance < pointDistance)
                {
                    // Hide
                    point.element.classList.remove('visible')
                }
                // Intersection is further than the point
                else
                {
                    // Show
                    point.element.classList.add('visible')
                }
            }

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
        }

    // Raycaster
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(cars, true);

    for (const car of cars) {
        carLights(car);
        // updateAllMaterials(car);
    }

    for (const intersect of intersects) {
        hoverObject(intersect);
    }

    if (intersects.length) {
        if (currentIntersect === null) {
            // console.log('m e')
        }
        currentIntersect = intersects[0];
    } else {
        if (currentIntersect) {
            // console.log('m l')
            dimmer = 0;
        }
        currentIntersect = null;
    }

    // Camera
    camera.rotation.x = Math.sin(elapsedTime / 10);
    camera.rotation.x += (Math.sin(elapsedTime) * 0.5) * .01;
    camera.rotation.z = (Math.sin(elapsedTime / 4) * cursor.x) * 0.5;

    camera.position.x += (cursor.x * 15 - camera.position.x) * .01;
    camera.position.y += (cursor.y * 15 - camera.position.y) * .01;

    camera.lookAt(0, 0, 0);

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick();
