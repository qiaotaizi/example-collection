import {
    CubeTexture,
    CubeTextureLoader,
    DirectionalLight, Mesh, MeshStandardMaterial,
    PerspectiveCamera,
    Scene, SphereBufferGeometry,
    sRGBEncoding,
    WebGLRenderer
} from "three";

//const OrbitControls = require('three-orbitcontrols');
import {LightProbe, LightProbeGenerator} from "./lightProbeC";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {JOrbitControls} from "../../../JOrbitControls";

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer, mesh: Mesh;

let winWidth = window.innerWidth, winHeight = window.innerHeight;

//光照探头
let lightProb: LightProbe, directLight: DirectionalLight;

let API = {
    lightProbeIntensity: 1.0,
    lightProbeIntensityMax: 1.0,
    lightProbeIntensityMin: 0.0,
    lightProbeIntensityStep: 0.01,

    directionalLightIntensity: 0.2,
    directionalLightIntensityMax: 1.0,
    directionalLightIntensityMin: 0.0,
    directionalLightIntensityStep: 0.01,

    envMapIntensity: 1,
    envMapIntensityMax: 1.0,
    envMapIntensityMin: 0.0,
    envMapIntensityStep: 0.01
};

init();

//设置默认值并添加控制
spanSetValueAddListener();

function spanSetValueAddListener() {
    //设置默认值
    let lightProbeIntensitySpan = document.getElementById("value-of-lightprobeintensity");
    if (lightProbeIntensitySpan) {
        lightProbeIntensitySpan.innerText = API.lightProbeIntensity.toFixed(2);
    }

    let directionalLightIntensitySpan = document.getElementById("value-of-directionallightintensity");
    if (directionalLightIntensitySpan) {
        directionalLightIntensitySpan.innerText = API.directionalLightIntensity.toFixed(2);
    }

    let envMapIntensitySpan = document.getElementById("value-of-envmapintensity");
    if (envMapIntensitySpan) {
        envMapIntensitySpan.innerText = API.envMapIntensity.toFixed(2);
    }

    window.addEventListener('keydown', function (event: KeyboardEvent) {
        // console.log(event.key);
        switch (event.key) {
            case 'q':
                if (API.lightProbeIntensity + API.lightProbeIntensityStep <= API.lightProbeIntensityMax) {
                    API.lightProbeIntensity += API.lightProbeIntensityStep;
                    if (lightProbeIntensitySpan) {
                        lightProbeIntensitySpan.innerText = API.lightProbeIntensity.toFixed(2);
                    }
                    lightProb.intensity=API.lightProbeIntensity;
                    render();
                }
                break;
            case 'w':
                if (API.lightProbeIntensity - API.lightProbeIntensityStep >= API.lightProbeIntensityMin) {
                    API.lightProbeIntensity -= API.lightProbeIntensityStep;
                    if (lightProbeIntensitySpan) {
                        lightProbeIntensitySpan.innerText = API.lightProbeIntensity.toFixed(2);
                    }
                    lightProb.intensity=API.lightProbeIntensity;
                    render();
                }
                break;
            //----------
            case 'a':
                if (API.directionalLightIntensity + API.directionalLightIntensityStep <= API.directionalLightIntensityMax) {
                    API.directionalLightIntensity += API.directionalLightIntensityStep;
                    if (directionalLightIntensitySpan) {
                        directionalLightIntensitySpan.innerText = API.directionalLightIntensity.toFixed(2);
                    }
                    directLight.intensity=API.directionalLightIntensity;
                    render();
                }
                break;
            case 's':
                if (API.directionalLightIntensity - API.directionalLightIntensityStep >= API.directionalLightIntensityMin) {
                    API.directionalLightIntensity -= API.directionalLightIntensityStep;
                    if (directionalLightIntensitySpan) {
                        directionalLightIntensitySpan.innerText = API.directionalLightIntensity.toFixed(2);
                    }
                    directLight.intensity=API.directionalLightIntensity;
                    render();
                }
                break;
            //--------
            case 'z':
                if (API.envMapIntensity + API.envMapIntensityStep <= API.envMapIntensityMax) {
                    API.envMapIntensity += API.envMapIntensityStep;
                    if (envMapIntensitySpan) {
                        envMapIntensitySpan.innerText = API.envMapIntensity.toFixed(2);
                    }
                    (mesh.material as MeshStandardMaterial).envMapIntensity=API.envMapIntensity;
                    render();
                }
                break;
            case 'x':
                if (API.envMapIntensity - API.envMapIntensityStep >= API.envMapIntensityMin) {
                    API.envMapIntensity -= API.envMapIntensityStep;
                    if (envMapIntensitySpan) {
                        envMapIntensitySpan.innerText = API.envMapIntensity.toFixed(2);
                    }
                    (mesh.material as MeshStandardMaterial).envMapIntensity=API.envMapIntensity;
                    render();
                }
                break;


        }
    })
}

function init() {
    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);

    document.body.appendChild(renderer.domElement);

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;

    scene = new Scene();

    camera = new PerspectiveCamera(40, winWidth / winHeight, 1, 1000);
    camera.position.set(0, 0, 30);

    let controls = new JOrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.enablePan = false;

    lightProb = new LightProbe();
    scene.add(lightProb);

    directLight = new DirectionalLight(0xffffff, API.directionalLightIntensity);
    directLight.position.set(10, 10, 10);
    scene.add(directLight);

    let genCubeUrls = function (prefix: string, suffix: string): Array<string> {
        return [
            prefix + 'px' + suffix, prefix + 'nx' + suffix,
            prefix + 'py' + suffix, prefix + 'ny' + suffix,
            prefix + 'pz' + suffix, prefix + 'nz' + suffix
        ];
    };

    let urls = genCubeUrls("../assets/", ".png");

    new CubeTextureLoader().load(urls, function (cubeTexture: CubeTexture) {
        cubeTexture.encoding = sRGBEncoding;
        scene.background = cubeTexture;

        let lp = LightProbeGenerator.fromCubeTexture(cubeTexture);
        if (lp) {
            lightProb.copy(lp);
            console.log(lp);
            let geo = new SphereBufferGeometry(5, 64, 32);
            let mat = new MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0,
                roughness: 0,
                envMap: cubeTexture,
                envMapIntensity: API.envMapIntensity
            });

            mesh = new Mesh(geo, mat);
            scene.add(mesh);

            render();
        }

    });

}

function render() {
    renderer.render(scene, camera);
}
