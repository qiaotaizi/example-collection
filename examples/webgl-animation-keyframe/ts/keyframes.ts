import {
    AmbientLight,
    AnimationMixer,
    Clock,
    Color, LoadingManager, Mesh, Object3D,
    PerspectiveCamera, PointLight,
    Scene,
    WebGLRenderer
} from "three";
import initGLTFLoader = require("../../initGLTFLoader");
const OrbitControls = require("three-orbitcontrols");

let clock: Clock;
let mixer: AnimationMixer;
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let controls:any;

init();

// animate();

function init() {
    clock = new Clock();
    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    document.body.appendChild(renderer.domElement);

    scene = new Scene();
    scene.background = new Color(0xbfe3dd);

    camera = new PerspectiveCamera(40, window.innerHeight / window.innerWidth, 1, 100);
    camera.position.set(5, 2, 8);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.enablePan = false;//禁用摄影机追拍

    scene.add(new AmbientLight(0x404040));

    let pointLight = new PointLight(0xffffff, 1);
    pointLight.position.copy(camera.position);
    scene.add(pointLight);

    //加载3d对象
    // let path = "../assets";
    // let format = ".jpg";
    // let envMap = new CubeTextureLoader().load(
    //     [
    //         path + "posx" + format, path + "negx" + format,
    //         path + "posy" + format, path + "negy" + format,
    //         path + "posz" + format, path + "negz" + format
    //     ]);
    // THREE.DRACOLoader.setDecoderPath('js/libs/draco/gltf');
    // let loader:any=initLoader();
    let loader=initGLTFLoader();
    loader.load("../assets/LittlestTokyo.glb",function (gltf:any) {
        //gltf类型为GLTF,但是无法导出
        let model:Scene=gltf.scene;
        model.position.set(1,1,0);
        model.scale.set(0.01,0.01,0.01);
        model.traverse(function (child:Object3D) {
            let childMesh=child as Mesh;
            if(childMesh.isMesh){
                //childMesh.material.envMap=
            }
        });
        scene.add(model);
        mixer=new AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();

        //加载完毕开始渲染模型
        //避免回调函数尚未完成就开始animate调用,造成某些对象尚未完成初始化的问题
        animate();
    },undefined,function (e:ErrorEvent) {
        console.error(e);
    });




}

function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    mixer.update(delta);
    controls.update(delta);
    renderer.render(scene, camera);
}