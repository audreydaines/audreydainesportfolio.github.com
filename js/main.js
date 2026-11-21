
/* =========================================
   IMPORT THREE.JS MODULES
========================================= */

import * as THREE from 'three';

import { GLTFLoader } from
    'three/addons/loaders/GLTFLoader.js';

import { STLLoader } from
    'three/addons/loaders/STLLoader.js';

import { OrbitControls } from
    'three/addons/controls/OrbitControls.js';


/* =========================================
   CONFIGURATION
========================================= */

// Change this path to your own model.
//
// Supported formats:
// audreydaines.github.io/audreydainesportfolio.github.com/models/BiliSpectHat (1).glb
// audreydaines.github.io/audreydainesportfolio.github.com/models/BiliSpectHat (1).gltf
// audreydaines.github.io/audreydainesportfolio.github.com/models/BiliSpectHat (1).stl

const MODEL_PATH = 'audreydaines.github.io/audreydainesportfolio.github.com/models/BiliSpectHat (1).glb';

// Total rotations across the page.
// 1 = 360 degrees
// 2 = 720 degrees

const TOTAL_ROTATIONS = 1;

// Scroll smoothing.
// Smaller values produce slower, smoother movement.

const SCROLL_SMOOTHING = 0.075;


/* =========================================
   DOM ELEMENTS
========================================= */

const canvas = document.getElementById('model-canvas');

const viewer = document.querySelector('.model-viewer');

const loaderElement = document.getElementById('modelLoader');

const errorElement = document.getElementById('modelError');

const modelName = document.getElementById('model-name');

const menuToggle = document.getElementById('menuToggle');

const navLinks = document.getElementById('navLinks');


/* =========================================
   SCENE SETUP
========================================= */

const scene = new THREE.Scene();

scene.background = null;


/* =========================================
   CAMERA
========================================= */

const camera = new THREE.PerspectiveCamera(
    40,
    1,
    0.01,
    1000
);

camera.position.set(0, 0, 5);


/* =========================================
   RENDERER
========================================= */

const renderer = new THREE.WebGLRenderer({

    canvas: canvas,

    alpha: true,

    antialias: true,

    powerPreference: 'high-performance'

});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.15;


/* =========================================
   ORBIT CONTROLS
========================================= */

const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;

controls.dampingFactor = 0.06;

controls.enablePan = false;

controls.enableZoom = true;

controls.minDistance = 1.2;

controls.maxDistance = 15;

controls.rotateSpeed = 0.7;

controls.zoomSpeed = 0.8;

controls.target.set(0, 0, 0);


/* =========================================
   LIGHTING
========================================= */

// Ambient lighting

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.5
);

scene.add(ambientLight);


// Main directional light

const mainLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

mainLight.position.set(4, 6, 5);

scene.add(mainLight);


// Fill lighting

const fillLight = new THREE.DirectionalLight(
    0xdceaff,
    1.5
);

fillLight.position.set(-5, 2, -3);

scene.add(fillLight);


// Rim lighting

const rimLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

rimLight.position.set(0, 4, -5);

scene.add(rimLight);


/* =========================================
   MODEL GROUP
========================================= */

// This group is responsible for scroll rotation.
// The loaded model is placed inside it.

const modelPivot = new THREE.Group();

scene.add(modelPivot);

let modelLoaded = false;

let modelRadius = 1;


/* =========================================
   MODEL CENTERING AND SCALING
========================================= */

function prepareModel(object) {

    // Calculate model dimensions.

    const boundingBox = new THREE.Box3().setFromObject(object);

    const center = new THREE.Vector3();

    const size = new THREE.Vector3();

    boundingBox.getCenter(center);

    boundingBox.getSize(size);


    // Center model around the origin.

    object.position.sub(center);


    // Calculate the maximum dimension.

    const maxDimension = Math.max(
        size.x,
        size.y,
        size.z
    );

    if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
        throw new Error('The model has invalid dimensions.');
    }


    // Scale model to fit the viewer.

    const targetSize = 2.8;

    const scale = targetSize / maxDimension;

    object.scale.multiplyScalar(scale);


    // Calculate camera fitting distance.

    const scaledBox = new THREE.Box3().setFromObject(object);

    const sphere = scaledBox.getBoundingSphere(
        new THREE.Sphere()
    );

    modelRadius = sphere.radius;


    // Add the model.

    modelPivot.add(object);


    // Position the camera according to model size.

    const fov = THREE.MathUtils.degToRad(camera.fov);

    const distance = Math.max(
        (modelRadius / Math.sin(fov / 2)) * 1.15,
        2
    );

    camera.position.set(
        0,
        modelRadius * 0.15,
        distance
    );

    camera.near = Math.max(modelRadius / 100, 0.001);

    camera.far = Math.max(distance * 10, 100);

    camera.updateProjectionMatrix();

    controls.minDistance = modelRadius * 1.1;

    controls.maxDistance = modelRadius * 8;

    controls.target.set(0, 0, 0);

    controls.update();


    modelLoaded = true;

}


