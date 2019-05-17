import {
    AmbientLight,
    ArrayCamera,
    CylinderBufferGeometry,
    DirectionalLight,
    Mesh, MeshPhongMaterial,
    PerspectiveCamera, PlaneBufferGeometry,
    Scene,
    WebGLRenderer
} from "three";

let renderer:WebGLRenderer,scene:Scene,camera:ArrayCamera;

let cylMesh:Mesh;

init();

animate();

function init() {
    scene=new Scene();
    let amount=6;//6*6
    let width=(window.innerWidth/amount)*window.devicePixelRatio;
    let height=(window.innerHeight/amount)*window.devicePixelRatio;
    let cameras=new Array<PerspectiveCamera>();

    for(let y=0;y<amount;y++){
        for(let x=0;x<amount;x++){
            let subCamera=new PerspectiveCamera(40,window.innerWidth/window.innerHeight,0.1,10);
            //subCamera.bounds
            subCamera.position.x=(x/amount)-0.5;
            subCamera.position.y=0.5-(y/amount);
            subCamera.position.z=1.5;
            subCamera.position.multiplyScalar(2);
            subCamera.lookAt(0,0,0);
            subCamera.updateMatrixWorld(false);
            cameras.push(subCamera);
            cameras.push()
        }
    }

    camera=new ArrayCamera(cameras);

    camera.position.z=3;

    scene.add(new AmbientLight(0x222244));

    let light=new DirectionalLight();
    light.position.set(0.5,0.5,1);
    light.castShadow=true;
    light.shadow.camera.zoom=4;
    scene.add(light);

    let geo=new PlaneBufferGeometry(100,100);
    let mat=new MeshPhongMaterial({color:0x000066});

    let background=new Mesh(geo,mat);
    background.receiveShadow=true;
    background.position.set(0,0,-1);
    scene.add(background);

    let cylGeo=new CylinderBufferGeometry(0.5,0.5,1,32);
    let cylMat=new MeshPhongMaterial({color:0xff0000});

    cylMesh=new Mesh(cylGeo,cylMat);
    cylMesh.castShadow=true;
    cylMesh.receiveShadow=true;
    scene.add(cylMesh);

    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function animate() {

    cylMesh.rotation.x+=0.005;
    cylMesh.rotation.z+=0.01;

    renderer.render(scene,camera);

    requestAnimationFrame(animate);
}