import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";

// === SCENE SETUP ===
const scene = new THREE.Scene();

// === RENDERER ===
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// === CAMERA ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3.347, 99, -345);

// === ORBIT CONTROLS ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

// === CLOCK ===
const clock = new THREE.Clock();
let mixer = null;

// === HDRI ENVIRONMENT ===
new RGBELoader().load("/hdris/dresden_station_night_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// === LIGHTING ===
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(3, 3, 3);
dirLight.castShadow = true;
scene.add(dirLight);

// === GUI SETUP ===
const gui = new GUI();

// --- CAMERA POSITION ---
const cameraFolder = gui.addFolder("Camera Position");
const cameraPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
cameraFolder.add(cameraPos, "x", -200, 200).onChange((val) => camera.position.x = val);
cameraFolder.add(cameraPos, "y", -200, 200).onChange((val) => camera.position.y = val);
cameraFolder.add(cameraPos, "z", -200, 200).onChange((val) => camera.position.z = val);
cameraFolder.open();

// --- ORBIT TARGET ---
const targetFolder = gui.addFolder("Orbit Target");
const orbitTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
targetFolder.add(orbitTarget, "x", -10, 10).onChange((val) => controls.target.x = val);
targetFolder.add(orbitTarget, "y", -10, 10).onChange((val) => controls.target.y = val);
targetFolder.add(orbitTarget, "z", -10, 10).onChange((val) => controls.target.z = val);
targetFolder.open();

// === MODEL LOADING ===
const loader = new GLTFLoader();
loader.load(
  "/models/2016_lamborghini_aventador_lp_750-4_sv.glb",
  (gltf) => {
    const model = gltf.scene;
    model.position.set(-110,0,0);
    model.scale.set(1, 1, 1);
    model.rotation.set(0, -0.2, 0);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });

    scene.add(model);

    // === MODEL GUI ===
    const modelFolder = gui.addFolder("Model Controls");

    // Position
    modelFolder.add(model.position, "x", -100, 100);
    modelFolder.add(model.position, "y", -100, 100);
    modelFolder.add(model.position, "z", -100, 100);

    // Rotation
    modelFolder.add(model.rotation, "x", - Math.PI * 2, Math.PI * 2);
    modelFolder.add(model.rotation, "y", - Math.PI * 2, Math.PI * 2);
    modelFolder.add(model.rotation, "z", - Math.PI * 2, Math.PI * 2);

    // Scale
    modelFolder.add(model.scale, "x", 0.1, 3);
    modelFolder.add(model.scale, "y", 0.1, 3);
    modelFolder.add(model.scale, "z", 0.1, 3);

    modelFolder.open();
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);

// === ANIMATION LOOP ===
function animate() {
  requestAnimationFrame(animate);

  // Update GUI bindings live from OrbitControls
  cameraPos.x = camera.position.x;
  cameraPos.y = camera.position.y;
  cameraPos.z = camera.position.z;
  orbitTarget.x = controls.target.x;
  orbitTarget.y = controls.target.y;
  orbitTarget.z = controls.target.z;

  // Update GUI display
  gui.controllersRecursive().forEach((controller) => controller.updateDisplay());

  controls.update();
  renderer.render(scene, camera);
}
animate();

// === HANDLE RESIZE ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
