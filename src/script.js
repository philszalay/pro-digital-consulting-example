import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { CSG } from 'three-csg-ts';

import woodTexture1 from '../assets/textures/wood_texture_1.jpg';
import woodTexture1Normal from '../assets/textures/wood_texture_1_normal_dx.jpg';
import woodTexture1Roughness from '../assets/textures/wood_texture_1_roughness.jpg';

import woodTexture2 from '../assets/textures/wood_texture_2.jpg';
import woodTexture2Normal from '../assets/textures/wood_texture_2_normal_dx.jpg';
import woodTexture2Roughness from '../assets/textures/wood_texture_2_roughness.jpg';

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

    this.box;
    this.texture;
    this.normalMap;
    this.roughnessMap;

    this.isMouseDown = false;
    this.isDragging = false;

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
    this.orbitControls.enablePan = false;
    this.orbitControls.maxDistance = 17;
    this.orbitControls.minDistance = 3;

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

    this.textureLoader = new THREE.TextureLoader(this.loadingManager);

    // Helpers
    this.addHelpers();

    // Textures
    this.initTextures('1').then(() => {
      // Objects
      this.addObjects();
    });

    // Raycaster and mouse
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.intersectedObject = null;

    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);

    // Animation Loop
    this.animate();
  }

  addHelpers() {
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);
  }

  async initTextures(key) {
    switch (key) {
      case '1':
        await this.loadTextures(woodTexture1, woodTexture1Normal, woodTexture1Roughness);
        break;
      case '2':
        await this.loadTextures(woodTexture2, woodTexture2Normal, woodTexture2Roughness);
        break;
      default:
        await this.loadTextures(woodTexture1, woodTexture1Normal, woodTexture1Roughness);
        break;
    }
  }

  loadTexture(url) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, resolve, undefined, reject);
    });
  }

  async loadTextures(texturePath, normalMapPath, roughnessMapPath) {
    try {
      const [texture, normalMap, roughnessMap] = await Promise.all([
        this.loadTexture(texturePath),
        this.loadTexture(normalMapPath),
        this.loadTexture(roughnessMapPath)
      ]);

      this.texture = texture;
      this.normalMap = normalMap;
      this.roughnessMap = roughnessMap;
    } catch (error) {
      console.error('An error occurred while loading textures:', error);
    }
  }

  updateBoxMaterial() {
    this.box.material.map = this.texture;
    this.box.material.normalMap = this.normalMap;
    this.box.material.roughnessMap = this.roughnessMap;
    this.box.material.needsUpdate = true;
  }

  addObjects() {
    const boxGeometry = new THREE.BoxGeometry(this.boxWidth, this.boxLength, this.boxStrength, 32, 32, 32);
    const boxMaterial = new THREE.MeshStandardMaterial({
      map: this.texture,
      normalMap: this.normalMap,
      roughnessMap: this.roughnessMap
    });

    this.box = new THREE.Mesh(boxGeometry, boxMaterial);

    const pointLight1 = new THREE.PointLight(0xffffff, 1, 100)
    const pointLight2 = new THREE.PointLight(0xffffff, 0.7, 100)
    const pointLight3 = new THREE.PointLight(0xffffff, 0.5, 100)
    const pointLight4 = new THREE.PointLight(0xffffff, 0.5, 100)

    pointLight1.position.set(5, 5, 5);
    pointLight2.position.set(-3, -1, -5);
    pointLight3.position.set(1, 10, -5);
    pointLight4.position.set(-2, -10, 3);

    this.scene.add(this.box, pointLight1, pointLight2, pointLight3, pointLight4);
  }

  updateBoxGeometry() {
    this.box.geometry = new THREE.BoxGeometry(this.boxWidth, this.boxLength, this.boxStrength);
  }

  onMouseMove(event) {
    if (!this.box) {
      return;
    }

    event.preventDefault();

    if (this.isMouseDown) {
      this.isDragging = true;
    }

    this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.box);

    if (intersects.length > 0) {
      if (this.intersectedObject != intersects[0].object) {
        this.intersectedObject = intersects[0].object;
        this.canvas.style.cursor = 'pointer';
      }
    } else {
      this.intersectedObject = null;
      this.canvas.style.cursor = 'auto';
    }
  }

  onMouseDown() {
    this.isMouseDown = true;
    this.isDragging = false;
  }

  onMouseUp(event) {
    this.isMouseDown = false;

    if (!this.isDragging) {
      this.onClick(event);
    }

    this.isDragging = false;
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
    }
  }

  animate() {
    this.orbitControls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }
}

const draft = new ThreeJsDraft();

window.changeWoodTexture = async function (key) {
  await draft.initTextures(key);
  draft.updateBoxMaterial();
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


