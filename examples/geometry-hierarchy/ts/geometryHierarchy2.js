"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IExampleScene_1 = require("../../IExampleScene");
class GeometryHierarchy2 extends IExampleScene_1.IExampleScene {
    // private camera:PerspectiveCamera;
    //
    // private scene:Scene;
    //
    // private renderer:WebGLRenderer;
    constructor() {
        super();
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
    animate() {
        console.log(this);
        requestAnimationFrame(this.animate);
        //this.renderer.render(this.scene,this.camera);
    }
}
let es = new GeometryHierarchy2();
es.animate();
//# sourceMappingURL=geometryHierarchy2.js.map