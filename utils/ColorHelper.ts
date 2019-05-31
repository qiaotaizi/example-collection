import {Color} from "three";

export class ColorHelper {
    static copySRGBToLinear(color:Color):Color{
        function SRGBToLinear( c:number ):number {

            return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

        }
        color.r=SRGBToLinear(color.r);
        color.g=SRGBToLinear(color.g);
        color.b=SRGBToLinear(color.b);


        return color;
    }
}
