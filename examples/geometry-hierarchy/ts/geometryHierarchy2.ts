import {Color, PerspectiveCamera, Scene, WebGLRenderer} from "three";

let scene:Scene,camera:PerspectiveCamera,renderer:WebGLRenderer;

init();

animate();

function init() {

}

function animate() {

}

class GeometryHierarchy2 {

    // private camera:PerspectiveCamera;
    //
    // private scene:Scene;
    //
    // private renderer:WebGLRenderer;

    constructor() {
        // this.camera=new PerspectiveCamera(60,1,1,10000);
        //
        // this.scene=new Scene();
        // this.scene.background=new Color(0xf0f0f0);
        //
        // this.renderer=new WebGLRenderer();
        //
        // this.renderer.setPixelRatio(1);
        // this.renderer.setSize(1,1);

        //document.body.appendChild(this.renderer.domElement);
    }

    animate(this:GeometryHierarchy2) {

        console.log(this);
        //该函数在递归过程中 this指向丢失  不能用这种面向对象的写法
        //引以为戒
        requestAnimationFrame(this.animate);

        //this.renderer.render(this.scene,this.camera);
    }
}
