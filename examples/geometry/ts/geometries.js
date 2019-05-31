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
    //二十面体
    let icosahedronMesh = new three_1.Mesh(new three_1.IcosahedronBufferGeometry(75, 1), mat);
    icosahedronMesh.position.set(-100, 0, 200);
    scene.add(icosahedronMesh);
    //八面体
    let octahedronMesh = new three_1.Mesh(new three_1.OctahedronBufferGeometry(75, 2), mat);
    octahedronMesh.position.set(100, 0, 200);
    scene.add(octahedronMesh);
    //四面体
    let tetrahedronMesh = new three_1.Mesh(new three_1.TetrahedronBufferGeometry(75, 0), mat);
    tetrahedronMesh.position.set(300, 0, 200);
    scene.add(tetrahedronMesh);
    //平面
    let planeMesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(100, 100, 4, 4), mat);
    planeMesh.position.set(-300, 0, 0);
    scene.add(planeMesh);
    //长方体/立方体
    let boxMesh = new three_1.Mesh(new three_1.BoxBufferGeometry(100, 100, 100, 4, 4, 4), mat);
    boxMesh.position.set(-100, 0, 0);
    scene.add(boxMesh);
    //圆形平面
    let circleMesh = new three_1.Mesh(new three_1.CircleBufferGeometry(50, 20, 0, Math.PI * 2), mat);
    circleMesh.position.set(100, 0, 0);
    scene.add(circleMesh);
    //环形平面
    let ringMesh = new three_1.Mesh(new three_1.RingBufferGeometry(10, 50, 20, 5, 0, Math.PI * 2), mat);
    ringMesh.position.set(300, 0, 0);
    scene.add(ringMesh);
    //圆柱体/棱柱体
    let cylinderMesh = new three_1.Mesh(new three_1.CylinderBufferGeometry(25, 75, 100, 40, 5), mat);
    cylinderMesh.position.set(-300, 0, -200);
    scene.add(cylinderMesh);
    //车削几何体
    let points = new Array();
    for (let i = 0; i < 50; i++) {
        let x = Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50;
        let y = (i - 5) * 2;
        // console.log(x+","+y);
        points.push(new three_1.Vector2(x, y));
    }
    let latheMesh = new three_1.Mesh(new three_1.LatheBufferGeometry(points, 20), mat);
    latheMesh.position.set(-100, 0, -200);
    scene.add(latheMesh);
    //圆环体
    let torusMesh = new three_1.Mesh(new three_1.TorusBufferGeometry(50, 20, 20, 20), mat);
    torusMesh.position.set(100, 0, -200);
    scene.add(torusMesh);
    //复杂圆环体
    let torusKnot = new three_1.Mesh(new three_1.TorusKnotBufferGeometry(50, 10, 50, 20), mat);
    torusKnot.position.set(300, 0, -200);
    scene.add(torusKnot);
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