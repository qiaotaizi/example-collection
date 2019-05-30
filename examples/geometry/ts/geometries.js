"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let camera, renderer, scene;
init();
animate();
function init() {
    camera = new three_1.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.y = 400;
    scene = new three_1.Scene();
    let ambientLight = new three_1.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);
    let pointLight = new three_1.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);
    // TODO api
    //材质贴图
    let map = new three_1.TextureLoader().load('../assets/UV_Grid_Sm.jpg');
    map.wrapT = map.wrapS = three_1.RepeatWrapping;
    map.anisotropy = 16;
    let mat = new three_1.MeshPhongMaterial({ map: map, side: three_1.DoubleSide });
    //球体
    let sphereMesh = new three_1.Mesh(new three_1.SphereBufferGeometry(70, 20, 10), mat);
    sphereMesh.position.set(-300, 0, 200);
    scene.add(sphereMesh);
    //
    let icosahedronMesh = new three_1.Mesh(new three_1.IcosahedronBufferGeometry(75, 1), mat);
    icosahedronMesh.position.set(-100, 0, 200);
    scene.add(icosahedronMesh);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    let timer = Date.now() * 0.0001;
    camera.position.x = Math.cos(timer) * 800;
    camera.position.z = Math.sin(timer) * 800;
    camera.lookAt(scene.position);
    scene.traverse(function (object) {
        if (object instanceof three_1.Mesh) {
            object.rotation.x = timer * 5;
            object.rotation.y = timer * 2.5;
        }
    });
    renderer.render(scene, camera);
}
//# sourceMappingURL=geometries.js.map