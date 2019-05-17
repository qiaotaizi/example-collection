/**
 * 方法拷贝自three/src/math/Math.js randFloatSpread
 * 该方法导入存在问题
 * @param range
 */
export function randFloatSpread2(range:number):number {
        return range * ( 0.5 - Math.random() );
}

