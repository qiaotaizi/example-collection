"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let camera, scene, renderer;
let cameraTarget;
let winWidth = window.innerWidth, winHeight = window.innerHeight;
let text = "three.js", height = 20, size = 70, hover = 30;
let curveSegments = 4, bevelThickness = 2, bevelSize = 1.5, bevelEnabled = true;
let fontName = "optimer", fontWeight = "bold";
let mirror = true;
let fontMap = {
    "helvetiker": 0,
    "optimer": 1,
    "gentilis": 2,
    "droid/droid_sans": 3,
    "droid/droid_serif": 4
};
let weightMap = {
    "regular": 0,
    "bold": 1
};
/**
 * 十进制转十六进制字符
 * @param d
 */
function decimal2Hex(d) {
    let hex = d.toString(16);
    hex = "000000".substr(0, 6 - hex.length) + hex;
    return hex.toUpperCase();
}
// TODO api
three_1.Cache.enabled = true;
init();
bindEvent();
animate();
render();
function init() {
    camera = new three_1.PerspectiveCamera(30, winWidth / winHeight, 1, 1500);
    camera.position.set(0, 400, 700);
    cameraTarget = new three_1.Vector3(0, 150, 0);
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0x0e0e0e);
    scene.fog = new three_1.Fog(0x000000, 250, 1400);
    let dirLight = new three_1.DirectionalLight(0xffffff, 0.125);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);
    let pointLight = new three_1.PointLight(0xffffff, 1.5);
    pointLight.position.set(0, 100, 50);
    scene.add(pointLight);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);
    document.body.appendChild(renderer.domElement);
}
function bindEvent() {
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    renderer.render(scene, camera);
}
//# sourceMappingURL=geometryText.js.map