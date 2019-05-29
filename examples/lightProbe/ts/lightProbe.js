"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const OrbitControls = require('three-orbitcontrols');
const lightProbeC_1 = require("./lightProbeC");
let camera, scene, renderer, mesh;
let winWidth = window.innerWidth, winHeight = window.innerHeight;
//光照探头
let lightProb, directLight;
let API = {
    lightProbeIntensity: 1.0,
    directionalLightIntensity: 0.2,
    envMapIntensity: 1
};
init();
function init() {
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);
    document.body.appendChild(renderer.domElement);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    scene = new three_1.Scene();
    camera = new three_1.PerspectiveCamera(40, winWidth / winHeight, 1, 1000);
    camera.position.set(0, 0, 30);
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.enablePan = false;
    lightProb = new lightProbeC_1.LightProbe();
    scene.add(lightProb);
    directLight = new three_1.DirectionalLight(0xffffff, API.directionalLightIntensity);
    directLight.position.set(10, 10, 10);
    scene.add(directLight);
    let genCubeUrls = function (prefix, suffix) {
        return [
            prefix + 'px' + suffix, prefix + 'nx' + suffix,
            prefix + 'py' + suffix, prefix + 'ny' + suffix,
            prefix + 'pz' + suffix, prefix + 'nz' + suffix
        ];
    };
    let urls = genCubeUrls("../assets/", ".png");
    new three_1.CubeTextureLoader().load(urls, function (cubeTexture) {
        cubeTexture.encoding = three_1.sRGBEncoding;
        scene.background = cubeTexture;
        let lp = lightProbeC_1.LightProbeGenerator.fromCubeTexture(cubeTexture);
        if (lp !== null) {
            lightProb.copy(lp);
            console.log(lp);
            let geo = new three_1.SphereBufferGeometry(5, 64, 32);
            let mat = new three_1.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0,
                roughness: 0,
                envMap: cubeTexture,
                envMapIntensity: API.envMapIntensity
            });
            mesh = new three_1.Mesh(geo, mat);
            scene.add(mesh);
            render();
        }
    });
}
function render() {
    renderer.render(scene, camera);
}
//# sourceMappingURL=lightProbe.js.map