"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let renderer, scene, camera;
let cylMesh;
init();
animate();
function init() {
    scene = new three_1.Scene();
    let amount = 6; //6*6
    let width = (window.innerWidth / amount) * window.devicePixelRatio;
    let height = (window.innerHeight / amount) * window.devicePixelRatio;
    let cameras = new Array();
    for (let y = 0; y < amount; y++) {
        for (let x = 0; x < amount; x++) {
            let subCamera = new three_1.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10);
            subCamera.position.x = (x / amount) - 0.5;
            subCamera.position.y = 0.5 - (y / amount);
            subCamera.position.z = 1.5;
            subCamera.position.multiplyScalar(2);
            subCamera.lookAt(0, 0, 0);
            subCamera.updateMatrixWorld(false);
            cameras.push(subCamera);
            cameras.push();
        }
    }
    camera = new three_1.ArrayCamera(cameras);
    camera.position.z = 3;
    scene.add(new three_1.AmbientLight(0x222244));
    let light = new three_1.DirectionalLight();
    light.position.set(0.5, 0.5, 1);
    light.castShadow = true;
    light.shadow.camera.zoom = 4;
    scene.add(light);
    let geo = new three_1.PlaneBufferGeometry(100, 100);
    let mat = new three_1.MeshPhongMaterial({ color: 0x000066 });
    let background = new three_1.Mesh(geo, mat);
    background.receiveShadow = true;
    background.position.set(0, 0, -1);
    scene.add(background);
    let cylGeo = new three_1.CylinderBufferGeometry(0.5, 0.5, 1, 32);
    let cylMat = new three_1.MeshPhongMaterial({ color: 0xff0000 });
    cylMesh = new three_1.Mesh(cylGeo, cylMat);
    cylMesh.castShadow = true;
    cylMesh.receiveShadow = true;
    scene.add(cylMesh);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
function animate() {
    cylMesh.rotation.x += 0.005;
    cylMesh.rotation.z += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
//# sourceMappingURL=cameraArray.js.map