/* =========================================
   LOAD GLB / GLTF MODEL
========================================= */

function loadGLTF() {

    const loader = new GLTFLoader();

    loader.load(

        MODEL_PATH,

        function (gltf) {

            try {

                const object = gltf.scene;

                prepareModel(object);

                loaderElement.classList.add('hidden');

                console.log('GLTF model loaded successfully.');

            } catch (error) {

                showError(error);

            }

        },

        function (progress) {

            if (progress.total > 0) {

                const percentage = Math.round(
                    progress.loaded / progress.total * 100
                );

                loaderElement.querySelector('span').textContent =
                    `Loading 3D model... ${percentage}%`;

            }

        },

        function (error) {

            showError(error);

            console.error('GLTF loading error:', error);

        }

    );

}


/* =========================================
   LOAD STL MODEL
========================================= */

function loadSTL() {

    const loader = new STLLoader();

    loader.load(

        MODEL_PATH,

        function (geometry) {

            try {

                geometry.computeVertexNormals();

                const material = new THREE.MeshStandardMaterial({

                    color: 0x9daab8,

                    metalness: 0.65,

                    roughness: 0.3

                });

                const mesh = new THREE.Mesh(
                    geometry,
                    material
                );

                prepareModel(mesh);

                loaderElement.classList.add('hidden');

                console.log('STL model loaded successfully.');

            } catch (error) {

                showError(error);

            }

        },

        undefined,

        function (error) {

            showError(error);

            console.error('STL loading error:', error);

        }

    );

}


/* =========================================
   AUTOMATIC FILE TYPE DETECTION
========================================= */

function loadModel() {

    const extension = MODEL_PATH
        .split('?')[0]
        .split('#')[0]
        .split('.')
        .pop()
        .toLowerCase();

    modelName.textContent = MODEL_PATH
        .split('/')
        .pop()
        .toUpperCase();

    if (extension === 'glb' || extension === 'gltf') {

        loadGLTF();

    } else if (extension === 'stl') {

        loadSTL();

    } else {

        showError(
            new Error('Unsupported model format.')
        );

    }

}


/* =========================================
   ERROR HANDLING
========================================= */

function showError(error) {

    loaderElement.classList.add('hidden');

    errorElement.hidden = false;

    console.error(error);

}


/* =========================================
   SCROLL-BASED ROTATION
========================================= */

let currentRotation = 0;

let targetRotation = 0;


function updateScrollProgress() {

    const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress = maxScroll > 0
        ? window.scrollY / maxScroll
        : 0;

    targetRotation =
        progress * Math.PI * 2 * TOTAL_ROTATIONS;

}

window.addEventListener(
    'scroll',
    updateScrollProgress,
    { passive: true }
);

updateScrollProgress();


/* =========================================
   RESIZE HANDLING
========================================= */

function resizeRenderer() {

    const width = viewer.clientWidth;

    const height = viewer.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
        width,
        height,
        false
    );

}

const resizeObserver = new ResizeObserver(
    resizeRenderer
);

resizeObserver.observe(viewer);

window.addEventListener(
    'resize',
    resizeRenderer
);

resizeRenderer();


/* =========================================
   ANIMATION LOOP
========================================= */

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();


    // Smooth scroll-controlled rotation.

    const smoothing = 1 - Math.pow(
        1 - SCROLL_SMOOTHING,
        delta * 60
    );

    currentRotation += (
        targetRotation - currentRotation
    ) * smoothing;


    // Apply rotation to the model.

    if (modelLoaded) {

        modelPivot.rotation.y = currentRotation;

    }


    // Update manual mouse / touch controls.

    controls.update();


    // Render scene.

    renderer.render(
        scene,
        camera
    );

}

animate();


/* =========================================
   NAVIGATION ACTIVE SECTION
========================================= */

const sections = document.querySelectorAll(
    '.content-column section[id]'
);

const navItems = document.querySelectorAll(
    '.nav-link'
);

const sectionObserver = new IntersectionObserver(

    function (entries) {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const currentId = entry.target.id;

                navItems.forEach(link => {

                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === `#${currentId}`
                    );

                });

            }

        });

    },

    {
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    }

);

sections.forEach(section => {

    sectionObserver.observe(section);

});


/* =========================================
   MOBILE NAVIGATION
========================================= */

menuToggle.addEventListener('click', () => {

    const isOpen = navLinks.classList.toggle('open');

    menuToggle.setAttribute(
        'aria-expanded',
        String(isOpen)
    );

});

navItems.forEach(link => {

    link.addEventListener('click', () => {

        navLinks.classList.remove('open');

        menuToggle.setAttribute(
            'aria-expanded',
            'false'
        );

    });

});


/* =========================================
   INITIALIZE
========================================= */

loadModel();

console.log('Portfolio website initialized.');

