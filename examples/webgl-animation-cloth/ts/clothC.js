"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const constants_1 = require("./constants");
const clothFunction = require("./clothFunction");
/**
 * 布料相关类定义
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
        this.addForce = (force) => {
            this.a.add(this.tmp2.copy(force).multiplyScalar(this.invMass));
        };
        this.integrate = (timesq) => {
            let newPos = this.tmp.subVectors(this.position, this.previous);
            newPos.multiplyScalar(constants_1.ClothConstants.DRAG).add(this.position);
            newPos.add(this.a.multiplyScalar(timesq));
            this.tmp = this.previous;
            this.previous = this.position;
            this.position = newPos;
            this.a.set(0, 0, 0);
        };
        clothFunction(x, y, this.position);
        clothFunction(x, y, this.previous);
        clothFunction(x, y, this.original);
    }
}
exports.Particle = Particle;
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
exports.Constraint = Constraint;
/**
 * 布料类
 */
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
                this.particles.push(new Particle(u / w, v / h, 0, constants_1.ClothConstants.MASS));
            }
        }
        //结构
        for (let v = 0; v < h; v++) {
            for (let u = 0; u < w; u++) {
                this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u, v + 1)], constants_1.ClothConstants.restDistance));
                this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u + 1, v)], constants_1.ClothConstants.restDistance));
            }
        }
        for (let u = w, v = 0; v < h; v++) {
            this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u, v + 1)], constants_1.ClothConstants.restDistance));
        }
        for (let v = h, u = 0; u < w; u++) {
            this.constraints.push(new Constraint(this.particles[index(u, v)], this.particles[index(u + 1, v)], constants_1.ClothConstants.restDistance));
        }
    }
}
exports.Cloth = Cloth;
//# sourceMappingURL=clothC.js.map