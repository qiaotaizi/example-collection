import {
    AnimationClip,
    AnimationMixer,
    Clock,
    Color,
    DirectionalLight, Euler,
    Fog,
    HemisphereLight, Mesh, MeshPhongMaterial, Object3D, PCFSoftShadowMap,
    PerspectiveCamera, PlaneBufferGeometry,
    Scene, Vector3,
    WebGLRenderer
} from "three";
import {RenderUnit} from "./multipleC";
import initGLTFLoader = require("../../initGLTFLoader");
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";

let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;

let clock: Clock, mixers: AnimationMixer[]=new Array<AnimationMixer>();

init();
loadModels();
animate();

function init() {
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(3, 6, -10);
    camera.lookAt(0, 1, 0);

    clock = new Clock();

    scene = new Scene();
    scene.background = new Color(0xa0a0a0);
    scene.fog = new Fog(0xa0a0a0, 10, 22);

    let hemiLight = new HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    let dirLight = new DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    let groundMesh = new Mesh(
        new PlaneBufferGeometry(40, 40),
        new MeshPhongMaterial({
            color: 0x999999,
            depthWrite: true
        })
    );

    groundMesh.rotation.x = -Math.PI * 0.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
    // TODO
    renderer.shadowMap.type = PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

}

function loadModels() {
    let soldierModelPosition = "../../webgl-animation-skinning-blending/assets/Soldier.glb";
    let parrotModelPosition = "../assets/Parrot.glb";
    let soldierUnits = new Array<RenderUnit>();
    soldierUnits.push(new RenderUnit(
        "vanguard_Mesh",
        new Vector3(0, 0, 0),
        1,
        undefined,
        "Idle"));
    soldierUnits.push(new RenderUnit(
        "vanguard_Mesh",
        new Vector3(3, 0, 0),
        2,
        undefined,
        "Walk"));
    soldierUnits.push(new RenderUnit(
        "vanguard_Mesh",
        new Vector3(1, 0, 0),
        1,
        undefined,
        "Run"));
    let parrotUnits = new Array<RenderUnit>();
    parrotUnits.push(new RenderUnit(
        "mesh_0",
        new Vector3(-4, 0, 0),
        0.01,
        new Euler(0, Math.PI, 0),
        "parrot_A_"));
    parrotUnits.push(new RenderUnit(
        "mesh_0",
        new Vector3(-2, 0, 0),
        0.02,
        new Euler(0, Math.PI * 0.5, 0)));

    let loader = initGLTFLoader();
    //载入士兵对象
    loader.load(soldierModelPosition, function (gltf: GLTF) {
        let gltfScene=gltf.scene;
        gltfScene.traverse(function (object: Object3D) {
            if (object instanceof Mesh) {
                object.castShadow = true;
            }
        });
        cloneAndAddModels(gltf,soldierUnits);
    });

    //载入鹦鹉对象
    // loader.load(parrotModelPosition, function (gltf: GLTF) {
    //     let gltfScene=gltf.scene;
    //     gltfScene.traverse(function (object: Object3D) {
    //         if (object instanceof Mesh) {
    //             object.castShadow = true;
    //         }
    //     });
    //     cloneAndAddModels(gltf,parrotUnits);
    // });
}

/**
 * 克隆对象并添加至场景
 * @param gltf
 * @param soldierUnits
 */
function cloneAndAddModels(gltf: GLTF, units: RenderUnit[]) {
    console.log("ok");
    let model=gltf.scene;
    for(let i=0;i<units.length;i++){
        let u=units[i];
        let clonedScene=model.copy(model);
        if(clonedScene){
            console.log("clone scene ok");
            clonedScene.scale.set(u.scale,u.scale,u.scale);
            console.log(u.scale);
            clonedScene.position.set(u.position.x,u.position.y,u.position.z);
            clonedScene.rotation.set(u.rotation.x,u.rotation.y,u.rotation.z);
            let clonedMesh=clonedScene.getObjectByName(u.meshName);
            if(clonedMesh){
                let mixer=new AnimationMixer(clonedScene);
                if(u.animationName){
                    let clip=AnimationClip.findByName(gltf.animations,u.animationName);
                    if(clip){
                        let action=mixer.clipAction(clip);
                        console.log("playing clip "+u.animationName);
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
    let dt=clock.getDelta();
    for(let i=0;i<mixers.length;i++){
        mixers[i].update(dt);
    }
    renderer.render(scene, camera);
}
