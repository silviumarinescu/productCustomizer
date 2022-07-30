import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const productViewer = {
  container: null,
  image: null,
  imageTexture: null,
  model: null,
  orbitControls: null,
  renderer: null,
  camera: null,
  scene: null,
  lights: [],
  loadObject: async function (path) {
    return new Promise((a) => {
      const loader = new GLTFLoader();
      loader.load(path, (gltf) => {
        a(gltf);
      });
    });
  },
  setBackground: function () {
    // const path =
    //   "https://threejs.org/examples/textures/cube/SwedishRoyalCastle/";
    // const format = ".jpg";
    // const urls = [
    //   path + "px" + format,
    //   path + "nx" + format,
    //   path + "py" + format,
    //   path + "ny" + format,
    //   path + "pz" + format,
    //   path + "nz" + format,
    // ];
    // const reflectionCube = new THREE.CubeTextureLoader().load(urls);
    // reflectionCube.mapping = THREE.CubeRefractionMapping;
    // this.scene.background = reflectionCube;
    this.scene.background = new THREE.Color("#367588");
  },
  init: async function ({ container, image, product }) {
    this.container = container;
    this.image = image;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();

    this.scene.add(this.camera);

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

    this.setBackground();

    this.container.appendChild(this.renderer.domElement);

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.addEventListener("change", () => {
      this.renderer.render(this.scene, this.camera);
    });

    await this.setModel(product);

    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
  },
  onWindowResize: function () {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.render(this.scene, this.camera);
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
      texture.flipY = true;
    });
  },
  setModel: async function (model) {
    if (this.model) this.scene.remove(this.model);
    this.model = (await this.loadObject(model)).scene;
    const box = new THREE.Box3().setFromObject(this.model);
    const sz = box.getSize(new THREE.Vector3());
    const size = sz.length();
    const center = box.getCenter(new THREE.Vector3());

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
      1
    ).texture;

    this.model.position.x = center.x * -1;
    this.model.position.z = center.z * -1;
    this.model.position.y = sz.y / 2 - center.y;
    this.orbitControls.maxDistance = size * 2;
    this.orbitControls.minDistance = size / 2;
    // this.orbitControls.enableZoom = false;
    this.orbitControls.enablePan = false;
    this.orbitControls.minPolarAngle = Math.PI / 4;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.camera.position.copy(center);
    this.camera.position.y += size / 2 + this.camera.position.y;
    this.orbitControls.target = new THREE.Vector3(center.x, sz.y / 2, center.z);
    this.camera.updateProjectionMatrix();
    await this.setImage(this.image);
    this.scene.add(this.model);
    this.onWindowResize();
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  },
  setImage: async function (image) {
    this.image = image;
    this.imageTexture = await this.convertImageToTexture(this.image);
    this.model.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === "Mug_Porcelain_PBR001_0")
        obj.material.map = this.imageTexture;
    });
    this.renderer.render(this.scene, this.camera);
  },
};

export default productViewer;
