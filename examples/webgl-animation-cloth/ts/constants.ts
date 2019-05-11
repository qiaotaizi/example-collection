/**
 * 全局常量
 */
export class ClothConstants{
    static DAMPING:number=0.03;
    static DRAG:number=1-ClothConstants.DAMPING;
    static restDistance:number = 25;
    static MASS:number= 0.1;
    static xSegs:number = 10;
    static ySegs:number = 10;
    static GRAVITY = 981 * 1.4;
    static TIMESTAMP = 18 / 1000;
    static TIMESTEP_SQ = ClothConstants.TIMESTAMP * ClothConstants.TIMESTAMP;
}
