import {
    AmbientLight, BoxBufferGeometry,
    Color,
    DirectionalLight,
    Fog, Mesh, MeshLambertMaterial,
    PerspectiveCamera, PlaneBufferGeometry, RepeatWrapping,
    Scene,
    TextureLoader,
    WebGLRenderer
} from "three";
const OrbitControls = require('three-orbitcontrols');

let camera:PerspectiveCamera,scene:Scene,renderer:WebGLRenderer;

init();

animate();

/**
 * 初始化对象
 */
function init() {
    //scene
    scene=new Scene();
    scene.background=new Color(0xcce0ff);
    scene.fog=new Fog(0xcce0ff,500,10000);

    //camera
    camera=new PerspectiveCamera(30,window.innerWidth/window.innerHeight,1,10000);
    camera.position.set(1000,50,1500);

    //lights TODO 好好看看这几个灯光类的api
    scene.add(new AmbientLight(0x666666));
    let light=new DirectionalLight(0xdfebff,1);
    light.position.set(50,200,100);
    light.position.multiplyScalar(1.3);
    light.castShadow=true;
    light.shadow.mapSize.width=1024;
    light.shadow.mapSize.height=1024;
    let d=300;
    light.shadow.camera.left=-d;
    light.shadow.camera.right=d;
    light.shadow.camera.top=d;
    light.shadow.camera.bottom=-d;
    light.shadow.camera.far=1000;


    //添加草地
    let textureLoader=new TextureLoader();
    let groudTexture=textureLoader.load("../assets/grasslight-big.jpg");
    // TODO texture相关api
    groudTexture.wrapS=groudTexture.wrapT=RepeatWrapping;
    groudTexture.repeat.set(25,25);
    groudTexture.anisotropy=16;
    // TODO MeshLambertMaterial api
    let groundMaterial=new MeshLambertMaterial({
        map:groudTexture
    });
    let groundMesh=new Mesh(new PlaneBufferGeometry(20000,20000),groundMaterial);
    groundMesh.position.y=-250;
    groundMesh.rotation.x=-Math.PI/2;//转向90°
    groundMesh.receiveShadow=true;
    scene.add(groundMesh);

    //添加杆子
    let poleGeo=new BoxBufferGeometry(5,375,5);
    let poleMat=new MeshLambertMaterial();
    //垂直杆子两根
    let poleVer0=new Mesh(poleGeo,poleMat);
    poleVer0.position.set(-125,-62,0);
    rcShadow(poleVer0);
    scene.add(poleVer0);

    let poleVer1=new Mesh(poleGeo,poleMat);
    poleVer1.position.set(125,-62,0);
    rcShadow(poleVer1);
    scene.add(poleVer1);

    //水平杆子一根
    let poleHor=new Mesh(new BoxBufferGeometry(255,5,5),poleMat);
    poleHor.position.set(0,-250+750*0.5,0);
    rcShadow(poleHor);
    scene.add(poleHor);

    //两个垂直柱体下方的方块
    let gg=new BoxBufferGeometry(10,10,10);
    let ggMesh0=new Mesh(gg,poleMat);
    ggMesh0.position.set(125,-250,0);
    rcShadow(ggMesh0);
    scene.add(ggMesh0);
    let ggMesh1=new Mesh(gg,poleMat);
    ggMesh1.position.set(-125,-250,0);
    rcShadow(ggMesh1);
    scene.add(ggMesh1);

    //renderer
    renderer=new WebGLRenderer({
       antialias:true//抗锯齿
    });
    //设备像素比
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    //将renderer产生的canvas节点加入body
    document.body.appendChild(renderer.domElement);
    renderer.gammaInput=true;//如果设置，那么所有的纹理和颜色都会预乘gamma
    renderer.gammaOutput=true;//如果设置, 那么它期望所有纹理和颜色需要乘以gamma输出
    renderer.shadowMap.enabled=true;//如果设置, 请在场景中使用阴影贴图

    //controls
    let controls=new OrbitControls(camera,renderer.domElement);
    controls.maxPolarAngle=Math.PI*0.5;
    controls.minDistance=1000;
    controls.maxDistance=5000;

}

/**
 * 循环渲染
 */
function animate() {
    requestAnimationFrame(animate);
    render();
}

function render(){

    renderer.render(scene,camera);
}

function rcShadow(mesh:Mesh):void {
    mesh.receiveShadow=mesh.castShadow=true;
}

