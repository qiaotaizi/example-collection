import {
    BoxBufferGeometry,
    Color,
    Fog,
    Group,
    Mesh,
    MeshNormalMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from "three";


let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let group: Group;

let mouseX = 0;
let mouseY = 0;

let windowHalfX: number;
let windowHalfY: number;

function init() {
    windowHalfX = window.innerWidth * 0.5;
    windowHalfY = window.innerHeight * 0.5;
    camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;

    scene = new Scene();
    scene.background = new Color(0xffffff);
    scene.fog = new Fog(0xffffff, 1, 10000);

    let geo = new BoxBufferGeometry(100, 100, 100);
    let mat = new MeshNormalMaterial();

    group = new Group();

    for (let i = 0; i < 1000; i++) {
        let mesh = new Mesh(geo, mat);
        mesh.position.set(Math.random() * 2000 - 1000, Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;

        mesh.matrixAutoUpdate = true;
        mesh.updateMatrix();

        group.add(mesh);
    }

    scene.add(group);

    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function bindEvent(): void {
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function onDocumentMouseMove(event: MouseEvent): any {
    mouseX = (event.clientX - windowHalfX) * 10;
    mouseY = (event.clientY - windowHalfY) * 10;
}

function animate(): void {
    requestAnimationFrame(animate);
    render();
}

function render() {
    let time = Date.now() * 0.001;
    let rx = Math.sin(time * 0.7) * 0.5,
        ry = Math.sin(time * 0.3) * 0.5,
        rz = Math.sin(time * 0.2) * 0.5;
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;

    camera.lookAt(scene.position);

    group.rotation.x = rx;
    group.rotation.y = ry;
    group.rotation.z = rz;

    renderer.render(scene,camera);
}

init();

bindEvent();

animate();

