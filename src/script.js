import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module'

import woodTexture1 from '../assets/textures/wood_texture_1.jpg'
import woodTexture2 from '../assets/textures/wood_texture_2.jpg'


export default class ThreeJsDraft {
  constructor() {
    /**
     * Variables
     */
    this.canvas = document.querySelector('canvas.webgl');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;

    this.boxLength = 10;
    this.boxWidth = 2;
    this.boxStrength = 0.5;

    /**
     * Scene
     */
    this.scene = new THREE.Scene();

    /**
     * Camera
     */
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 15;

    /**
     * Renderer
     */
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(this.devicePixelRatio, 2));
    this.renderer.setClearColor('white');

    /**
     * Controls
     */
    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableZoom = false;
    this.orbitControls.enablePan = false;

    /**
     * Resize
     */
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.devicePixelRatio = window.devicePixelRatio;

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(this.devicePixelRatio, 2));
    }, false)

    /**
     * Loading Manager
     */
    this.loadingManager = new THREE.LoadingManager()

    this.loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
      console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    }

    this.loadingManager.onLoad = function () {
      console.log('Loading complete!')
    }

    this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    }

    this.loadingManager.onError = function (url) {
      console.log('There was an error loading ' + url);
    }

    /**
     * Helpers
     */
    this.addHelpers();

    /**
     * Objects
     */
    this.addObjects();

    /**
     * Animation Loop
     */
    this.animate();
  }

  addHelpers() {
    const axisHelper = new THREE.AxesHelper(3);
    this.scene.add(axisHelper);

    this.stats = Stats();
    document.body.appendChild(this.stats.dom);
  }

  addObjects() {
    const texture = new THREE.TextureLoader().load(woodTexture1);

    const boxGeometry = new THREE.BoxGeometry(this.boxWidth, this.boxLength, this.boxStrength);
    const boxMaterial = new THREE.MeshBasicMaterial({ map: texture });

    this.box = new THREE.Mesh(boxGeometry, boxMaterial);

    this.scene.add(this.box);
  }

  changeWoodTexture(key) {
    switch (key) {
      case '1':
        new THREE.TextureLoader().load(woodTexture1, (texture) => {
          this.box.material.map = texture;
        })
        break;
      case '2':
        new THREE.TextureLoader().load(woodTexture2, (texture) => {
          this.box.material.map = texture;
        });
        break;
      default:
        break;
    }
  }

  updateBoxGeometry() {
    this.box.geometry = new THREE.BoxGeometry(this.boxWidth, this.boxLength, this.boxStrength);
  }

  animate() {
    this.orbitControls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }
}

/**
 * Create ThreeJsDraft
 */
// eslint-disable-next-line no-new
const draft = new ThreeJsDraft();

window.changeWoodTexture = function (key) {
  draft.changeWoodTexture(key);
}

window.setWidth = function (event) {
  draft.boxWidth = event.target.value;
  draft.updateBoxGeometry();
}

window.setLength = function (event) {
  draft.boxLength = event.target.value;
  draft.updateBoxGeometry();
}

window.setStrength = function (event) {
  draft.boxStrength = event.target.value;
  draft.updateBoxGeometry();
}


