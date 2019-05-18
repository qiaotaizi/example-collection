"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let camera, scene, raycaster, renderer;
init();
animate();
/**
 * 生成立方体随机位置
 */
function randPos() {
    return Math.random() * 800 - 400;
}
function init() {
    camera = new three_1.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    //景深初值
    camera.setFocalLength(5);
    camera.position.set(2, 1, 500);
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xf0f0f0);
    scene.add(new three_1.AmbientLight(0xffffff, 0.3));
    let light = new three_1.DirectionalLight(0xffffff, 0.35);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    let geo = new three_1.BoxBufferGeometry(20, 20, 20);
    for (let i = 0; i < 1500; i++) {
        let obj = new three_1.Mesh(geo, new three_1.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
        obj.position.set(randPos(), randPos(), randPos());
        scene.add(obj);
    }
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
//# sourceMappingURL=cameraCinematic.js.map