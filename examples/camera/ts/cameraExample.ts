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

// let activateCamera:Camera,activateCameraHelper:CameraHelper;

let perspectiveCamera:PerspectiveCamera,orthographicCamera:OrthographicCamera;

let perspectiveCameraHelper:CameraHelper,orthographicCameraHelper:CameraHelper;

let cameraRig:Group;

let mesh1:Mesh,mesh2:Mesh;

let sceneWidth:number,sceneHeight:number;

let viewPortWidth:number,viewPortHeight:number;

/**
 * 摄像机激活状态,0:透视  1:正交
 */
let activateState:number=0;


init();

animate();

function init() {
    sceneWidth=window.innerWidth;
    sceneHeight=window.innerHeight;
    viewPortWidth=sceneWidth*0.5;
    viewPortHeight=sceneHeight;
    let aspect=sceneWidth/sceneHeight;
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

    // activateCamera=perspectiveCamera;
    // activateCameraHelper=perspectiveCameraHelper;

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

    mesh2=new Mesh(
      new SphereBufferGeometry(50,16,8),
        new MeshBasicMaterial({color:0x00ff00,wireframe:true})
    );

    mesh2.position.y=150;

    //将mesh2作为mesh1的子对象
    //在animate方法中丢失,不知道怎么回事
    // mesh1.add(mesh2);
    // console.log(mesh1.children.length);
    // console.log(mesh1.children[0].position);

    let mesh3=new Mesh(
      new SphereBufferGeometry(5,16,8),
        new MeshBasicMaterial({color:0x0000ff,wireframe:true})
    );
    mesh3.position.z=150;

    scene.add(mesh1);
    scene.add(mesh2);
    scene.add(mesh3);
    cameraRig.add(mesh3);

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
    renderer.setSize(sceneWidth,sceneHeight);
    renderer.autoClear=false;

    document.body.appendChild(renderer.domElement);
    console.log("init ok!");
}

function render() {

    let r=Date.now()*0.0005;
    mesh1.position.set(700*Math.cos(r),700*Math.sin(r),700*Math.sin(r));
    console.log(mesh1.children.length);
    mesh2.position.x=70*Math.cos(2*r);
    mesh2.position.z=70*Math.sin(r);
    let helper:CameraHelper;
    let cameraAct:Camera;
    if(activateState===0){
        //透视
        helper=perspectiveCameraHelper;
        cameraAct=perspectiveCamera;
        perspectiveCamera.fov=35+30*Math.sin(0.5*r);
        perspectiveCamera.far=mesh1.position.length();
        perspectiveCamera.updateProjectionMatrix();

        perspectiveCameraHelper.update();

        //可见性可以挪出来
        perspectiveCameraHelper.visible=true;
        orthographicCameraHelper.visible=false;
    }else{
        //正交
        helper=orthographicCameraHelper;
        cameraAct=orthographicCamera;
        orthographicCamera.far=mesh1.position.length();
        orthographicCamera.updateProjectionMatrix();

        orthographicCameraHelper.update();


        perspectiveCameraHelper.visible=false;
        orthographicCameraHelper.visible=true;
    }

    cameraRig.lookAt(mesh1.position);
    renderer.clear();
    //左屏不显示Helper
    helper.visible=false;
    renderer.setViewport(0,0,viewPortWidth,viewPortHeight);//实现分屏
    renderer.render(scene,cameraAct);

    //右屏显示Helper
    helper.visible=true;
    renderer.setViewport(viewPortWidth,0,viewPortWidth,viewPortHeight);
    renderer.render(scene,camera);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}