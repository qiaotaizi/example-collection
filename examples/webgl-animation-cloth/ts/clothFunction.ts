import {Vector3} from "three";
import {ClothConstants} from "./constants";

function plane(width: number, height: number): (u: number, v: number, target: Vector3) => void {
    return function (u: number, v: number, target: Vector3): void {
        let x = (u - 0.5) * width;
        let y = (v + 0.5) * height;
        let z = 0;
        target.set(x, y, z);
    }
}

let clothFunction = plane(ClothConstants.restDistance * ClothConstants.xSegs, ClothConstants.restDistance * ClothConstants.ySegs);

export = clothFunction;