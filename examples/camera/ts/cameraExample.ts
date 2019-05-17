import {
    BufferGeometry,
    Camera,
    CameraHelper, Float32BufferAttribute,
    Group,
    Mesh, MeshBasicMaterial,
    OrthographicCamera,
    PerspectiveCamera, Points, PointsMaterial,
    Scene,
    SphereBufferGeometry,
    WebGLRenderer
} from "three";
import {randFloatSpread2} from "../../utils";

let camera:PerspectiveCamera,scene:Scene,renderer:WebGLRenderer;

let activateCamera:Camera,activateCameraHelper:CameraHelper;

let perspectiveCamera:PerspectiveCamera,orthographicCamera:OrthographicCamera;

let perspectiveCameraHelper:CameraHelper,orthographicCameraHelper:CameraHelper;

let cameraRig:Group;

let mesh1:Mesh;



init();

animate();

function init() {
    let aspect=window.innerWidth/window.innerHeight;
    let frustumSize=600;
    camera=new PerspectiveCamera(50,0.5*aspect,1,10000);
    camera.position.z=2500;

    perspectiveCamera=new PerspectiveCamera(50,0.5*aspect,150,10000);
    perspectiveCameraHelper=new CameraHelper(perspectiveCamera);
    scene=new Scene();
    scene.add(perspectiveCameraHelper);

    orthographicCamera=new OrthographicCamera(0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000);
    orthographicCameraHelper=new CameraHelper(orthographicCamera);

    scene.add(orthographicCameraHelper);

    activateCamera=perspectiveCamera;
    activateCameraHelper=perspectiveCameraHelper;

    perspectiveCamera.rotation.y=Math.PI;
    orthographicCamera.rotation.y=Math.PI;

    cameraRig=new Group();
    cameraRig.add(perspectiveCamera);
    cameraRig.add(orthographicCamera);

    scene.add(cameraRig);

    mesh1=new Mesh(
        new SphereBufferGeometry(100,16,8),
        new MeshBasicMaterial({color:0xffffff,wireframe:true})
    );

    let mesh2=new Mesh(
      new SphereBufferGeometry(50,16,8),
        new MeshBasicMaterial({color:0x00ff00,wireframe:true})
    );

    mesh2.position.y=150;

    let mesh3=new Mesh(
      new SphereBufferGeometry(5,16,8),
        new MeshBasicMaterial({color:0x0000ff,wireframe:true})
    );
    mesh3.position.z=150;

    scene.add(mesh1);
    scene.add(mesh2);
    scene.add(mesh3);


    let geometry=new BufferGeometry();
    let vertivles=new Array<number>();
    //星星
    for(let i=0;i<10000;i++){
        //Random float from <-range/2, range/2> interval
        //_Math.randFloatSpread 无法调用 这里重新声明一次
        vertivles.push(randFloatSpread2(2000));
        vertivles.push(randFloatSpread2(2000));
        vertivles.push(randFloatSpread2(2000));
    }

    geometry.addAttribute('position',new Float32BufferAttribute(vertivles,3));

    let particles=new Points(geometry,new PointsMaterial({color:0xffffff}));

    scene.add(particles);


    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.autoClear=false;

    document.body.appendChild(renderer.domElement);
}

function render() {

    cameraRig.lookAt(mesh1.position);
    renderer.clear();
    activateCameraHelper.visible=false;
    renderer.setViewport(0,0,window.innerWidth*0.5,window.innerHeight);//实现分屏
    renderer.render(scene,activateCamera);

    activateCameraHelper.visible=true;
    renderer.setViewport(window.innerWidth*0.5,0,window.innerWidth*0.5,window.innerHeight);
    renderer.render(scene,camera);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}