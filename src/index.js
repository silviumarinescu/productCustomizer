import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const Mug = "/assets/model1.gltf";
const Image1 = "/assets/model1_img0.jpg";
const Image2 = "/assets/model2_img0.jpg";
const Image3 = "/assets/model3_img0.jpg";
const Image4 = "/assets/model4_img0.jpg";

var container = document.querySelector(".container");
var camera;
var scene;
var renderer;
var orbitControls;
var mesh;
var material;

const init = (callback) => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );
  camera.position.z = 2000;

  scene.add(camera);

  const light1 = new THREE.AmbientLight(0xffffff, 0.3);
  light1.name = "ambient_light";
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);
  light2.position.set(0.5, 0, 0.866);
  light2.name = "main_light";
  scene.add(light2);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 0.7;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  const path = "https://threejs.org/examples/textures/cube/SwedishRoyalCastle/";
  const format = ".jpg";
  const urls = [
    path + "px" + format,
    path + "nx" + format,
    path + "py" + format,
    path + "ny" + format,
    path + "pz" + format,
    path + "nz" + format,
  ];
  const reflectionCube = new THREE.CubeTextureLoader().load(urls);
  reflectionCube.mapping = THREE.CubeRefractionMapping;
  scene.background = reflectionCube;

  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;

  container.appendChild(renderer.domElement);

  const loader = new GLTFLoader();

  orbitControls = new OrbitControls(camera, renderer.domElement);

  orbitControls.addEventListener("change", () => {
    renderer.render(scene, camera);
  });

  loader.load(Mug, async (gltf) => {
    const object = gltf.scene;
    const box = new THREE.Box3().setFromObject(object);
    const sz = box.getSize(new THREE.Vector3());
    const size = sz.length();

    const center = box.getCenter(new THREE.Vector3());

    object.position.x = center.x * -1;
    object.position.z = center.z * -1;
    object.position.y = sz.y / 2 - center.y;

    orbitControls.maxDistance = size * 5;
    orbitControls.minDistance = size / 2;
    orbitControls.enableZoom = false;
    orbitControls.enablePan = false;
    orbitControls.minPolarAngle = Math.PI / 4;
    orbitControls.maxPolarAngle = Math.PI / 2;

    camera.position.copy(center);
    camera.position.y += size / 2 + camera.position.y;
    orbitControls.target = new THREE.Vector3(center.x, sz.y / 2, center.z);

    camera.updateProjectionMatrix();

    let imageTexture = await convertImageToTexture(Image3);
    object.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === "Mug_Porcelain_PBR001_0") {
        material = obj.material;
        mesh = obj;

        material.map = imageTexture;
      } else if (
        obj instanceof THREE.Mesh &&
        obj.name === "Mug_Porcelain_PBR002_0"
      ) {
        const material = obj.material;
        material.color.set("#ffffff");

        obj.material.depthWrite = !obj.material.transparent;
      }
    });

    scene.add(object);

    onWindowResize();
    orbitControls.update();
    renderer.render(scene, camera);
    if (callback) callback();
  });
};

const onWindowResize = () => {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const convertImageToTexture = (image) =>
  new Promise((a) => {
    let texture = null;

    var onLoad = function () {
      a(texture);
    };

    var manager = new THREE.LoadingManager(onLoad);

    const textureLoader = new THREE.TextureLoader(manager);
    texture = textureLoader.load(image);
    texture.encoding = THREE.sRGBEncoding;
    texture.flipY = false;
  });

init();
