import {Vector3} from "three";

/**
 * 布料计算相关代码
 */

/**
 * 粒子类
 */
class Particle {
    position: Vector3 = new Vector3();
    previous: Vector3 = new Vector3();
    original: Vector3 = new Vector3();
    a: Vector3 = new Vector3(0, 0, 0);//加速度表示
    invMass = 1 / this.mass;
    tmp: Vector3 = new Vector3();
    tmp2: Vector3 = new Vector3();

    constructor(x: number, y: number, z: number, public mass: number) {
        clothFunction(x, y, this.position);
        clothFunction(x, y, this.previous);
        clothFunction(x, y, this.original);
    }
}

/**
 * 约束类
 */
class Constraint {
    constructor(public p1: Particle, public p2: Particle, public distance: number) {
    }
}

let restDistance = 25;

let xSegs = 10;
let ySegs = 10;

let MASS = 0.1;

let clothFunction = plane(restDistance * xSegs, restDistance * ySegs);

function plane(width: number, height: number): (u: number, v: number, target: Vector3) => void {
    return function (u: number, v: number, target: Vector3): void {
        let x = (u - 0.5) * width;
        let y = (v + 0.5) * height;
        let z = 0;
        target.set(x, y, z);
    }
}

class Cloth {
    /**
     * 粒子
     */
    particles: Array<Particle> = [];
    /**
     * 约束
     */
    constraints: Array<Constraint> = [];

    constructor(public w: number, public h: number) {
        function index(u: number, v: number): number {
            return u + v * (w + 1);
        }

        //创建particles
        for (let v = 0; v <= h; v++) {
            for (let u = 0; u <= w; u++) {
                this.particles.push(new Particle(u / w, v / h, 0, MASS))
            }
        }

        //结构
        for (let v = 0; v < h; v++) {
            for (let u = 0; u < w; u++) {
                this.constraints.push(
                    new Constraint(
                        this.particles[index(u, v)],
                        this.particles[index(u, v + 1)],
                        restDistance)
                );
                this.constraints.push(
                    new Constraint(
                        this.particles[index(u, v)],
                        this.particles[index(u+1, v)],
                        restDistance)
                );
            }
        }
        for (let u=w,v=0;v<h;v++){
            this.constraints.push(new Constraint(
                this.particles[index(u,v)],
                this.particles[index(u,v+1)],
                restDistance
            ));
        }
        for(let v=h,u=0;u<w;u++){
            this.constraints.push(new Constraint(
                this.particles[index(u,v)],
                this.particles[index(u+1,v)],
                restDistance
            ));
        }

    }
}

let cloth=new Cloth(xSegs,ySegs);

export = {clothFunction,cloth}
