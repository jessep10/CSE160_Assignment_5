import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


//Create scene with fog
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 10, 150);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; //Enable shadows (Extra Point)
document.body.appendChild(renderer.domElement);

// Load texture for the floor
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('textures/floor/acacia.jpg');

// Apply repeat to texture for tiling
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);

// Create a floor
const floorGeometry = new THREE.PlaneGeometry(150, 150);
const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 1;
floor.receiveShadow = true;
scene.add(floor);

// Load a skybox
const loader = new THREE.TextureLoader();
loader.load('textures/skybox/Zelda.jpg', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
});

// Create Navi Cube
const cubeTexture = textureLoader.load('textures/Navi.png');
const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
const cubeMaterial = new THREE.MeshStandardMaterial({ map: cubeTexture });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(8, 15, 3);
cube.castShadow = true; // Cube casts shadows (Extra Point)
scene.add(cube);

//  Add a Rotating Cylinder
const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 10, 32);
const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db, metalness: 0.5, roughness: 0.5 });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.set(-2, 15, -6);
cylinder.castShadow = true; // Cylinder casts shadow (Extra Point )
scene.add(cylinder);

//Add Light with Shadows
const light = new THREE.PointLight(0xffff00, 15, 15);
light.position.set(2, 24, -6);
scene.add(light);

// Add a Sphere to Represent the Light Source
const lightSphereGeometry = new THREE.SphereGeometry(2, 64, 64);
const lightSphereMaterialOn = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 });
const lightSphereMaterialOff = new THREE.MeshBasicMaterial({ color: 0x555555, emissive: 0x000000 });

const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterialOn);
lightSphere.position.copy(light.position);
scene.add(lightSphere);

let isLightOn = true;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(lightSphere);
    
    if (intersects.length > 0) {
        isLightOn = !isLightOn;
        light.visible = isLightOn;
        lightSphere.material = isLightOn ? lightSphereMaterialOn : lightSphereMaterialOff;
    }
});

// Fireflies setup
const fireflies = [];
const fireflyGeometry = new THREE.SphereGeometry(0.5, 10, 10);
const fireflyMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffff99, emissiveIntensity: 20 });

const areaSize = 100;
for (let i = 0; i < 50; i++) {
    const firefly = new THREE.Mesh(fireflyGeometry, fireflyMaterial);
    
    firefly.position.set(
        (Math.random() - 0.5) * areaSize,
        Math.random() * 5,
        (Math.random() - 0.5) * areaSize
    );

    // Create a new unique light for each firefly
    const fireflyLight = new THREE.PointLight(0xffff99, 10, 5);
    fireflyLight.position.copy(firefly.position);
    firefly.add(fireflyLight);

    fireflies.push({ mesh: firefly, velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
    )});

    scene.add(firefly);
}

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(100, 1000, 1000);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 10 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Sunlight
const sunlight = new THREE.DirectionalLight(0xffffff, 5);
sunlight.castShadow = true;
scene.add(sunlight);

// Enable OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Load the Master Sword and Apply Spotlight
const gltfLoader = new GLTFLoader();
gltfLoader.load('models/master_sword.glb', (gltf) => {
    const sword = gltf.scene;
    scene.add(sword);

    sword.scale.set(6, 6, 6);
    sword.position.set(0, 1, -40);
    sword.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Add a Spotlight over the Master Sword
    const spotlight = new THREE.SpotLight(0xffffff, 50, 200, Math.PI / 4, 0.5, 1);
    spotlight.position.set(0, 80, -40);
    spotlight.target = sword;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    scene.add(spotlight);
});

// Load Forest Model
gltfLoader.load('models/low_poly_forest.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(0, -90, -100);
    scene.add(model);
});

// Load Link Model
gltfLoader.load('models/link.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(15, 15, 15);
    model.position.set(0, 2, 10);
    scene.add(model);
});

// Animation Loop
let startTime = Date.now();
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Move Fireflies
    fireflies.forEach(firefly => {
        firefly.mesh.position.add(firefly.velocity);
    });

    // Rotate Objects
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cylinder.rotation.x += 0.01;
    cylinder.rotation.y += 0.01;

    // Animate Sun Movement
    const elapsedTime = (Date.now() - startTime) / 30000;
    const angle = elapsedTime * Math.PI * 2;
    const radius = 500;
    sun.position.set(radius * Math.cos(angle), radius * Math.sin(angle), radius * Math.sin(angle));
    sunlight.position.copy(sun.position);
    renderer.render(scene, camera);
}
animate();