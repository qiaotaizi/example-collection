// import {Camera, Scene, WebGLRenderer} from "three";
//
// export abstract class AExampleScene {
//     // scene: Scene;
//     //
//     // camera: Camera;
//     //
//     // renderer: WebGLRenderer;
//     //
//     // abstract render: void;
//     //
//     // animate(): void {
//     //
//     //     let [s, c, r] = [this.scene, this.camera, this, this.renderer];
//     //
//     //     let a=function () {
//     //
//     //
//     //         requestAnimationFrame(a);
//     //     }
//     //
//     // }
//
// }
//
// export interface IExampleScene2 {
//     scene:Scene;
//
//     camera:Camera;
//
//     renderer:WebGLRenderer;
//
//     //animate():void;
//
//     render():void;
//
// }
//
// export class SceneExecutor{
//     static exec(exampleScene:IExampleScene2):void{
//       let [s,c,r,rd]=[exampleScene.scene,exampleScene.camera,exampleScene.renderer,exampleScene.render];
//
//       let animFunc=function () {
//           rd();
//
//           r.render(s,c);
//
//           requestAnimationFrame(animFunc);
//       };
//
//       animFunc();
//     }
// }