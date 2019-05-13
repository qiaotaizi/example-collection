import {
    AnimationAction, AnimationClip,
    AnimationMixer,
    Clock,
    Color,
    DirectionalLight,
    Fog, GridHelper, Material, Mesh, MeshPhongMaterial,
    PerspectiveCamera, PlaneBufferGeometry,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
import initGLTFLoader = require("../../initGLTFLoader");
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";

let camera: PerspectiveCamera, scene: Scene, clock: Clock, mixer: AnimationMixer;

let renderer: WebGLRenderer;

let model: Scene;

let activateAction: AnimationAction, previousAction: AnimationAction;

let animations:AnimationClip[];

init();

eventBinding();

animate();

function init() {

    let container = document.createElement("div");
    container.id = "container";
    document.body.appendChild(container);
    camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.25, 100);
    camera.position.set(-5, 3, 10);
    camera.lookAt(new Vector3(0, 2, 0));

    scene = new Scene();
    scene.background = new Color(0xe0e0e0);
    scene.fog = new Fog(0xe0e0e0, 20, 100);

    clock = new Clock();

    let light = new DirectionalLight(0xffffff);
    light.position.set(0, 20, 10);
    scene.add(light);

    let mesh = new Mesh(new PlaneBufferGeometry(2000, 2000), new MeshPhongMaterial({
        color: 0x999999,
        depthWrite: false
    }));
    mesh.rotation.x = -Math.PI * 0.5;
    scene.add(mesh);

    let grid = new GridHelper(200, 40, 0x000000, 0x000000);
    let gridMat = grid.material;
    if (gridMat instanceof Material) {
        gridMat.opacity = 0.2;
        gridMat.transparent = true;
    }
    scene.add(grid);

    //model
    let loader = initGLTFLoader();
    loader.load("../assets/RobotExpressive.glb", function (gltf: GLTF) {
        model = gltf.scene;
        mixer = new AnimationMixer(model);
        //打印所有动画片段
        /**
         * 0 : Dance
         * 1 : Death
         * 2 : Idle
         * 3 : Jump
         * 4 : No
         * 5 : Punch
         * 6 : Running
         * 7 : Sitting
         * 8 : Standing
         * 9 : ThumbsUp
         * 10 : Walking
         * 11 : WalkJump
         * 12 : Wave
         * 13 : Yes
         */
        animations=gltf.animations;
        activateAction = mixer.clipAction(animations[2]);//以idle状态初始化
        activateAction.play();

        scene.add(model);
    }, undefined, function (err: ErrorEvent) {
        console.error(err);
    });


    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    container.appendChild(renderer.domElement)
}

function animate() {
    let dt = clock.getDelta();
    if (mixer) {
        mixer.update(dt);
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function fadeToAction(action: AnimationAction, duration: number) {
    previousAction = activateAction;
    activateAction = action;
    if (previousAction !== activateAction) {
        previousAction.fadeOut(duration);
        activateAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
    }
}

/**
 * 绑定控制按钮点击事件
 */
function eventBinding() {
    let idleBtn = document.getElementById("idle_btn");
    if (idleBtn) {
        idleBtn.addEventListener("click", function (event) {
            console.log("进入待机状态");
            fadeToAction(mixer.clipAction(animations[2]),0.5);
        })
    }

    let walkBtn = document.getElementById("walk_btn");
    if (walkBtn) {
        walkBtn.addEventListener("click", function (event) {
            console.log("进入行走状态");
            fadeToAction(mixer.clipAction(animations[10]),0.5);
        })
    }

    let danceBtn = document.getElementById("dance_btn");
    if (danceBtn) {
        danceBtn.addEventListener("click", function (event) {
            console.log("进入跳舞状态");
            fadeToAction(mixer.clipAction(animations[0]),0.5);
        })
    }

    let runBtn = document.getElementById("run_btn");
    if (runBtn) {
        runBtn.addEventListener("click", function (event) {
            console.log("进入奔跑状态");
            fadeToAction(mixer.clipAction(animations[6]),0.5);
        })
    }

    let angryRange = document.getElementById("angry_range");
    if (angryRange) {
        angryRange.addEventListener("change", function (this, event) {
            let input = this as HTMLInputElement;
            console.log("愤怒=" + input.value);
        })
    }

    let sadRange = document.getElementById("sad_range");
    if (sadRange) {
        sadRange.addEventListener("change", function (this, event) {
            let input = this as HTMLInputElement;
            console.log("悲伤=" + input.value);
        })
    }

    let surpriseRange = document.getElementById("surprise_range");
    if (surpriseRange) {
        surpriseRange.addEventListener("change", function (this, event) {
            let input = this as HTMLInputElement;
            console.log("惊讶=" + input.value);
        })
    }
}