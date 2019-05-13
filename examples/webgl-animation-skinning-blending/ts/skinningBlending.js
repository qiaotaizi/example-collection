"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let scene, renderer, camera;
let model, skeleton, mixer, clock;
init();
animate();
function init() {
    camera = new three_1.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(1, 2, -3);
    camera.lookAt(0, 1, 0);
    clock = new three_1.Clock();
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xa0a0a0);
    scene.fog = new three_1.Fog(0xa0a0a0, 10, 50);
    // TODO api
    let hemiLight = new three_1.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(-3, 10, -10);
    scene.add(hemiLight);
    let dirLight = new three_1.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);
    let groundMesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(100, 100), new three_1.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    groundMesh.rotation.x = -Math.PI * 0.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
}
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
//# sourceMappingURL=skinningBlending.js.map