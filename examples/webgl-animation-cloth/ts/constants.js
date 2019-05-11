"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 全局常量
 */
class ClothConstants {
}
ClothConstants.DAMPING = 0.03;
ClothConstants.DRAG = 1 - ClothConstants.DAMPING;
ClothConstants.restDistance = 25;
ClothConstants.MASS = 0.1;
ClothConstants.xSegs = 10;
ClothConstants.ySegs = 10;
ClothConstants.GRAVITY = 981 * 1.4;
ClothConstants.TIMESTAMP = 18 / 1000;
ClothConstants.TIMESTEP_SQ = ClothConstants.TIMESTAMP * ClothConstants.TIMESTAMP;
exports.ClothConstants = ClothConstants;
//# sourceMappingURL=constants.js.map