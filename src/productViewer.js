import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

var camera;
var scene;

const loader = new GLTFLoader();

const productViewer = {
  container: null,
  image: null,
  imageTexture: null,
  model: null,
  orbitControls: null,
  renderer: null,
  loadObject: async function (path) {
    return new Promise((a) => {
      loader.load(path, (gltf) => {
        a(gltf);
      });
    });
  },
  init: async function ({ container, image, product }) {
    this.container = container;
    this.image = image;
    this.product = product;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      50,
      this.container.clientWidth / this.container.clientHeight,
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

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure = 0.7;

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    const path =
      "https://threejs.org/examples/textures/cube/SwedishRoyalCastle/";
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

    this.container.appendChild(this.renderer.domElement);

    this.orbitControls = new OrbitControls(camera, this.renderer.domElement);

    this.orbitControls.addEventListener("change", () => {
      this.renderer.render(scene, camera);
    });

    this.model = (await this.loadObject(this.product)).scene;
    const box = new THREE.Box3().setFromObject(this.model);
    const sz = box.getSize(new THREE.Vector3());
    const size = sz.length();
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.x = center.x * -1;
    this.model.position.z = center.z * -1;
    this.model.position.y = sz.y / 2 - center.y;
    this.orbitControls.maxDistance = size * 5;
    this.orbitControls.minDistance = size / 2;
    this.orbitControls.enableZoom = false;
    this.orbitControls.enablePan = false;
    this.orbitControls.minPolarAngle = Math.PI / 4;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    camera.position.copy(center);
    camera.position.y += size / 2 + camera.position.y;
    this.orbitControls.target = new THREE.Vector3(center.x, sz.y / 2, center.z);
    camera.updateProjectionMatrix();
    await this.setImage(this.image);
    scene.add(this.model);
    this.onWindowResize();
    this.orbitControls.update();
    this.renderer.render(scene, camera);
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
  },
  onWindowResize: function () {
    camera.aspect = this.container.clientWidth / this.container.clientHeight;
    camera.updateProjectionMatrix();

    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  },
  convertImageToTexture: function (image) {
    return new Promise((a) => {
      let texture = null;
      const manager = new THREE.LoadingManager(() => {
        a(texture);
      });
      const textureLoader = new THREE.TextureLoader(manager);
      texture = textureLoader.load(image);
      texture.encoding = THREE.sRGBEncoding;
      texture.flipY = false;
    });
  },
  setImage: async function (image) {
    this.image = image;
    this.imageTexture = await this.convertImageToTexture(this.image);

    this.model.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === "Mug_Porcelain_PBR001_0")
        obj.material.map = this.imageTexture;
    });
    this.renderer.render(scene, camera);
  },
};

export default productViewer;
