import {
    AnimationMixer,
    Clock,
    Color,
    DirectionalLight,
    Fog,
    HemisphereLight, Mesh, MeshPhongMaterial, Object3D,
    PerspectiveCamera, PlaneBufferGeometry,
    Scene, SkeletonHelper,
    WebGLRenderer
} from "three";
import initGLTFLoader = require("../../initGLTFLoader");
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";

let scene:Scene,renderer:WebGLRenderer,camera:PerspectiveCamera;
let model:any,skeleton:SkeletonHelper,mixer:AnimationMixer,clock:Clock;

init();

function init() {
    camera=new PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1000);
    camera.position.set(1,2,-3);
    camera.lookAt(0,1,0);

    clock=new Clock();

    scene=new Scene();
    scene.background=new Color(0xa0a0a0);
    scene.fog=new Fog(0xa0a0a0, 10, 50);

    // TODO api
    let hemiLight=new HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(-3,10,-10);
    scene.add(hemiLight);

    let dirLight=new DirectionalLight(0xffffff);
    dirLight.position.set(-3,10,-10);
    dirLight.castShadow=true;
    dirLight.shadow.camera.left=-2;
    dirLight.shadow.camera.right=2;
    dirLight.shadow.camera.top=2;
    dirLight.shadow.camera.bottom=-2;
    dirLight.shadow.camera.near=0.1;
    dirLight.shadow.camera.far=40;
    scene.add(dirLight);

    // TODO MeshPhongMaterial api
    let groundMesh=new Mesh(new PlaneBufferGeometry(100,100),new MeshPhongMaterial(
        {color:0x999999,depthWrite:false}));
    groundMesh.rotation.x=-Math.PI*0.5;
    groundMesh.receiveShadow=true;
    scene.add(groundMesh);

    let loader=initGLTFLoader();
    loader.load("../assets/Soldier.glb",function (gltf:GLTF) {
        model=gltf.scene;
        scene.add(model);

        model.traverse(function (object: Object3D) {
            let objMesh=object as Mesh;
            if(objMesh.isMesh){
                objMesh.castShadow=true;
            }
        });

        skeleton=new SkeletonHelper(model);
        skeleton.visible=true;
        scene.add(skeleton);

        let animations=gltf.animations;

        // TODO 动画api
        mixer=new AnimationMixer(model);
        //let idleAction=mixer.clipAction(animations[0]);
        //let walkAction=mixer.clipAction(animations[3]);
        let runAction=mixer.clipAction(animations[1]);

        runAction.setEffectiveTimeScale(1);
        //runAction.setEffectiveWeight(0);
        runAction.enabled=true;
        runAction.play();
        //let actions=[idleAction,walkAction,runAction];

        animate();
    });

    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.gammaOutput=true;
    renderer.gammaFactor=2.2;
    renderer.shadowMap.enabled=true;
    document.body.appendChild(renderer.domElement);

}

function animate() {
    requestAnimationFrame(animate);
    let mixerUpdateDelta=clock.getDelta();
    mixer.update(mixerUpdateDelta);
    renderer.render(scene,camera);
}
