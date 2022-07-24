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
    20,
    container.offsetWidth / container.offsetHeight,
    1e-5,
    1e10
  );

  scene.add(camera);

  // const hemispheric = new THREE.HemisphereLight();
  // scene.add(hemispheric);

  const light1 = new THREE.AmbientLight(0xffffff, 0.3);
  light1.name = "ambient_light";
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);
  light2.position.set(0.5, 0, 0.866); // ~60º
  light2.name = "main_light";
  scene.add(light2);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  // renderer.setClearColor(0xffffff);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // renderer.physicallyCorrectLights = true;
  renderer.toneMappingExposure = 0.7;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // scene.background = new THREE.Color(0xf0f0f0);
  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;

  container.appendChild(renderer.domElement);

  const loader = new GLTFLoader();

  orbitControls = new OrbitControls(camera, renderer.domElement);

  loader.load(Mug, (gltf) => {
    const object = gltf.scene;
    // const pmremGenerator = new THREE.PMREMGenerator(renderer);
    // pmremGenerator.compileEquirectangularShader();
    // object.updateMatrixWorld();
    // const boundingBox = new THREE.Box3().setFromObject(object);
    // const modelSizeVec3 = new THREE.Vector3();
    // boundingBox.getSize(modelSizeVec3);
    // const modelSize = modelSizeVec3.length();
    // const modelCenter = new THREE.Vector3();
    // boundingBox.getCenter(modelCenter);

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    object.position.x = 0;
    object.position.y = 0;
    object.position.z = 0;

    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;

    camera.near = size / 100;
    camera.far = size * 100;
    camera.updateProjectionMatrix();

    camera.position.copy(center);
    camera.position.x += size;
    camera.position.y += size;
    camera.position.z += size;
    camera.lookAt(center);

    // orbitControls.reset();
    orbitControls.maxDistance = size * 50;
    // orbitControls.enableDamping = true;
    // orbitControls.dampingFactor = 0.07;
    // orbitControls.rotateSpeed = 1.25;
    // orbitControls.panSpeed = 1.25;
    // orbitControls.screenSpacePanning = true;
    // orbitControls.autoRotate = true;

    // camera.position.copy(modelCenter);
    // camera.position.x += modelSize * cameraPos.x;
    // camera.position.y += modelSize * cameraPos.y;
    // camera.position.z += modelSize * cameraPos.z;
    // camera.near = modelSize / 100;
    // camera.far = modelSize * 100;
    // camera.updateProjectionMatrix();
    // camera.lookAt(modelCenter);

    object.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === "Mug_Porcelain_PBR001_0") {
        material = obj.material;
        mesh = obj;

        material.map = convertImageToTexture(Image3);
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
    callback();
  });
};

const onWindowResize = () => {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const convertImageToTexture = (image) => {
  const textureLoader = new THREE.TextureLoader();
  let texture = textureLoader.load(image);
  texture.encoding = THREE.sRGBEncoding;
  texture.flipY = false;
  // texture.repeat.x = 1;
  // console.log("offset", texture.offset);
  // console.log("wrapS", texture.wrapS);
  // console.log("wrapT", texture.wrapT);

  return texture;
};

init(() => {
  const animate = () => {
    requestAnimationFrame(() => {
      orbitControls.update();
      renderer.render(scene, camera);
      animate();
    });
  };

  animate();
});
