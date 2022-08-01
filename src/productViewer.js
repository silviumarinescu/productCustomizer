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
  foregrownd: null,
  setForegrownd: async function () {
    if (!this.foregrownd) {
      let texture = await this.convertImageToTexture("/fg.png");
      let material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      let plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      this.foregrownd = plane;
      this.scene.add(this.foregrownd);
    }

    //   const box = new THREE.Box3().setFromObject(this.model);
    // const sz = box.getSize(new THREE.Vector3());
    // const size = sz.length();
    // const center = box.getCenter(new THREE.Vector3());
    console.log(this.camera.position)
    if (this.size) {
      this.foregrownd.rotation.x = this.camera.rotation.x;
      this.foregrownd.rotation.y = this.camera.rotation.y;
      this.foregrownd.rotation.z = this.camera.rotation.z;

      this.foregrownd.position.x = this.camera.position.x;
      this.foregrownd.position.y = this.camera.position.y;
      this.foregrownd.position.z = this.size;
    }
  },
  hasBg: false,
  setBackground: async function () {
    var windowSize = function (withScrollBar) {
      var wid = 0;
      var hei = 0;
      if (typeof window.innerWidth != "undefined") {
        wid = window.innerWidth;
        hei = window.innerHeight;
      } else {
        if (document.documentElement.clientWidth == 0) {
          wid = document.body.clientWidth;
          hei = document.body.clientHeight;
        } else {
          wid = document.documentElement.clientWidth;
          hei = document.documentElement.clientHeight;
        }
      }
      return {
        width: wid - (withScrollBar ? wid - document.body.offsetWidth + 1 : 0),
        height: hei,
      };
    };

    this.scene.background = await this.convertImageToTexture("/bg.jpg");
    let backgroundImageWidth = 1920;
    let backgroundImageHeight = 1200;
    var size = windowSize(true);
    var factor =
      backgroundImageWidth / backgroundImageHeight / (size.width / size.height);

    this.scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
    this.scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;

    this.scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
    this.scene.background.repeat.y = factor > 1 ? 1 : factor;

    if (this.scene.background) {
      var size = windowSize(true);
      var factor =
        backgroundImageWidth /
        backgroundImageHeight /
        (size.width / size.height);
      this.scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
      this.scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
      this.scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
      this.scene.background.repeat.y = factor > 1 ? 1 : factor;
    }
    if (!this.hasBg) this.hasBg = true;
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

    await this.setBackground();
    await this.setForegrownd();

    this.container.appendChild(this.renderer.domElement);

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.addEventListener("change", async () => {
      await this.setForegrownd();
      this.renderer.render(this.scene, this.camera);
    });

    await this.setModel(product);

    window.addEventListener("resize", async () => {
      await this.onWindowResize();
    });
  },
  onWindowResize: async function () {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    if (this.hasBg) await this.setBackground();
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
  size: null,
  setModel: async function (model) {
    if (this.model) this.scene.remove(this.model);
    this.model = (await this.loadObject(model)).scene;
    const box = new THREE.Box3().setFromObject(this.model);
    const sz = box.getSize(new THREE.Vector3());
    this.size = sz.length();
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
    this.orbitControls.maxDistance = this.size * 2;
    this.orbitControls.minDistance = this.size;
    // this.orbitControls.enableZoom = false;
    this.orbitControls.enablePan = false;
    this.orbitControls.minPolarAngle = Math.PI / 4;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.camera.position.copy(center);
    this.camera.position.y += this.size + this.camera.position.y;
    this.orbitControls.target = new THREE.Vector3(center.x, sz.y / 2, center.z);
    this.camera.updateProjectionMatrix();
    await this.setImage(this.image);
    this.scene.add(this.model);
    await this.onWindowResize();
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  },
  setImage: async function (image) {
    this.image = image;
    this.imageTexture = await this.convertImageToTexture(this.image);
    this.model.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === "art_surface")
        obj.material.map = this.imageTexture;
    });
    this.renderer.render(this.scene, this.camera);
  },
};

export default productViewer;
