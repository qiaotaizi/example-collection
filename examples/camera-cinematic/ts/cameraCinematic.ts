import {
    AmbientLight,
    BoxBufferGeometry,
    Color, ColorKeywords,
    DirectionalLight, Mesh, MeshLambertMaterial, Object3D,
    PerspectiveCamera,
    Raycaster,
    Scene, Vector2, WebGLRenderer
} from "three";
import {degToRad} from "../../utils";

let camera:PerspectiveCamera,scene:Scene,raycaster:Raycaster,renderer:WebGLRenderer;

let mouse:Vector2=new Vector2(),oldColor:number;

let theta:number=0,radius=100;

init();

animate();

/**
 * 生成立方体随机位置
 */
function randPos() {
    return Math.random()*800-400;
}

function init() {
    camera=new PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1000);
    //景深初值
    camera.setFocalLength(5);
    camera.position.set(2,1,500);

    scene=new Scene();
    scene.background=new Color(0xf0f0f0);

    scene.add(new AmbientLight(0xffffff,0.3));

    let light=new DirectionalLight(0xffffff,0.35);
    light.position.set(1,1,1).normalize();
    scene.add(light);

    let geo=new BoxBufferGeometry(20,20,20);
    for(let i=0;i<1500;i++){
        let obj=new Mesh(geo,new MeshLambertMaterial({color:Math.random()*0xffffff}));
        obj.position.set(randPos(),randPos(),randPos());
        scene.add(obj);
    }

    raycaster=new Raycaster();

    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.addEventListener('mousemove',function (event) {
        event.preventDefault();
        mouse.x=(event.clientX/window.innerWidth)*2-1;
        mouse.y=(event.clientY/window.innerHeight)*2+1;
    },false)

}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function cameraFocusAt(targetDistance: number) {

}

function render() {
    theta+=0.1;

    let xyRotation=Math.sin(degToRad(theta));
    let zRotation=Math.cos(degToRad(theta));
    camera.position.x=radius*xyRotation;
    camera.position.y=radius*xyRotation;
    camera.position.z=radius*zRotation;

    camera.lookAt(scene.position);

    camera.updateMatrixWorld(false);

    raycaster.setFromCamera(mouse,camera);

    let intersects=raycaster.intersectObjects(scene.children);

    if(intersects.length>0){
        let targetDistance=intersects[0].distance;
        cameraFocusAt(targetDistance);
    }



    renderer.render(scene,camera);

}