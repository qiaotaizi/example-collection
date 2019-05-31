"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ColorHelper {
    static copySRGBToLinear(color) {
        function SRGBToLinear(c) {
            return (c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
        }
        color.r = SRGBToLinear(color.r);
        color.g = SRGBToLinear(color.g);
        color.b = SRGBToLinear(color.b);
        return color;
    }
}
exports.ColorHelper = ColorHelper;
//# sourceMappingURL=ColorHelper.js.map