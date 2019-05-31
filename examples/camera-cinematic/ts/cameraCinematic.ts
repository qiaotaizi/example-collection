import {
    AmbientLight,
    BoxBufferGeometry,
    Color, ColorKeywords,
    DirectionalLight, Mesh, MeshLambertMaterial, Object3D,
    PerspectiveCamera,
    Raycaster,
    Scene, Vector2, WebGLRenderer
} from "three";
import {degToRad} from "../../../utils/MathUtils";

let camera:PerspectiveCamera,scene:Scene,raycaster:Raycaster,renderer:WebGLRenderer;

let mouse:Vector2=new Vector2(),INTERSECTED:Object3D|null,oldColorHex:number;

let theta:number=0,radius=100;

init();

bindEvent();

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
    camera.setFocalLength(95);
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
        mouse.y=-(event.clientY/window.innerHeight)*2+1;
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
        //有方块被指向
        if(INTERSECTED!=intersects[0].object){
            if(INTERSECTED){
                //直接从一个方块到另外一个方块,复原方块颜色
                let mat=(INTERSECTED as Mesh).material as MeshLambertMaterial;
                mat.color.setHex(oldColorHex);
            }
            INTERSECTED=intersects[0].object;
            let mat=(INTERSECTED as Mesh).material as MeshLambertMaterial;
            oldColorHex=mat.color.getHex();
            mat.color.setHex(0xff0000);
        }
    }else{
        if(INTERSECTED){
            //鼠标未指向任一对象,将之前获得焦点的对象清空
            let mat=(INTERSECTED as Mesh).material as MeshLambertMaterial;
            mat.color.setHex(oldColorHex);
            INTERSECTED=null;
        }
    }



    renderer.render(scene,camera);

}

/**
 * 绑定鼠标事件
 */
function bindEvent() {

    let addBtn=document.getElementById("add-btn") as HTMLButtonElement;
    let minusBtn=document.getElementById("minus-btn") as HTMLButtonElement;
    addBtn.addEventListener('click',function (event) {
        camera.setFocalLength(camera.getFocalLength()+1);
    });

    minusBtn.addEventListener('click',function (event) {
        camera.setFocalLength(camera.getFocalLength()-1);
    });
}