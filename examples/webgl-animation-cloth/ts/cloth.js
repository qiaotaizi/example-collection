"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 画面渲染代码
 */
const three_1 = require("three");
const OrbitControls = require('three-orbitcontrols');
const clothC_1 = require("./clothC");
const constants_1 = require("./constants");
const clothFunction = require("./clothFunction");
let camera, scene, renderer;
let windForce = new three_1.Vector3(0, 0, 0);
let cloth = new clothC_1.Cloth(constants_1.ClothConstants.xSegs, constants_1.ClothConstants.ySegs);
let clothGeo;
let tmpForce = new three_1.Vector3();
let gravity = new three_1.Vector3(0, -constants_1.ClothConstants.GRAVITY, 0).multiplyScalar(constants_1.ClothConstants.MASS);
init();
animate();
/**
 * 初始化对象
 */
function init() {
    //scene
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xcce0ff);
    scene.fog = new three_1.Fog(0xcce0ff, 500, 10000);
    //camera
    camera = new three_1.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(1000, 50, 1500);
    // 环境光(AmbientLight)会均匀的照亮场景中的所有物体。
    // 环境光不能用来投射阴影，因为它没有方向。
    scene.add(new three_1.AmbientLight(0x666666));
    //平行光是沿着特定方向发射的光。这种光的表现像是无限远,从它发出的光线都是平行的。常常用平行光来模拟太阳光的效果;
    //平行光可以投射阴影
    let light = new three_1.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    light.castShadow = true; //如果设置为 true 该平行光会产生动态阴影
    //light.shadow是一个DirectionalLightShadow对象
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    let d = 300;
    //DirectionalLightShadow本质上是使用一个正交相机来计算阴影的
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;
    //添加草地
    let textureLoader = new three_1.TextureLoader();
    let groudTexture = textureLoader.load("../assets/grasslight-big.jpg");
    //wrapS和wrapT分别对应uv映射的u和v
    // TODO uv映射?
    groudTexture.wrapS = groudTexture.wrapT = three_1.RepeatWrapping; //该常量设置纹理重复到无穷大
    groudTexture.repeat.set(25, 25); //设置u,v方向上的贴图重复次数
    groudTexture.anisotropy = 16; //沿着轴，通过具有最高纹素密度的像素的样本数,通常为2的幂
    //MeshLambertMaterial:一种非光泽表面的材质，没有镜面高光。
    let groundMaterial = new three_1.MeshLambertMaterial({
        map: groudTexture //颜色贴图
    });
    //平面缓冲几何体
    let groundMesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(20000, 20000), groundMaterial);
    groundMesh.position.y = -250;
    groundMesh.rotation.x = -Math.PI / 2; //转向90°
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    //添加杆子
    let poleGeo = new three_1.BoxBufferGeometry(5, 375, 5);
    let poleMat = new three_1.MeshLambertMaterial();
    //垂直杆子两根
    let poleVer0 = new three_1.Mesh(poleGeo, poleMat);
    poleVer0.position.set(-125, -62, 0);
    rcShadow(poleVer0);
    scene.add(poleVer0);
    let poleVer1 = new three_1.Mesh(poleGeo, poleMat);
    poleVer1.position.set(125, -62, 0);
    rcShadow(poleVer1);
    scene.add(poleVer1);
    //水平杆子一根
    let poleHor = new three_1.Mesh(new three_1.BoxBufferGeometry(255, 5, 5), poleMat);
    poleHor.position.set(0, -250 + 750 * 0.5, 0);
    rcShadow(poleHor);
    scene.add(poleHor);
    //两个垂直柱体下方的方块
    let gg = new three_1.BoxBufferGeometry(10, 10, 10);
    let ggMesh0 = new three_1.Mesh(gg, poleMat);
    ggMesh0.position.set(125, -250, 0);
    rcShadow(ggMesh0);
    scene.add(ggMesh0);
    let ggMesh1 = new three_1.Mesh(gg, poleMat);
    ggMesh1.position.set(-125, -250, 0);
    rcShadow(ggMesh1);
    scene.add(ggMesh1);
    //添加布
    let clothTexture = textureLoader.load("../assets/circuit_pattern.png");
    clothTexture.anisotropy = 16;
    let clothMat = new three_1.MeshLambertMaterial({
        map: clothTexture,
        side: three_1.DoubleSide,
        alphaTest: 0.5
    });
    clothGeo = new three_1.ParametricBufferGeometry(clothFunction, cloth.w, cloth.h);
    let clothMesh = new three_1.Mesh(clothGeo, clothMat);
    clothMesh.position.set(0, 0, 0);
    clothMesh.castShadow = true;
    scene.add(clothMesh);
    //renderer
    renderer = new three_1.WebGLRenderer({
        antialias: true //抗锯齿
    });
    //设备像素比
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //将renderer产生的canvas节点加入body
    document.body.appendChild(renderer.domElement);
    renderer.gammaInput = true; //如果设置，那么所有的纹理和颜色都会预乘gamma
    renderer.gammaOutput = true; //如果设置, 那么它期望所有纹理和颜色需要乘以gamma输出
    renderer.shadowMap.enabled = true; //如果设置, 请在场景中使用阴影贴图
    //controls
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1000;
    controls.maxDistance = 5000;
}
/**
 * 循环渲染
 */
