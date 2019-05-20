/**
 * 方法拷贝自three/src/math/Math.js randFloatSpread
 * 该方法导入存在问题
 * @param range
 */
export function randFloatSpread2(range: number): number {
    return range * (0.5 - Math.random());
}

export function degToRad(degrees: number) {
    return degrees * DEG2RAD;
}

export function radToDeg(radians: number) {
    return radians * RAD2DEG;
}


const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
