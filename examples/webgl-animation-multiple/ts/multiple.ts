import {
    AnimationMixer,
    Clock,
    Color,
    DirectionalLight,
    Fog,
    HemisphereLight, Mesh, MeshPhongMaterial, PCFSoftShadowMap,
    PerspectiveCamera, PlaneBufferGeometry,
    Scene,
    WebGLRenderer
} from "three";

let scene:Scene,camera:PerspectiveCamera,renderer:WebGLRenderer;

let clock:Clock,mixers:AnimationMixer[];

init();

animate();

function init() {
    camera=new PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,10000);
    camera.position.set(3,6,-10);
    camera.lookAt(0,1,0);

    clock=new Clock();

    scene=new Scene();
    scene.background=new Color(0xa0a0a0);
    scene.fog=new Fog(0xa0a0a0,10,22);

    let hemiLight=new HemisphereLight(0xffffff,0x444444);
    hemiLight.position.set(0,20,0);
    scene.add(hemiLight);

    let dirLight=new DirectionalLight(0xffffff);
    dirLight.position.set(-3,10,-10);
    dirLight.castShadow=true;
    dirLight.shadow.camera.top=10;
    dirLight.shadow.camera.bottom=-10;
    dirLight.shadow.camera.left=-10;
    dirLight.shadow.camera.right=10;
    dirLight.shadow.camera.near=0.1;
    dirLight.shadow.camera.far=40;
    scene.add(dirLight);

    let groundMesh=new Mesh(
        new PlaneBufferGeometry(40,40),
        new MeshPhongMaterial({
            color:0x999999,
            depthWrite:true
        })
    );

    groundMesh.rotation.x=-Math.PI*0.5;
    groundMesh.receiveShadow=true;
    scene.add(groundMesh);

    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.gammaOutput=true;
    renderer.gammaFactor=2.2;
    renderer.shadowMap.enabled=true;
    // TODO
    renderer.shadowMap.type=PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

}

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene,camera);
}
