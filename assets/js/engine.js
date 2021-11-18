import * as THREE from "three";
import Stats from "stats.js";
import { nanoid } from "nanoid";
import Loop from "raf-loop";

class MainEngine {
  constructor(debug = false, zoom = 1) {
    this.debug = debug;
    this.zoom = zoom;

    this._renderCb = [];
    this.meshes = [];

    // RAF Loop
    this.engine = new Loop(this.update.bind(this));

    if (this.debug) {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    }
  }

  setup(canvas, initialWidth, initialHeight) {
    // Underlying canvas element
    this.el = canvas;

    if (this.debug) {
      document.body.appendChild(this.stats.dom);
    }

    this.width = initialWidth;
    this.height = initialHeight;

    this._threeSetup();

    this.resize(initialWidth, initialHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  _threeSetup() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.el,
      alpha: true,
      antialias: true,
    });

    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._setupCamera();
  }

  _setupCamera() {
    this.camera = new THREE.OrthographicCamera(
      0,
      this.width,
      0,
      this.height,
      -1000,
      1000
    );

    // this.camera.zoom = 1;
    this.camera.zoom = this.zoom;
  }

  start() {
    this.engine.start();
  }

  resize(width, height) {
    this.camera.right = width;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);

    this.width = width;
    this.height = height;

    this.renderer.render(this.scene, this.camera);
  }

  /**
   *
   */
  update() {
    // this._updatePhysics();
    this._render();
  }

  /**
   * Register a function to be ran on the render loop
   *
   * @param {function} cb
   */
  render(cb = () => false) {
    const id = nanoid();

    this._renderCb.push({
      id,
      cb,
    });

    return () => this.removeRender(id);
  }

  removeRender(id) {
    const idx = this._renderCb.findIndex((item) => item.id === id);

    this._renderCb.splice(idx, 1);
  }

  _render() {
    if (this.debug) this.stats.begin();
    this._renderCb.forEach((item) => item.cb());
    this.renderer.render(this.scene, this.camera);
    if (this.debug) this.stats.end();
  }

  move(obj, xPerc, yPerc) {
    obj.position.set(this.width * xPerc, this.height * yPerc, 0);
  }

  addObject(obj) {
    this.group.add(obj);
  }

  removeObject(obj) {
    this.group.remove(obj);
  }

  destroy() {
    this.engine.stop();
    this.renderer.dispose();

    const cleanMaterial = (material) => {
      material.dispose();

      // dispose textures
      for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === "object" && "minFilter" in value) {
          value.dispose();
        }
      }
    };

    this.scene.traverse((object) => {
      if (!object.isMesh) return;

      object.geometry.dispose();

      if (object.material.isMaterial) {
        cleanMaterial(object.material);
      } else {
        // an array of materials
        for (const material of object.material) cleanMaterial(material);
      }
    });
  }

  scale(num) {
    this.group.scale.set(num, num, num);
  }
}

export { MainEngine };
