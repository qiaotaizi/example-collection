import {
    BoxBufferGeometry,
    Camera,
    Color,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from "three";
import {IExampleScene} from "../../../IExampleScene";
import {IExampleScene2, SceneExecutor} from "../../../AbstracctExampleScene";

//尝试使用面向对象的编码方式失败,
//原因是帧渲染时需要调用requestAnimationFrame函数
//其参数为一个函数,这个函数在被调用过程中,遇到所有需要调用this对象的操作
//将会无法判断this指向的是什么对象

// let scene:Scene,camera:PerspectiveCamera,renderer:WebGLRenderer;
//
// init();
//
// animate();
//
// function init() {
//
//     scene=new Scene();
//
//     camera=new PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,10000);
//
//     renderer=new WebGLRenderer({antialias:true});
//
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize(window.innerWidth,window.innerHeight);
//
//     document.body.appendChild(renderer.domElement);
//
// }
//
// function animate() {
//
//     renderer.render(scene,camera);
//
//
//     requestAnimationFrame(animate);
// }

// class GeometryHierarchy2 implements IExampleScene{
//
//     camera:PerspectiveCamera;
//
//     scene:Scene;
//
//     renderer:WebGLRenderer;
//
//     constructor() {
//         this.camera=new PerspectiveCamera(60,1,1,10000);
//
//         this.scene=new Scene();
//         this.scene.background=new Color(0xf0f0f0);
//
//         this.renderer=new WebGLRenderer();
//
//         this.renderer.setPixelRatio(1);
//         this.renderer.setSize(1,1);
//
//         document.body.appendChild(this.renderer.domElement);
//     }
//
//     animate() {
//         //先建立对关键对象的引用
//         let [s,c,r]=[this.scene,this.camera,this.renderer];
//
//         //在这个函数中执行渲染逻辑,避免对this对象调用产生的引用丢失
//         let anim=function(){
//             requestAnimationFrame(anim);
//             r.render(s,c);
//         };
//
//         anim();
//     }
// }
//
// new GeometryHierarchy2().animate();

// class GeometryHierarchy2 implements IExampleScene2{
//     camera: PerspectiveCamera;
//     renderer: WebGLRenderer;
//     scene: Scene;
//
//     mesh:Mesh;
//
//     constructor(){
//         this.camera=new PerspectiveCamera(60,1,1,10000);
//
//         this.camera.position.set(10,10,10);
//
//         this.scene=new Scene();
//         this.scene.background=new Color(0xf0f0f0);
//
//         this.camera.lookAt(this.scene.position);
//
//         this.mesh=new Mesh(new BoxBufferGeometry(10,10,10),new MeshBasicMaterial({color:0xff0033}));
//
//         this.scene.add(this.mesh);
//
//         this.renderer=new WebGLRenderer({antialias:true});
//
//         this.renderer.setPixelRatio(1);
//         this.renderer.setSize(1,1);
//
//         document.body.appendChild(this.renderer.domElement);
//     }
//
//     render(): void {
//
//         this.mesh.rotation.x+=0.01;
//
//     }
//
// }
//
// SceneExecutor.exec(new GeometryHierarchy2());

