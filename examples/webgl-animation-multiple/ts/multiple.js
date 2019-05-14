"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let scene, camera, renderer;
let clock, mixers;
init();
animate();
function init() {
    camera = new three_1.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(3, 6, -10);
    camera.lookAt(0, 1, 0);
    clock = new three_1.Clock();
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xa0a0a0);
    scene.fog = new three_1.Fog(0xa0a0a0, 10, 22);
    let hemiLight = new three_1.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    let dirLight = new three_1.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);
    let groundMesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(40, 40), new three_1.MeshPhongMaterial({
        color: 0x999999,
        depthWrite: true
    }));
    groundMesh.rotation.x = -Math.PI * 0.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
    // TODO
    renderer.shadowMap.type = three_1.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
}
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
//# sourceMappingURL=multiple.js.map