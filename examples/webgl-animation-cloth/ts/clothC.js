"use strict";
const three_1 = require("three");
/**
 * 布料计算相关代码
 */
/**
 * 粒子类
 */
class Particle {
    constructor(x, y, z, mass) {
        this.mass = mass;
        this.position = new three_1.Vector3();
        this.previous = new three_1.Vector3();
        this.original = new three_1.Vector3();
        this.a = new three_1.Vector3(0, 0, 0); //加速度表示
        this.invMass = 1 / this.mass;
        this.tmp = new three_1.Vector3();
        this.tmp2 = new three_1.Vector3();
        clothFunction(x, y, this.position);
        clothFunction(x, y, this.previous);
        clothFunction(x, y, this.original);
    }
}
/**
 * 约束类
 */
class Constraint {
    constructor(p1, p2, distance) {
        this.p1 = p1;
        this.p2 = p2;
        this.distance = distance;
    }
}
let restDistance = 25;
let xSegs = 10;
let ySegs = 10;
let MASS = 0.1;
let clothFunction = plane(restDistance * xSegs, restDistance * ySegs);
function plane(width, height) {
    return function (u, v, target) {
        let x = (u - 0.5) * width;
        let y = (v + 0.5) * height;
        let z = 0;
        target.set(x, y, z);
    };
}
class Cloth {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        /**
         * 粒子
         */
        this.particles = [];
        /**
         * 约束
         */
        this.constraints = [];
        function index(u, v) {
            return u + v * (w + 1);
        }
        //创建particles
        for (let v = 0; v <= h; v++) {
            for (let u = 0; u <= w; u++) {
                this.particles.push(new Particle(u / w, v / h, 0, MASS));
            }
        }
        //结构
        for (let v = 0; v < h; v++) {
            for (let u = 0; u < w; u++) {
                this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u, v + 1)], restDistance));
                this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u + 1, v)], restDistance));
            }
        }
        for (let u = w, v = 0; v < h; v++) {
            this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u, v + 1)], restDistance));
        }
        for (let v = h, u = 0; u < w; u++) {
            this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u + 1, v)], restDistance));
        }
    }
}
let cloth = new Cloth(xSegs, ySegs);
module.exports = { clothFunction, cloth };
//# sourceMappingURL=clothC.js.map