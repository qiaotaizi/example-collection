import {Vector3} from "three";

export class LightProbeGenerator {

}

export class LightProbe {
    constructor(public sh: SphericalHarmonics3) {

    }
}

export class SphericalHarmonics3 {
    coefficients: Array<Vector3>;

    isSphericalHarmonics3: boolean = true;

    constructor() {
        this.coefficients = new Array<Vector3>();
        for (let i = 0; i < 9; i++) {

            this.coefficients.push(new Vector3());

        }

    }

    set(coefficients: Array<Vector3>): SphericalHarmonics3 {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].copy(coefficients[i]);
        }
        return this;
    }

    zero(): SphericalHarmonics3 {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].set(0, 0, 0);
        }
        return this;
    }

    getAt(normal: Vector3, target: Vector3): Vector3 {
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

    getIrradianceAt(normal: Vector3, target: Vector3): Vector3 {
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

    add(sh: SphericalHarmonics3): SphericalHarmonics3 {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].add(sh.coefficients[i]);
        }
        return this;
    }

    scale(s: number): SphericalHarmonics3 {
        for (let i = 0; i < 9; i++) {
            this.coefficients[i].multiplyScalar(s);
        }
        return this;
    }

    lerp(sh: SphericalHarmonics3,alpha:number): SphericalHarmonics3 {

        for ( let i = 0; i < 9; i ++ ) {
            this.coefficients[ i ].lerp( sh.coefficients[ i ], alpha );
        }
        return this;
    }

    equals(sh: SphericalHarmonics3): boolean {

        for ( let i = 0; i < 9; i ++ ) {
            if ( ! this.coefficients[ i ].equals( sh.coefficients[ i ] ) ) {
                return false;
            }
        }

        return true;
    }

    copy(sh: SphericalHarmonics3): SphericalHarmonics3 {
        return this.set( sh.coefficients );
    }

    clone():SphericalHarmonics3 {
        return new SphericalHarmonics3().copy( this );
    }

    fromArray(array:Array<number>): SphericalHarmonics3 {

        let coefficients = this.coefficients;
        for ( let i = 0; i < 9; i ++ ) {
            coefficients[ i ].fromArray( array, i * 3 );
        }
        return this;

    }

    toArray(): Array<number> {

        let array = new Array<number>();
        let coefficients = this.coefficients;
        for ( let i = 0; i < 9; i ++ ) {
            coefficients[ i ].toArray( array, i * 3 );
        }
        return array;

    }
    
    // evaluate the basis functions
    // shBasis is an Array[ 9 ]
    static getBasisAt(normal:Vector3, shBasis:Array<number>): void {

        // normal is assumed to be unit length
        let x = normal.x, y = normal.y, z = normal.z;

        // band 0
        shBasis[ 0 ] = 0.282095;

        // band 1
        shBasis[ 1 ] = 0.488603 * y;
        shBasis[ 2 ] = 0.488603 * z;
        shBasis[ 3 ] = 0.488603 * x;

        // band 2
        shBasis[ 4 ] = 1.092548 * x * y;
        shBasis[ 5 ] = 1.092548 * y * z;
        shBasis[ 6 ] = 0.315392 * ( 3 * z * z - 1 );
        shBasis[ 7 ] = 1.092548 * x * z;
        shBasis[ 8 ] = 0.546274 * ( x * x - y * y );

    }

}