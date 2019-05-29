import {
    CubeTexture,
    CubeTextureLoader,
    DirectionalLight, Mesh, MeshStandardMaterial,
    PerspectiveCamera,
    Scene, SphereBufferGeometry,
    sRGBEncoding,
    WebGLRenderer
} from "three";
const OrbitControls = require('three-orbitcontrols');
import {LightProbe, LightProbeGenerator} from "./lightProbeC";

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer,mesh:Mesh;

let winWidth = window.innerWidth, winHeight = window.innerHeight;

//光照探头
let lightProb: LightProbe,directLight:DirectionalLight;

let API = {
    lightProbeIntensity: 1.0,
    directionalLightIntensity: 0.2,
    envMapIntensity: 1
};

init();

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

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.enablePan = false;

    lightProb = new LightProbe();
    scene.add(lightProb);

    directLight=new DirectionalLight(0xffffff,API.directionalLightIntensity);
    directLight.position.set(10,10,10);
    scene.add(directLight);

    let genCubeUrls=function (prefix:string,suffix:string):Array<string> {
        return [
            prefix + 'px' + suffix, prefix + 'nx' + suffix,
            prefix + 'py' + suffix, prefix + 'ny' + suffix,
            prefix + 'pz' + suffix, prefix + 'nz' + suffix
        ];
    };

    let urls=genCubeUrls("../assets/",".png");

    new CubeTextureLoader().load(urls,function (cubeTexture:CubeTexture) {
        cubeTexture.encoding=sRGBEncoding;
        scene.background=cubeTexture;

        let lp=LightProbeGenerator.fromCubeTexture(cubeTexture);
        if(lp!==null){
            lightProb.copy(lp);
            console.log(lp);
            let geo=new SphereBufferGeometry(5,64,32);
            let mat=new MeshStandardMaterial({
                color:0xffffff,
                metalness:0,
                roughness:0,
                envMap:cubeTexture,
                envMapIntensity:API.envMapIntensity
            });

            mesh =new Mesh(geo,mat);
            scene.add(mesh);

            render();
        }

    });

}

function render() {
    renderer.render(scene,camera);
}
