import {
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

let camera:PerspectiveCamera,scene:Scene,clock:Clock,mixer:AnimationMixer;

let renderer:WebGLRenderer;

init();

eventBinding();

animate();

function init() {

    let container=document.createElement("div");
    container.id="container";
    document.body.appendChild(container);
    camera=new PerspectiveCamera(45,innerWidth/innerHeight,0.25,100);
    camera.position.set(-5,3,10);
    camera.lookAt(new Vector3(0,2,0));

    scene=new Scene();
    scene.background=new Color(0xe0e0e0);
    scene.fog=new Fog(0xe0e0e0,20,100);

    clock=new Clock();

    let light=new DirectionalLight(0xffffff);
    light.position.set(0,20,10);
    scene.add(light);

    let mesh=new Mesh(new PlaneBufferGeometry(2000,2000),new MeshPhongMaterial({color:0x999999,depthWrite:false}));
    mesh.rotation.x=-Math.PI*0.5;
    scene.add(mesh);

    let grid=new GridHelper(200,40,0x000000,0x000000);
    let gridMat=grid.material;
    if(gridMat instanceof Material){
        gridMat.opacity=0.2;
        gridMat.transparent=true;
    }
    scene.add(grid);

    //model



    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.gammaOutput=true;
    renderer.gammaFactor=2.2;
    container.appendChild(renderer.domElement)
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}

function eventBinding() {
    console.log("1");
    let btn1=document.getElementById("test1_btn");
    if(btn1){
        console.log("2");
        btn1.addEventListener("click",function (event) {
            console.log("test1 clicked");
        })
    }

    let btn2=document.getElementById("test2_btn");
    if(btn2){
        console.log("3");
        btn2.addEventListener("click",function (event) {
            console.log("test2 clicked");
        })
    }
}