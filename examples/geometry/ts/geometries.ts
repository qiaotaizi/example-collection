import {
    AmbientLight, DoubleSide, IcosahedronBufferGeometry, Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    PointLight,
    RepeatWrapping,
    Scene, SphereBufferGeometry,
    TextureLoader,
    WebGLRenderer
} from "three";

let camera: PerspectiveCamera, renderer: WebGLRenderer, scene: Scene;

init();

animate();

function init() {
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.y = 400;

    scene = new Scene();

    let ambientLight = new AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    let pointLight = new PointLight(0xffffff, 0.8);

    camera.add(pointLight);
    scene.add(camera);

    // TODO api
    //材质贴图
    let map=new TextureLoader().load('../assets/UV_Grid_Sm.jpg');
    map.wrapT=map.wrapS=RepeatWrapping;
    map.anisotropy=16;

    let mat=new MeshPhongMaterial({map:map,side:DoubleSide});

    //球体
    let sphereMesh=new Mesh(new SphereBufferGeometry(70,20,10),mat);
    sphereMesh.position.set(-300,0,200);
    scene.add(sphereMesh);

    //二十面缓冲几何体
    let icosahedronMesh = new Mesh( new IcosahedronBufferGeometry( 75, 1 ), mat );
    icosahedronMesh.position.set( - 100, 0, 200 );
    scene.add( icosahedronMesh );



    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);

    document.body.appendChild(renderer.domElement);
}

function animate() {

    requestAnimationFrame(animate);

    render();
}

function render() {
    let timer=Date.now()*0.0001;
    camera.position.x=Math.cos(timer)*800;
    camera.position.z=Math.sin(timer)*800;
    camera.lookAt(scene.position);
    scene.traverse(function (object) {
        if(object instanceof Mesh){
            object.rotation.x=timer*5;
            object.rotation.y=timer*2.5;
        }
    });
    renderer.render(scene,camera);
}
