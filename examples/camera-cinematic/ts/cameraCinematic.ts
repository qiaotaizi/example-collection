import {
    AmbientLight,
    BoxBufferGeometry,
    Color, ColorKeywords,
    DirectionalLight, Mesh, MeshLambertMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene, WebGLRenderer
} from "three";
import red = ColorKeywords.red;

let camera:PerspectiveCamera,scene:Scene,raycaster:Raycaster,renderer:WebGLRenderer;

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


    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);

}

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene,camera);
}