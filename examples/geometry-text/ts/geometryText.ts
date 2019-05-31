import {Cache, PerspectiveCamera, Scene, WebGLRenderer} from "three";

let camera:PerspectiveCamera,scene:Scene,renderer:WebGLRenderer;

let winWidth=window.innerWidth,winHeight=window.innerHeight;

let text="three.js",height=20,size=70,hover=30;

let curveSegments=4,bevelThickness=2,bevelSize=1.5,bevelEnabled=true;

let fontName="optimer",fontWeight="bold";

let mirror=true;

let fontMap={
    "helvetiker": 0,
    "optimer": 1,
    "gentilis": 2,
    "droid/droid_sans": 3,
    "droid/droid_serif": 4
};

let weightMap={
    "regular": 0,
    "bold": 1
};

/**
 * 十进制转十六进制字符
 * @param d
 */
function decimal2Hex(d:number){
    let hex=d.toString(16);
    hex="000000".substr(0,6-hex.length)+hex;
    return hex.toUpperCase();
}

init();

bindEvent();

animate();

render();

function init() {
    // TODO api
    Cache.enabled=true;




}

function bindEvent() {

}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {

}
