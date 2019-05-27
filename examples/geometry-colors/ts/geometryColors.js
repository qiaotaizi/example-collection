"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let camera, scene, renderer;
let winWidth = window.innerWidth, winHeight = window.innerHeight;
let halfWidth = winWidth * 0.5, halfHeight = winHeight * 0.5;
let mouseX = 0, mouseY = 0;
init();
bindEvent();
animate();
render();
function init() {
    camera = new three_1.PerspectiveCamera(20, winWidth / winHeight, 1, 10000);
    camera.position.z = 1800;
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xffffff);
    let light = new three_1.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1);
    scene.add(light);
    //shadow(canvas2d)
    //在球体下方添加阴影
    let canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    let context = canvas.getContext('2d');
    if (context) {
        let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0.1, 'rgba(210,210,210,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,1)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        let shadowTexture = new three_1.CanvasTexture(canvas);
        let shadowMat = new three_1.MeshBasicMaterial({ map: shadowTexture });
        let shadowGeo = new three_1.PlaneBufferGeometry(300, 300, 1, 1);
        let shadowMesh1 = new three_1.Mesh(shadowGeo, shadowMat);
        shadowMesh1.position.y = -250;
        shadowMesh1.rotation.x = -Math.PI / 2;
        scene.add(shadowMesh1);
        let shadowMesh2 = new three_1.Mesh(shadowGeo, shadowMat);
        shadowMesh2.position.y = -250;
        shadowMesh2.position.x = -400;
        shadowMesh2.rotation.x = -Math.PI / 2;
        scene.add(shadowMesh2);
        let shadowMesh3 = new three_1.Mesh(shadowGeo, shadowMat);
        shadowMesh3.position.y = -250;
        shadowMesh3.position.x = 400;
        shadowMesh3.rotation.x = -Math.PI / 2;
        scene.add(shadowMesh3);
    }
    let radius = 200;
    //二十面体
    // TODO api?
    let geo1 = new three_1.IcosahedronBufferGeometry(radius, 1);
    let count = geo1.attributes.position.count;
    geo1.addAttribute('color', new three_1.BufferAttribute(new Float32Array(count * 3), 3));
    let geo2 = geo1.clone();
    let geo3 = geo1.clone();
    let color = new three_1.Color();
    let pos1 = geo1.attributes.position;
    let pos2 = geo2.attributes.position;
    let pos3 = geo3.attributes.position;
    let color1 = geo1.attributes.color;
    let color2 = geo2.attributes.color;
    let color3 = geo3.attributes.color;
    for (let i = 0; i < count; i++) {
        // TODO api
        color.setHSL((pos1.getY(i) / radius + 1) / 2, 1.0, 0.5);
        color1.setXYZ(i, color.r, color.g, color.b);
        color.setHSL(0, (pos2.getY(i) / radius + 1) / 2, 0.5);
        color2.setXYZ(i, color.r, color.g, color.b);
        color.setRGB(1, 0.8 - (pos3.getY(i) / radius + 1) / 2, 0);
        color3.setXYZ(i, color.r, color.g, color.b);
    }
    //TODO api
    let mat = new three_1.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
        vertexColors: three_1.VertexColors,
        shininess: 0
    });
    let wireFrameMat = new three_1.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true
    });
    let mesh1 = new three_1.Mesh(geo1, mat);
    let wireFrame1 = new three_1.Mesh(geo1, wireFrameMat);
    mesh1.add(wireFrame1);
    mesh1.position.x = -400;
    mesh1.rotation.x = -1.87;
    scene.add(mesh1);
    let mesh2 = new three_1.Mesh(geo2, mat);
    let wireFrame2 = new three_1.Mesh(geo2, wireFrameMat);
    mesh2.add(wireFrame2);
    mesh2.position.x = 400;
    scene.add(mesh2);
    let mesh3 = new three_1.Mesh(geo3, mat);
    let wireFrame3 = new three_1.Mesh(geo3, wireFrameMat);
    mesh3.add(wireFrame3);
    scene.add(mesh3);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);
    document.body.appendChild(renderer.domElement);
}
function bindEvent() {
    window.addEventListener('mousemove', function (event) {
        mouseX = event.clientX - halfWidth;
        mouseY = event.clientY - halfHeight;
    });
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
//# sourceMappingURL=geometryColors.js.map