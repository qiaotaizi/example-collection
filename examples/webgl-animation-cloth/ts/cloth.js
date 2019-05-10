"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const OrbitControls = require('three-orbitcontrols');
let camera, scene, renderer;
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
    //lights TODO 好好看看这几个灯光类的api
    scene.add(new three_1.AmbientLight(0x666666));
    let light = new three_1.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    let d = 300;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;
    //添加草地
    let textureLoader = new three_1.TextureLoader();
    let groudTexture = textureLoader.load("../assets/grasslight-big.jpg");
    // TODO texture相关api
    groudTexture.wrapS = groudTexture.wrapT = three_1.RepeatWrapping;
    groudTexture.repeat.set(25, 25);
    groudTexture.anisotropy = 16;
    // TODO MeshLambertMaterial api
    let groundMaterial = new three_1.MeshLambertMaterial({
        map: groudTexture
    });
    let groundMesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(20000, 20000), groundMaterial);
    groundMesh.position.y = -250;
    groundMesh.rotation.x = -Math.PI / 2; //转向90°
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
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
    render();
}
function render() {
    renderer.render(scene, camera);
}
//# sourceMappingURL=cloth.js.map