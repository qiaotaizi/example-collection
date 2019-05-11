import {Vector3} from "three";
import {ClothConstants} from "./constants";
const clothFunction=require("./clothFunction");
/**
 * 布料相关类定义
 */

/**
 * 粒子类
 */
export class Particle {
    position: Vector3 = new Vector3();
    previous: Vector3 = new Vector3();
    original: Vector3 = new Vector3();
    a: Vector3 = new Vector3(0, 0, 0);//加速度表示
    invMass = 1 / this.mass;
    tmp: Vector3 = new Vector3();
    tmp2: Vector3 = new Vector3();
    addForce=(force:Vector3)=>{
      this.a.add(
        this.tmp2.copy(force).multiplyScalar(this.invMass));
    };
    integrate=(timesq:number)=>{
        let newPos=this.tmp.subVectors(this.position,this.previous);
        newPos.multiplyScalar(ClothConstants.DRAG).add(this.position);
        newPos.add(this.a.multiplyScalar(timesq));

        this.tmp=this.previous;
        this.previous=this.position;
        this.position=newPos;

        this.a.set(0,0,0);
    };
    constructor(x: number, y: number, z: number, public mass: number) {
        clothFunction(x, y, this.position);
        clothFunction(x, y, this.previous);
        clothFunction(x, y, this.original);
    }
}

/**
 * 约束类
 */
export class Constraint {
    constructor(public p1: Particle, public p2: Particle, public distance: number) {
    }
}

/**
 * 布料类
 */
export class Cloth {
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
                this.particles.push(new Particle(u / w, v / h, 0, ClothConstants.MASS))
            }
        }

        //结构
        for (let v = 0; v < h; v++) {
            for (let u = 0; u < w; u++) {
                this.constraints.push(
                    new Constraint(
                        this.particles[index(u, v)],
                        this.particles[index(u, v + 1)],
                        ClothConstants.restDistance)
                );
                this.constraints.push(
                    new Constraint(
                        this.particles[index(u, v)],
                        this.particles[index(u+1, v)],
                        ClothConstants.restDistance)
                );
            }
        }
        for (let u=w,v=0;v<h;v++){
            this.constraints.push(new Constraint(
                this.particles[index(u,v)],
                this.particles[index(u,v+1)],
                ClothConstants.restDistance
            ));
        }
        for(let v=h,u=0;u<w;u++){
            this.constraints.push(new Constraint(
                this.particles[index(u,v)],
                this.particles[index(u+1,v)],
                ClothConstants.restDistance
            ));
        }

    }
}
