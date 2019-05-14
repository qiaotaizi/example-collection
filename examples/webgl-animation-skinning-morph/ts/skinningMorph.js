"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const initGLTFLoader = require("../../initGLTFLoader");
let camera, scene, clock, mixer;
let renderer;
let activateAction, previousAction;
let animations;
init();
eventBinding();
animate();
function init() {
    let container = document.createElement("div");
    container.id = "container";
    document.body.appendChild(container);
    camera = new three_1.PerspectiveCamera(45, innerWidth / innerHeight, 0.25, 100);
    camera.position.set(-5, 3, 10);
    camera.lookAt(new three_1.Vector3(0, 2, 0));
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xe0e0e0);
    scene.fog = new three_1.Fog(0xe0e0e0, 20, 100);
    clock = new three_1.Clock();
    let light = new three_1.DirectionalLight(0xffffff);
    light.position.set(0, 20, 10);
    scene.add(light);
    let mesh = new three_1.Mesh(new three_1.PlaneBufferGeometry(2000, 2000), new three_1.MeshPhongMaterial({
        color: 0x999999,
        depthWrite: false
    }));
    mesh.rotation.x = -Math.PI * 0.5;
    scene.add(mesh);
    let grid = new three_1.GridHelper(200, 40, 0x000000, 0x000000);
    let gridMat = grid.material;
    if (gridMat instanceof three_1.Material) {
        gridMat.opacity = 0.2;
        gridMat.transparent = true;
    }
    scene.add(grid);
    //model
    let loader = initGLTFLoader();
    loader.load("../assets/RobotExpressive.glb", function (gltf) {
        let model = gltf.scene;
        let face_ = model.getObjectByName("Head_2");
        if (face_ && face_ instanceof three_1.Mesh) {
            bindFace(face_);
        }
        mixer = new three_1.AnimationMixer(model);
        animations = gltf.animations;
        activateAction = mixer.clipAction(animations[2]); //以idle状态初始化
        activateAction.play();
        //scene.add(model);
    }, undefined, function (err) {
        console.error(err);
    });
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    container.appendChild(renderer.domElement);
}
function animate() {
    let dt = clock.getDelta();
    if (mixer) {
        mixer.update(dt);
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
function fadeToAction(action, duration) {
    previousAction = activateAction;
    activateAction = action;
    if (previousAction !== activateAction) {
        previousAction.fadeOut(duration);
        activateAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
    }
}
/**
 * 所有动画片段
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
/**
 * 绑定控制按钮事件
 */
function eventBinding() {
    /**
     * 绑定状态类动作按钮
     * @param btnId
     * @param animationIndex
     */
    function bindActionBtn(btnId, animationIndex) {
        let btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener("click", function (event) {
                fadeToAction(mixer.clipAction(animations[animationIndex]), 0.5);
            });
        }
    }
    bindActionBtn("idle_btn", 2); //Idle
    bindActionBtn("walk_btn", 10); //Walking
    bindActionBtn("dance_btn", 0); //Dance
    bindActionBtn("run_btn", 6); //Running
    bindActionBtn("death_btn", 1); //Death
    /**
     * 绑定情绪类动作按钮
     * 这类动作在完成之后恢复原状态
     * @param btnId
     * @param animationIndex
     */
    function bindEmoteBtn(btnId, animationIndex) {
        let btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener("click", function (event) {
                fadeToAction(mixer.clipAction(animations[animationIndex]), 0.2);
                function restoreState() {
                    mixer.removeEventListener('finished', restoreState);
                    fadeToAction(previousAction, 0.2);
                }
                //完成动作后返回原状态
                mixer.addEventListener('finished', restoreState);
            });
        }
    }
    bindEmoteBtn("sit_btn", 7); //Sitting
    bindEmoteBtn("standing_btn", 8); //Standing
    bindEmoteBtn("jump_btn", 3); //Jump
    bindEmoteBtn("yes_btn", 13); //Yes
    bindEmoteBtn("no_btn", 4); //No
    bindEmoteBtn("wave_btn", 12); //Wave
    bindEmoteBtn("punch_btn", 5); //Punch
    bindEmoteBtn("thumbsup_btn", 9); //ThumbsUp
    /**
     * 绑定面部表情
     * @param btnId
     * @param animationIndex
     */
    function bindFaceBtn(btnId, animationIndex) {
    }
}
function bindFace(face) {
    //获取所有morphTargets
    let morphOk = face.morphTargetDictionary && face.morphTargetInfluences;
    if (face.morphTargetDictionary) {
        let dict = Object.keys(face.morphTargetDictionary);
        for (let i = 0; i < dict.length; i++) {
            console.log("key=" + dict[i] + ";value=" + face.morphTargetDictionary[dict[i]]);
        }
    }
    let angryRange = document.getElementById("angry_range");
    if (angryRange) {
        angryRange.addEventListener("change", function (event) {
            let input = this;
        });
    }
    let sadRange = document.getElementById("sad_range");
    if (sadRange) {
        sadRange.addEventListener("change", function (event) {
            let input = this;
        });
    }
    let surpriseRange = document.getElementById("surprise_range");
    if (surpriseRange) {
        surpriseRange.addEventListener("change", function (event) {
            let input = this;
        });
    }
}
//# sourceMappingURL=skinningMorph.js.map