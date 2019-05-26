"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
//尝试使用面向对象的编码方式失败,
//原因是帧渲染时需要调用requestAnimationFrame函数
//其参数为一个函数,这个函数在被调用过程中,遇到所有需要调用this对象的操作
//将会无法判断this指向的是什么对象
//还是回归面向过程的编码方式吧
let scene, camera, renderer;
let root;
let mouseX = 0, mouseY = 0;
let winWidth = window.innerWidth, winHeight = window.innerHeight;
let halfWidth = winWidth * 0.5, halfHeight = winHeight * 0.5;
init();
bindEvent();
animate();
function init() {
    camera = new three_1.PerspectiveCamera(60, winWidth / winHeight, 1, 15000);
    camera.position.z = 500;
    scene = new three_1.Scene();
    scene.background = new three_1.Color(0xffffff);
    let geo = new three_1.BoxBufferGeometry(100, 100, 100);
    let mat = new three_1.MeshNormalMaterial();
    root = new three_1.Mesh(geo, mat);
    root.position.x = 1000;
    scene.add(root);
    let parent = root, amount = 200;
    for (let i = 0; i < amount; i++) {
        let obj = new three_1.Mesh(geo, mat);
        obj.position.x = 100;
        parent.add(obj);
        parent = obj;
    }
    parent = root;
    for (let i = 0; i < amount; i++) {
        let obj = new three_1.Mesh(geo, mat);
        obj.position.x = -100;
        parent.add(obj);
        parent = obj;
    }
    parent = root;
    for (let i = 0; i < amount; i++) {
        let obj = new three_1.Mesh(geo, mat);
        obj.position.y = 100;
        parent.add(obj);
        parent = obj;
    }
    parent = root;
    for (let i = 0; i < amount; i++) {
        let obj = new three_1.Mesh(geo, mat);
        obj.position.y = -100;
        parent.add(obj);
        parent = obj;
    }
    parent = root;
    for (let i = 0; i < amount; i++) {
        let obj = new three_1.Mesh(geo, mat);
        obj.position.z = 100;
        parent.add(obj);
        parent = obj;
    }
    parent = root;
    for (let i = 0; i < amount; i++) {
        let obj = new three_1.Mesh(geo, mat);
        obj.position.z = -100;
        parent.add(obj);
        parent = obj;
    }
    //parent=root;
    renderer = new three_1.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth, winHeight);
    document.body.appendChild(renderer.domElement);
}
function bindEvent() {
    //绑定鼠标移动事件
    document.addEventListener('mousemove', function (event) {
        mouseX = (event.clientX - halfWidth) * 10;
        mouseY = (event.clientY - halfHeight) * 10;
    }, false);
}
function animate() {
    render();
    requestAnimationFrame(animate);
}
function render() {
    let time = Date.now() * 0.001;
    let rx = Math.sin(time * 0.7) * 0.2;
    let ry = Math.sin(time * 0.3) * 0.1;
    let rz = Math.sin(time * 0.2) * 0.1;
    //通过鼠标事件控制摄像机位置
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    root.traverse(function (obj) {
        obj.rotation.set(rx, ry, rz);
    });
    renderer.render(scene, camera);
}
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
//# sourceMappingURL=geometryHierarchy2.js.map