function animate() {
    requestAnimationFrame(animate);
    let time = Date.now();
    let windStrength = Math.cos(time / 7000) * 20 + 40;
    windForce.set(Math.sin(time / 2000), Math.cos(time / 3000), Math.sin(time / 1000));
    windForce.normalize();
    windForce.multiplyScalar(windStrength);
    simulate(time);
    render();
}
function render() {
    let p = cloth.particles;
    let clothGeoPosition = clothGeo.attributes.position;
    if (!(clothGeoPosition instanceof three_1.InterleavedBufferAttribute)) {
        for (let i = 0, il = p.length; i < il; i++) {
            let v = p[i].position;
            clothGeoPosition.setXYZ(i, v.x, v.y, v.z);
        }
        clothGeoPosition.needsUpdate = true;
    }
    clothGeo.computeVertexNormals();
    renderer.render(scene, camera);
}
function rcShadow(mesh) {
    mesh.receiveShadow = mesh.castShadow = true;
}
function simulate(time) {
    let particles = cloth.particles;
    let indx;
    let normal = new three_1.Vector3();
    let indices = clothGeo.index;
    let normals = clothGeo.attributes.normal;
    for (let i = 0, il = indices.count; i < il; i += 3) {
        for (let j = 0; j < 3; j++) {
            indx = indices.getX(i + j);
            normal.fromBufferAttribute(normals, indx);
            tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(windForce));
            particles[indx].addForce(tmpForce);
        }
    }
    for (let i = 0, il = particles.length; i < il; i++) {
        let particle = particles[i];
        particle.addForce(gravity);
        particle.integrate(constants_1.ClothConstants.TIMESTEP_SQ);
    }
    let constraints = cloth.constraints;
    for (let i = 0, il = constraints.length; i < il; i++) {
        let constraint = constraints[i];
        satisfyConstraints(constraint);
    }
    for (let i = 0, il = particles.length; i < il; i++) {
        let particle = particles[i];
        let pos = particle.position;
        if (pos.y < -250) {
            pos.y = -250;
        }
    }
}
function satisfyConstraints(constraint) {
    let diff = new three_1.Vector3();
    diff.subVectors(constraint.p1.position, constraint.p2.position);
    let currentDist = diff.length();
    if (currentDist === 0) {
        return;
    }
    let correction = diff.multiplyScalar(1 - constraint.distance / currentDist);
    let correctionHalf = correction.multiplyScalar(0.5);
    constraint.p1.position.add(correctionHalf);
    constraint.p2.position.sub(correctionHalf);
}
//# sourceMappingURL=cloth.js.map