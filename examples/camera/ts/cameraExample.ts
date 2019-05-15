import {PerspectiveCamera, Scene, WebGLRenderer} from "three";

let camera:PerspectiveCamera,scene:Scene,renderer:WebGLRenderer;

init();

animate();

function init() {
    camera=new PerspectiveCamera(50,0.5*window.innerWidth/window.innerHeight,1,10000);
    camera.position.z=2500;


    scene=new Scene();


    renderer=new WebGLRenderer({antialias:true});

    document.body.appendChild(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene,camera);
}