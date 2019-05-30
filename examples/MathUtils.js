"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 方法拷贝自three/src/math/Math.js randFloatSpread
 * 该方法导入存在问题
 * @param range
 */
function randFloatSpread2(range) {
    return range * (0.5 - Math.random());
}
exports.randFloatSpread2 = randFloatSpread2;
function degToRad(degrees) {
    return degrees * DEG2RAD;
}
exports.degToRad = degToRad;
function radToDeg(radians) {
    return radians * RAD2DEG;
}
exports.radToDeg = radToDeg;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
//# sourceMappingURL=MathUtils.js.map