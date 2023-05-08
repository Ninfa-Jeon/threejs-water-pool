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
scene.fog = new THREE.Fog("#5a5faf", 0, 8.6);

gui.add(scene.fog, "near").min(0).max(30).step(0.1).name("fogNear");
gui.add(scene.fog, "far").min(0).max(30).step(0.1).name("fogFar");
gui.addColor(scene.fog, "color").name("fog");

/**
 * Models
 */
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  '/models/lily_flower/scene.gltf',
  (gltf)=>{
    const model = gltf.scene.children[0];
    model.position.set(5,-0.08,2);
    model.castShadow = true;
    scene.add(model)
  },
)

/**
 * Sky
 */
const skyGeometry = new THREE.SphereGeometry(50, 25, 25);
const material = new THREE.MeshPhongMaterial();
const sky = new THREE.Mesh(skyGeometry, material);
sky.material.side = THREE.BackSide;
scene.add(sky);

/**
 * Container base
 */

//Container color
const containerColorObject = {};
containerColorObject.depthColor = "#ffffff";
containerColorObject.surfaceColor = "#6a9594";
//"#92956a";
//"#8d687a",

const baseGeometry = new THREE.PlaneGeometry(16, 10, 512, 512);
const baseMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib["lights"],
    THREE.UniformsLib["shadowmap"],
    {
      topColor: { type: "c", value: new THREE.Color(0x0077ff) },
      bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
      offset: { type: "f", value: 33 },
      exponent: { type: "f", value: 0.6 },
      fogColor: { type: "c", value: scene.fog.color },
      fogNear: { type: "f", value: scene.fog.near },
      fogFar: { type: "f", value: scene.fog.far },

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
  fog: true,
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
const waterGeometry = new THREE.PlaneGeometry(12, 10, 512, 512);

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
      topColor: { type: "c", value: new THREE.Color(0x0077ff) },
      bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
      offset: { type: "f", value: 33 },
      exponent: { type: "f", value: 0.6 },
      fogColor: { type: "c", value: scene.fog.color },
      fogNear: { type: "f", value: scene.fog.near },
      fogFar: { type: "f", value: scene.fog.far },

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
  fog: true,
  lights: true,
  //blending: THREE.AdditiveBlending,
  transparent: true,
});

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
water.receiveShadow = true;
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
light.position.set(0.0, 10, 0);
light.castShadow = true;
scene.add(light);

//Direction light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
// We want it to be very close to our character
dirLight.position.set(2, 3, 0);
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
controls.minDistance = 0.7;
controls.maxDistance = 2;
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

  //Update water shadow
  baseMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
