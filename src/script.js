import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { CSG } from 'three-csg-ts';

import woodTexture1 from '../assets/textures/wood_texture_1.jpg';
import woodTexture2 from '../assets/textures/wood_texture_2.jpg';

export default class ThreeJsDraft {
  constructor() {
    // Variables
    this.canvas = document.querySelector('canvas.webgl');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;

    this.boxLength = 10;
    this.boxWidth = 2;
    this.boxStrength = 0.5;

    this.holeDiameter = 0.2;
    this.holeDirectedMode = true;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 12;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(this.devicePixelRatio, 2));
    this.renderer.setClearColor('white');

    // Controls
    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableZoom = false;
    this.orbitControls.enablePan = false;

    // Resize
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.devicePixelRatio = window.devicePixelRatio;

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(this.devicePixelRatio, 2));
    }, false);

    // Loading Manager
    this.loadingManager = new THREE.LoadingManager();

    this.loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
      console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    this.loadingManager.onLoad = function () {
      console.log('Loading complete!');
    };

    this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    this.loadingManager.onError = function (url) {
      console.log('There was an error loading ' + url);
    };

    // Helpers
    this.addHelpers();

    // Objects
    this.addObjects();

    // Raycaster and mouse
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.intersectedObject = null;

    // Mouse events
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.canvas.addEventListener('click', this.onClick.bind(this), false);

    // Animation Loop
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
        });
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

  onMouseMove(event) {
    event.preventDefault();

    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.box);

    if (intersects.length > 0) {
      if (this.intersectedObject != intersects[0].object) {
        this.intersectedObject = intersects[0].object;
        this.canvas.style.cursor = 'pointer'; // Change cursor
      }
    } else {
      this.intersectedObject = null;
      this.canvas.style.cursor = 'auto'; // Default cursor
    }
  }

  onClick(event) {
    event.preventDefault();

    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.box);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      const cylinderGeometry = new THREE.CylinderGeometry(this.holeDiameter * 2, this.holeDiameter * 2, 100, 32);
      const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

      cylinder.position.copy(point);

      if (!this.holeDirectedMode) {
        const direction = new THREE.Vector3();
        direction.subVectors(this.camera.position, cylinder.position).normalize();
  
        // Align the cylinder to the direction vector
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        cylinder.quaternion.premultiply(quaternion);
      } else {
        cylinder.rotation.x = Math.PI / 2;
      }

      cylinder.updateMatrixWorld();

      // Perform CSG subtraction
      const boxCSG = CSG.fromMesh(this.box);
      const cylinderCSG = CSG.fromMesh(cylinder);

      const subtractedCSG = boxCSG.subtract(cylinderCSG);
      const newBox = CSG.toMesh(subtractedCSG, new THREE.Matrix4(), this.box.material);

      // Update the scene
      this.scene.remove(this.box);
      this.box.geometry.dispose();
      this.box = newBox;
      this.scene.add(this.box);

      console.log(this.scene.children.length);
    }
  }

  animate() {
    this.orbitControls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }
}

// Create ThreeJsDraft
const draft = new ThreeJsDraft();

window.changeWoodTexture = function (key) {
  draft.changeWoodTexture(key);
};

window.setWidth = function (event) {
  draft.boxWidth = event.target.value;
  draft.updateBoxGeometry();
};

window.setLength = function (event) {
  draft.boxLength = event.target.value;
  draft.updateBoxGeometry();
};

window.setStrength = function (event) {
  draft.boxStrength = event.target.value;
  draft.updateBoxGeometry();
};

window.setHoleDiameter = function (event) {
  draft.holeDiameter = event.target.value;
}

window.toggleHoleDirectedMode = function (event) {
  draft.holeDirectedMode = event.target.checked;
}


