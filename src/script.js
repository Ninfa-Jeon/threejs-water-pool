import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import waterVertexShader from "./shaders/water/vertex.glsl";
import waterFragmentShader from "./shaders/water/fragment.glsl";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const gltfLoader = new GLTFLoader();
let model, model2;
gltfLoader.load("/models/lily_flower/scene.gltf", (gltf) => {
  model = gltf.scene.children[0];
  model.position.set(5, -0.08, 2);
  model.castShadow = true;
  scene.add(model);
  model2 = model.clone();
  model2.scale.set(0.75, 0.75, 0.75);
  model2.position.set(3.0, -0.08, 1.8);
  model2.castShadow = true;
  scene.add(model2);
});

/**
 * Border
 */
var boxGeometry = new THREE.BoxGeometry(15, 1, 1);
var boxMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

var box1 = new THREE.Mesh(boxGeometry, boxMaterial);
box1.position.z = 7;
box1.castShadow = true;
scene.add(box1);

var box2 = new THREE.Mesh(boxGeometry, boxMaterial);
box2.position.z = -7;
scene.add(box2);

var box3 = new THREE.Mesh(boxGeometry, boxMaterial);
box3.position.x = -7;
box3.rotation.y = Math.PI * 0.5;
scene.add(box3);

var box4 = new THREE.Mesh(boxGeometry, boxMaterial);
box4.position.x = 7;
box4.rotation.y = Math.PI * 0.5;
scene.add(box4);

gui.addColor(boxMaterial, "color").name("box");

/**
 * Container base
 */

//Container color
const containerColorObject = {};
containerColorObject.depthColor = "#ffffff";
containerColorObject.surfaceColor = "#5a8c8b";

const baseGeometry = new THREE.PlaneGeometry(15, 15, 512, 512);
const baseMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib["lights"],
    THREE.UniformsLib["shadowmap"],
    {
      opacity: { type: "f", value: 1.0 },

      lightIntensity: { type: "f", value: 1.0 },

      uTime: { value: 0.0 },

      uSmallWavesElevation: { value: 0.1 },
      uSmallWavesFrequency: { value: 3.0 },
      uSmallWavesSpeed: { value: 0.2 },
      uSmallWavesIterations: { value: 4.0 },

      uDepthColor: { value: new THREE.Color(containerColorObject.depthColor) },
      uSurfaceColor: {
        value: new THREE.Color(containerColorObject.surfaceColor),
      },
      uColorOffset: { value: 0.3 },
      uColorMultiplier: { value: 5 },
    },
  ]),
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  lights: true,
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.receiveShadow = true;
base.rotation.x = -Math.PI * 0.5;
base.position.set(0, -0.5, 0);
scene.add(base);

gui
  .addColor(containerColorObject, "depthColor")
  .onChange(() => {
    baseMaterial.uniforms.uDepthColor.value.set(
      containerColorObject.depthColor
    );
  })
  .name("baseDepthColor");
gui
  .addColor(containerColorObject, "surfaceColor")
  .onChange(() => {
    baseMaterial.uniforms.uSurfaceColor.value.set(
      containerColorObject.surfaceColor
    );
  })
  .name("baseSurfaceColor");

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(13, 13, 512, 512);

//Water Color
const waterColorObject = {};
waterColorObject.depthColor = "#a8e1ff";
waterColorObject.surfaceColor = "#48577a";

// Material
const waterMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib["shadowmap"],
    THREE.UniformsLib["lights"],
    {
      opacity: { type: "f", value: 0.2 },

      lightIntensity: { type: "f", value: 1.0 },

      uTime: { value: 0.0 },

      uSmallWavesElevation: { value: 0.1 },
      uSmallWavesFrequency: { value: 3.0 },
      uSmallWavesSpeed: { value: 0.2 },
      uSmallWavesIterations: { value: 4.0 },

      uDepthColor: { value: new THREE.Color(waterColorObject.depthColor) },
      uSurfaceColor: { value: new THREE.Color(waterColorObject.surfaceColor) },
      uColorOffset: { value: 0.3 },
      uColorMultiplier: { value: 5 },
    },
  ]),
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  lights: true,
  transparent: true,
});

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
water.receiveShadow = true;
water.castShadow = true;
scene.add(water);

gui.addColor(waterColorObject, "depthColor").onChange(() => {
  waterMaterial.uniforms.uDepthColor.value.set(waterColorObject.depthColor);
});
gui.addColor(waterColorObject, "surfaceColor").onChange(() => {
  waterMaterial.uniforms.uSurfaceColor.value.set(waterColorObject.surfaceColor);
});

/**
 * Lights
 */
//Point light
const light = new THREE.PointLight(0xffffff, 1);
// We want it to be very close to our character
light.position.set(0.0, 12, 0.0);
light.castShadow = true;
scene.add(light);

//Direction light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(2, 7, 0);
dirLight.castShadow = true;
scene.add(dirLight);

gui.addColor(dirLight, "color").name("dirLight");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  50
);
camera.position.set(0, 5, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 0.3;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI / 2 - 0.5;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  //Update water
  waterMaterial.uniforms.uTime.value = elapsedTime;

  //Update shadow
  baseMaterial.uniforms.uTime.value = elapsedTime;

  //Update model
  if (model) {
    model.position.y = Math.cos(elapsedTime) * 0.08 - 0.1;
    model.position.z = 2.0 - Math.sin(elapsedTime) * 0.25;
  }
  if (model2) {
    model2.position.y = Math.sin(elapsedTime) * 0.09 - 0.15;
    model2.position.z = 1.8 - Math.cos(elapsedTime) * 0.2;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
