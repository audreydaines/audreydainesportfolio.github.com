
import * as THREE from 'three';

import { GLTFLoader } from
'three/addons/loaders/GLTFLoader.js';

// 1. Create scene
const scene = new THREE.Scene();

scene.background = null;

// 2. Create camera
const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    1000
);

camera.position.set(0, 0, 5);

// 3. Create renderer
const canvas = document.getElementById('model-canvas');

const container = document.querySelector('.model-container');

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

// 4. Add lighting
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

directionalLight.position.set(5, 5, 5);

scene.add(directionalLight);

// 5. Load GLB model
let model = null;

const loader = new GLTFLoader();

loader.load(
    'models/portfolio-model.glb',

    function (gltf) {

        model = gltf.scene;

        // Calculate model dimensions
        const box = new THREE.Box3().setFromObject(model);

        const center = box.getCenter(new THREE.Vector3());

        const size = box.getSize(new THREE.Vector3());

        // Center the model
        model.position.sub(center);

        // Automatically scale model
        const maxDimension = Math.max(
            size.x,
            size.y,
            size.z
        );

        const scale = 3 / maxDimension;

        model.scale.setScalar(scale);

        scene.add(model);

    },

    undefined,

    function (error) {
        console.error('Model loading failed:', error);
    }
);

// 6. Track scrolling
let scrollProgress = 0;

window.addEventListener('scroll', () => {

    const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;

    scrollProgress = maxScroll > 0
        ? window.scrollY / maxScroll
        : 0;

}, { passive: true });

// 7. Resize renderer
function resizeRenderer() {

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);

}

window.addEventListener('resize', resizeRenderer);

resizeRenderer();

// 8. Animation loop
function animate() {

    requestAnimationFrame(animate);

    if (model) {

        // Full 360-degree rotation over page scroll
        model.rotation.y = scrollProgress * Math.PI * 2;

        // Slight additional tilt
        model.rotation.x = scrollProgress * 0.3;

    }

    renderer.render(scene, camera);

}

animate();
