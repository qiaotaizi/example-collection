"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
/**
 * 类定义
 */
class RenderUnit {
    constructor(meshName, position, scale, rotation = new three_1.Euler(0, 0, 0), animationName) {
        this.meshName = meshName;
        this.position = position;
        this.scale = scale;
        this.rotation = rotation;
        this.animationName = animationName;
    }
}
exports.RenderUnit = RenderUnit;
//# sourceMappingURL=multipleC.js.map