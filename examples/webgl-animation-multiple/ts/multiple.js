"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const multipleC_1 = require("./multipleC");
const initGLTFLoader = require("../../initGLTFLoader");
let scene, camera, renderer;
let clock, mixers = new Array();
init();
loadModels();
animate();
function init() {
    camera = new three_1.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(3, 6, -10);
    camera.lookAt(0, 1, 0);
    clock = new three_1.Clock();
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xa0a0a0);
    scene.fog = new three_1.Fog(0xa0a0a0, 10, 22);
    let hemiLight = new three_1.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    let dirLight = new three_1.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);
    let groundMesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(40, 40), new three_1.MeshPhongMaterial({
        color: 0x999999,
        depthWrite: true
    }));
    groundMesh.rotation.x = -Math.PI * 0.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
    // TODO
    renderer.shadowMap.type = three_1.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
}
function loadModels() {
    let soldierModelPosition = "../../webgl-animation-skinning-blending/assets/Soldier.glb";
    let parrotModelPosition = "../assets/Parrot.glb";
    let soldierUnits = new Array();
    soldierUnits.push(new multipleC_1.RenderUnit("vanguard_Mesh", new three_1.Vector3(0, 0, 0), 1, undefined, "Idle"));
    soldierUnits.push(new multipleC_1.RenderUnit("vanguard_Mesh", new three_1.Vector3(3, 0, 0), 2, undefined, "Walk"));
    soldierUnits.push(new multipleC_1.RenderUnit("vanguard_Mesh", new three_1.Vector3(1, 0, 0), 1, undefined, "Run"));
    let parrotUnits = new Array();
    parrotUnits.push(new multipleC_1.RenderUnit("mesh_0", new three_1.Vector3(-4, 0, 0), 0.01, new three_1.Euler(0, Math.PI, 0), "parrot_A_"));
    parrotUnits.push(new multipleC_1.RenderUnit("mesh_0", new three_1.Vector3(-2, 0, 0), 0.02, new three_1.Euler(0, Math.PI * 0.5, 0)));
    let loader = initGLTFLoader();
    //载入士兵对象
    loader.load(soldierModelPosition, function (gltf) {
        let gltfScene = gltf.scene;
        gltfScene.traverse(function (object) {
            if (object instanceof three_1.Mesh) {
                object.castShadow = true;
            }
        });
        cloneAndAddModels(gltf, soldierUnits);
    });
    //载入鹦鹉对象
    loader.load(parrotModelPosition, function (gltf) {
        let gltfScene = gltf.scene;
        gltfScene.traverse(function (object) {
            if (object instanceof three_1.Mesh) {
                object.castShadow = true;
            }
        });
        cloneAndAddModels(gltf, parrotUnits);
    });
}
/**
 * 克隆对象并添加至场景
 * @param gltf
 * @param soldierUnits
 */
function cloneAndAddModels(gltf, units) {
    for (let i = 0; i < units.length; i++) {
        let u = units[i];
        let skeleton = new three_1.SkeletonHelper(gltf.scene);
        let clonedScene = skeleton.clone();
        if (clonedScene) {
            clonedScene.scale.set(u.scale, u.scale, u.scale);
            clonedScene.position.set(u.position.x, u.position.y, u.position.z);
            clonedScene.rotation.set(u.rotation.x, u.rotation.y, u.rotation.z);
            let clonedMesh = clonedScene.getObjectByName(u.meshName);
            if (clonedMesh) {
                let mixer = new three_1.AnimationMixer(clonedMesh);
                if (u.animationName) {
                    let clip = three_1.AnimationClip.findByName(gltf.animations, u.animationName);
                    if (clip) {
                        let action = mixer.clipAction(clip);
                        action.play();
                    }
                }
                mixers.push(mixer);
            }
        }
        scene.add(clonedScene);
    }
}
function animate() {
    requestAnimationFrame(animate);
    let dt = clock.getDelta();
    console.log(mixers.length);
    // for(let i=0;i<mixers.length;i++){
    //     mixers[i].update(dt);
    // }
    renderer.render(scene, camera);
}
//# sourceMappingURL=multiple.js.map