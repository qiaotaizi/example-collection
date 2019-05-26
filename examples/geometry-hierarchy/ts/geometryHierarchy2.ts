import {Color, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {IExampleScene} from "../../../IExampleScene";

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

class GeometryHierarchy2 implements IExampleScene{

    camera:PerspectiveCamera;

    scene:Scene;

    renderer:WebGLRenderer;

    constructor() {
        this.camera=new PerspectiveCamera(60,1,1,10000);

        this.scene=new Scene();
        this.scene.background=new Color(0xf0f0f0);

        this.renderer=new WebGLRenderer();

        this.renderer.setPixelRatio(1);
        this.renderer.setSize(1,1);

        document.body.appendChild(this.renderer.domElement);
    }

    animate() {
        //先建立对关键对象的引用
        let [s,c,r]=[this.scene,this.camera,this.renderer];

        //在这个函数中执行渲染逻辑,避免对this对象调用产生的引用丢失
        let anim=function(){
            requestAnimationFrame(anim);
            r.render(s,c);
        };

        anim();
    }
}

new GeometryHierarchy2().animate();
