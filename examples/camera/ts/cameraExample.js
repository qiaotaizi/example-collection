"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const utils_1 = require("../../utils");
let camera, scene, renderer;
// let activateCamera:Camera,activateCameraHelper:CameraHelper;
let perspectiveCamera, orthographicCamera;
let perspectiveCameraHelper, orthographicCameraHelper;
let cameraRig;
let mesh1, mesh2;
let sceneWidth, sceneHeight;
let viewPortWidth, viewPortHeight;
/**
 * 摄像机激活状态,0:透视  1:正交
 */
let activateState = 0;
init();
bindEvent();
animate();
function init() {
    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    viewPortWidth = sceneWidth * 0.5;
    viewPortHeight = sceneHeight;
    let aspect = sceneWidth / sceneHeight;
    let frustumSize = 600;
    camera = new three_1.PerspectiveCamera(50, 0.5 * aspect, 1, 10000);
    camera.position.z = 2500;
    perspectiveCamera = new three_1.PerspectiveCamera(50, 0.5 * aspect, 150, 10000);
    perspectiveCameraHelper = new three_1.CameraHelper(perspectiveCamera);
    perspectiveCameraHelper.visible = true;
    scene = new three_1.Scene();
    scene.add(perspectiveCameraHelper);
    orthographicCamera = new three_1.OrthographicCamera(0.5 * frustumSize * aspect / -2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 150, 1000);
    orthographicCameraHelper = new three_1.CameraHelper(orthographicCamera);
    orthographicCameraHelper.visible = false;
    scene.add(orthographicCameraHelper);
    // activateCamera=perspectiveCamera;
    // activateCameraHelper=perspectiveCameraHelper;
    perspectiveCamera.rotation.y = Math.PI;
    orthographicCamera.rotation.y = Math.PI;
    cameraRig = new three_1.Group();
    cameraRig.add(perspectiveCamera);
    cameraRig.add(orthographicCamera);
    scene.add(cameraRig);
    mesh1 = new three_1.Mesh(new three_1.SphereBufferGeometry(100, 16, 8), new three_1.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
    mesh2 = new three_1.Mesh(new three_1.SphereBufferGeometry(50, 16, 8), new three_1.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
    mesh2.position.y = 150;
    //将mesh2作为mesh1的子对象
    //在animate方法中丢失,不知道怎么回事
    // mesh1.add(mesh2);
    // console.log(mesh1.children.length);
    // console.log(mesh1.children[0].position);
    let mesh3 = new three_1.Mesh(new three_1.SphereBufferGeometry(5, 16, 8), new three_1.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }));
    mesh3.position.z = 150;
    scene.add(mesh1);
    scene.add(mesh2);
    scene.add(mesh3);
    cameraRig.add(mesh3);
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
    renderer.setSize(sceneWidth, sceneHeight);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    console.log("init ok!");
}
function render() {
    let r = Date.now() * 0.0005;
    mesh1.position.set(700 * Math.cos(r), 700 * Math.sin(r), 700 * Math.sin(r));
    console.log(mesh1.children.length);
    mesh2.position.x = 70 * Math.cos(2 * r);
    mesh2.position.z = 70 * Math.sin(r);
    let helper;
    let cameraAct;
    if (activateState === 0) {
        //透视
        helper = perspectiveCameraHelper;
        cameraAct = perspectiveCamera;
        perspectiveCamera.fov = 35 + 30 * Math.sin(0.5 * r);
        perspectiveCamera.far = mesh1.position.length();
        perspectiveCamera.updateProjectionMatrix();
        perspectiveCameraHelper.update();
    }
    else {
        //正交
        helper = orthographicCameraHelper;
        cameraAct = orthographicCamera;
        orthographicCamera.far = mesh1.position.length();
        orthographicCamera.updateProjectionMatrix();
        orthographicCameraHelper.update();
    }
    cameraRig.lookAt(mesh1.position);
    renderer.clear();
    //左屏不显示Helper
    helper.visible = false;
    renderer.setViewport(0, 0, viewPortWidth, viewPortHeight); //实现分屏
    renderer.render(scene, cameraAct);
    //右屏显示Helper
    helper.visible = true;
    renderer.setViewport(viewPortWidth, 0, viewPortWidth, viewPortHeight);
    renderer.render(scene, camera);
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
/**
 * 绑定点击事件
 */
function bindEvent() {
    let btn = document.getElementById("toggle-camera");
    btn.addEventListener("click", function (event) {
        activateState = 1 - activateState;
        //可见性可以挪出来
        perspectiveCameraHelper.visible = !perspectiveCameraHelper.visible;
        orthographicCameraHelper.visible = !orthographicCameraHelper.visible;
    });
}
//# sourceMappingURL=cameraExample.js.map