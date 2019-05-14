"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const initGLTFLoader = require("../../initGLTFLoader");
let scene, renderer, camera;
let model, skeleton, mixer, clock;
init();
function init() {
    camera = new three_1.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(1, 2, -3);
    camera.lookAt(0, 1, 0);
    clock = new three_1.Clock();
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xa0a0a0);
    scene.fog = new three_1.Fog(0xa0a0a0, 10, 50);
    // TODO api
    let hemiLight = new three_1.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(-3, 10, -10);
    scene.add(hemiLight);
    let dirLight = new three_1.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);
    // TODO MeshPhongMaterial api
    let groundMesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(100, 100), new three_1.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    groundMesh.rotation.x = -Math.PI * 0.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    let loader = initGLTFLoader();
    loader.load("../assets/Soldier.glb", function (gltf) {
        model = gltf.scene;
        scene.add(model);
        model.traverse(function (object) {
            let objMesh = object;
            if (objMesh.isMesh) {
                objMesh.castShadow = true;
            }
        });
        skeleton = new three_1.SkeletonHelper(model);
        skeleton.visible = true;
        scene.add(skeleton);
        let animations = gltf.animations;
        // TODO 动画api
        mixer = new three_1.AnimationMixer(model);
        //let idleAction=mixer.clipAction(animations[0]);
        //let walkAction=mixer.clipAction(animations[3]);
        let runAction = mixer.clipAction(animations[1]);
        runAction.setEffectiveTimeScale(1);
        //runAction.setEffectiveWeight(0);
        runAction.enabled = true;
        runAction.play();
        //let actions=[idleAction,walkAction,runAction];
        animate();
    });
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
}
function animate() {
    requestAnimationFrame(animate);
    let mixerUpdateDelta = clock.getDelta();
    mixer.update(mixerUpdateDelta);
    renderer.render(scene, camera);
}
//# sourceMappingURL=skinningBlending.js.map