import {Vector3} from "three";

/**
 * 类定义
 */

class RenderUnit{
    constructor(
        public modelName:string,
        public meshName:string,
        public position:Vector3,
        public scale:number,
        public animationName:string){

    }
}