"use strict";
const constants_1 = require("./constants");
function plane(width, height) {
    return function (u, v, target) {
        let x = (u - 0.5) * width;
        let y = (v + 0.5) * height;
        let z = 0;
        target.set(x, y, z);
    };
}
let clothFunction = plane(constants_1.ClothConstants.restDistance * constants_1.ClothConstants.xSegs, constants_1.ClothConstants.restDistance * constants_1.ClothConstants.ySegs);
module.exports = clothFunction;
//# sourceMappingURL=clothFunction.js.map