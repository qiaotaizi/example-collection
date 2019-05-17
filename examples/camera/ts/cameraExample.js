"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const utils_1 = require("../../utils");
let camera, scene, renderer;
let activateCamera, activateCameraHelper;
let perspectiveCamera, orthographicCamera;
let perspectiveCameraHelper, orthographicCameraHelper;
let cameraRig;
let mesh1;
init();
animate();
function init() {
    let aspect = window.innerWidth / window.innerHeight;
    let frustumSize = 600;
    camera = new three_1.PerspectiveCamera(50, 0.5 * aspect, 1, 10000);
    camera.position.z = 2500;
    perspectiveCamera = new three_1.PerspectiveCamera(50, 0.5 * aspect, 150, 10000);
    perspectiveCameraHelper = new three_1.CameraHelper(perspectiveCamera);
    scene = new three_1.Scene();
    scene.add(perspectiveCameraHelper);
    orthographicCamera = new three_1.OrthographicCamera(0.5 * frustumSize * aspect / -2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 150, 1000);
    orthographicCameraHelper = new three_1.CameraHelper(orthographicCamera);
    scene.add(orthographicCameraHelper);
    activateCamera = perspectiveCamera;
    activateCameraHelper = perspectiveCameraHelper;
    perspectiveCamera.rotation.y = Math.PI;
    orthographicCamera.rotation.y = Math.PI;
    cameraRig = new three_1.Group();
    cameraRig.add(perspectiveCamera);
    cameraRig.add(orthographicCamera);
    scene.add(cameraRig);
    mesh1 = new three_1.Mesh(new three_1.SphereBufferGeometry(100, 16, 8), new three_1.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
    let mesh2 = new three_1.Mesh(new three_1.SphereBufferGeometry(50, 16, 8), new three_1.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
    mesh2.position.y = 150;
    let mesh3 = new three_1.Mesh(new three_1.SphereBufferGeometry(5, 16, 8), new three_1.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }));
    mesh3.position.z = 150;
    scene.add(mesh1);
    scene.add(mesh2);
    scene.add(mesh3);
    let geometry = new three_1.BufferGeometry();
    let vertivles = new Array();
    //星星
    for (let i = 0; i < 10000; i++) {
        //Random float from <-range/2, range/2> interval
        //_Math.randFloatSpread 无法调用 这里重新声明一次
        vertivles.push(utils_1.randFloatSpread2(2000));
        vertivles.push(utils_1.randFloatSpread2(2000));
        vertivles.push(utils_1.randFloatSpread2(2000));
    }
    geometry.addAttribute('position', new three_1.Float32BufferAttribute(vertivles, 3));
    let particles = new three_1.Points(geometry, new three_1.PointsMaterial({ color: 0xffffff }));
    scene.add(particles);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
}
function render() {
    cameraRig.lookAt(mesh1.position);
    renderer.clear();
    activateCameraHelper.visible = false;
    renderer.setViewport(0, 0, window.innerWidth * 0.5, window.innerHeight); //实现分屏
    renderer.render(scene, activateCamera);
    activateCameraHelper.visible = true;
    renderer.setViewport(window.innerWidth * 0.5, 0, window.innerWidth * 0.5, window.innerHeight);
    renderer.render(scene, camera);
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
//# sourceMappingURL=cameraExample.js.map