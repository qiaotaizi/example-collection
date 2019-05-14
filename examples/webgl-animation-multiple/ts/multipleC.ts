import {Euler, Vector3} from "three";

/**
 * 类定义
 */

export class RenderUnit{
    constructor(
        public meshName:string,
        public position:Vector3,
        public scale:number,
        public rotation:Euler=new Euler(0,0,0),
        public animationName?:string){
    }
}