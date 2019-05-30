"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const ColorHelper_1 = require("../../ColorHelper");
class LightProbeGenerator {
    static fromCubeTexture(cubeTexture) {
        let norm, lengthSq, weight, totalWeight = 0;
        let coord = new three_1.Vector3();
        let dir = new three_1.Vector3();
        let color = new three_1.Color();
        let shBasis = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let sh = new SphericalHarmonics3();
        let shCoefficients = sh.coefficients;
        for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
            let image = cubeTexture.image[faceIndex];
            let width = image.width;
            let height = image.height;
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let context = canvas.getContext('2d');
            let imageData;
            if (context) {
                context.drawImage(image, 0, 0, width, height);
                imageData = context.getImageData(0, 0, width, height);
            }
            else {
                console.warn("LightProbeGenerator get canvas 2d context failed, reture null");
                return null;
            }
            let data = imageData.data;
            let imageWidth = imageData.width; // assumed to be square
            let pixelSize = 2 / imageWidth;
            for (let i = 0, il = data.length; i < il; i += 4) { // RGBA assumed
                // pixel color
                color.setRGB(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
                // convert to linear color space
                color = ColorHelper_1.ColorHelper.copySRGBToLinear(color);
                // pixel coordinate on unit cube
                let pixelIndex = i / 4;
                let col = -1 + (pixelIndex % imageWidth + 0.5) * pixelSize;
                let row = 1 - (Math.floor(pixelIndex / imageWidth) + 0.5) * pixelSize;
                switch (faceIndex) {
                    case 0:
                        coord.set(-1, row, -col);
                        break;
                    case 1:
                        coord.set(1, row, col);
                        break;
                    case 2:
                        coord.set(-col, 1, -row);
                        break;
                    case 3:
                        coord.set(-col, -1, row);
                        break;
                    case 4:
                        coord.set(-col, row, 1);
                        break;
                    case 5:
                        coord.set(col, row, -1);
                        break;
                }
                // weight assigned to this pixel
                lengthSq = coord.lengthSq();
                weight = 4 / (Math.sqrt(lengthSq) * lengthSq);
                totalWeight += weight;
                // direction vector to this pixel
                dir.copy(coord).normalize();
                // evaluate SH basis functions in direction dir
                SphericalHarmonics3.getBasisAt(dir, shBasis);
                // accummuulate
                for (let j = 0; j < 9; j++) {
                    shCoefficients[j].x += shBasis[j] * color.r * weight;
                    shCoefficients[j].y += shBasis[j] * color.g * weight;
                    shCoefficients[j].z += shBasis[j] * color.b * weight;
                }
            }
        }
        // normalize
        norm = (4 * Math.PI) / totalWeight;
        for (let j = 0; j < 9; j++) {
            shCoefficients[j].x *= norm;
            shCoefficients[j].y *= norm;
            shCoefficients[j].z *= norm;
        }
        return new LightProbe(sh);
    }
}
exports.LightProbeGenerator = LightProbeGenerator;
class LightProbe extends three_1.Light {
    constructor(sh, intensity) {
        super(undefined, intensity);
        this.isLightProbe = true;
        this.sh = sh ? sh : new SphericalHarmonics3();
    }
    copy(source, recursive) {
        super.copy(source);
        this.sh.copy(source.sh);
        this.intensity = source.intensity;
        return this;
    }
    toJSON(meta) {
        super.toJSON(meta);
        let data = three_1.Light.prototype.toJSON.call(this, meta);
        // data.sh = this.sh.toArray(); // todo
        return data;
    }
}
exports.LightProbe = LightProbe;
class SphericalHarmonics3 {
    constructor() {
        this.isSphericalHarmonics3 = true;
        this.coefficients = new Array();
        for (let i = 0; i < 9; i++) {
            this.coefficients.push(new three_1.Vector3());
        }
    }
    set(coefficients) {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].copy(coefficients[i]);
        }
        return this;
    }
    zero() {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].set(0, 0, 0);
        }
        return this;
    }
    getAt(normal, target) {
        // normal is assumed to be unit length
        let x = normal.x, y = normal.y, z = normal.z;
        let coeff = this.coefficients;
        // band 0
        target = coeff[0].multiplyScalar(0.282095);
        // band 1
        target = target.add(coeff[1].multiplyScalar(0.488603 * y));
        target = target.add(coeff[2].multiplyScalar(0.488603 * z));
        target = target.add(coeff[3].multiplyScalar(0.488603 * x));
        // band 2
        target = target.add(coeff[4].multiplyScalar(1.092548 * (x * y)));
        target = target.add(coeff[5].multiplyScalar(1.092548 * (y * z)));
        target = target.add(coeff[6].multiplyScalar(0.315392 * (3.0 * z * z - 1.0)));
        target = target.add(coeff[7].multiplyScalar(1.092548 * (x * z)));
        target = target.add(coeff[8].multiplyScalar(0.546274 * (x * x - y * y)));
        return target;
    }
    getIrradianceAt(normal, target) {
        // normal is assumed to be unit length
        let x = normal.x, y = normal.y, z = normal.z;
        let coeff = this.coefficients;
        // band 0
        target = coeff[0].multiplyScalar(0.886227); // π * 0.282095
        // band 1
        target = target.add(coeff[1].multiplyScalar(2.0 * 0.511664 * y)); // ( 2 * π / 3 ) * 0.488603
        target = target.add(coeff[2].multiplyScalar(2.0 * 0.511664 * z));
        target = target.add(coeff[3].multiplyScalar(2.0 * 0.511664 * x));
        // band 2
        target = target.add(coeff[4].multiplyScalar(2.0 * 0.429043 * x * y)); // ( π / 4 ) * 1.092548
        target = target.add(coeff[5].multiplyScalar(2.0 * 0.429043 * y * z));
        target = target.add(coeff[6].multiplyScalar(0.743125 * z * z - 0.247708)); // ( π / 4 ) * 0.315392 * 3
        target = target.add(coeff[7].multiplyScalar(2.0 * 0.429043 * x * z));
        target = target.add(coeff[8].multiplyScalar(0.429043 * (x * x - y * y))); // ( π / 4 ) * 0.546274
        return target;
    }
    add(sh) {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].add(sh.coefficients[i]);
        }
        return this;
    }
    scale(s) {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].multiplyScalar(s);
        }
        return this;
    }
    lerp(sh, alpha) {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].lerp(sh.coefficients[i], alpha);
        }
        return this;
    }
    equals(sh) {
        for (let i = 0; i < 9; i++) {
            if (!this.coefficients[i].equals(sh.coefficients[i])) {
                return false;
            }
        }
        return true;
    }
    copy(sh) {
        return this.set(sh.coefficients);
    }
    clone() {
        return new SphericalHarmonics3().copy(this);
    }
    fromArray(array) {
        let coefficients = this.coefficients;
        for (let i = 0; i < 9; i++) {
            coefficients[i].fromArray(array, i * 3);
        }
        return this;
    }
    toArray() {
        let array = new Array();
        let coefficients = this.coefficients;
        for (let i = 0; i < 9; i++) {
            coefficients[i].toArray(array, i * 3);
        }
        return array;
    }
    // evaluate the basis functions
    // shBasis is an Array[ 9 ]
    static getBasisAt(normal, shBasis) {
        // normal is assumed to be unit length
        let x = normal.x, y = normal.y, z = normal.z;
        // band 0
        shBasis[0] = 0.282095;
        // band 1
        shBasis[1] = 0.488603 * y;
        shBasis[2] = 0.488603 * z;
        shBasis[3] = 0.488603 * x;
        // band 2
        shBasis[4] = 1.092548 * x * y;
        shBasis[5] = 1.092548 * y * z;
        shBasis[6] = 0.315392 * (3 * z * z - 1);
        shBasis[7] = 1.092548 * x * z;
        shBasis[8] = 0.546274 * (x * x - y * y);
    }
}
exports.SphericalHarmonics3 = SphericalHarmonics3;
//# sourceMappingURL=lightProbeC.js.map