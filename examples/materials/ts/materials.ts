import {PerspectiveCamera, Scene, WebGLRenderer, GridHelper, Mesh, Material, Texture, MeshLambertMaterial, SphereBufferGeometry, Geometry, BufferGeometry, AmbientLight, DirectionalLight, PointLight, MeshBasicMaterial, MeshPhongMaterial} from "three";

let camera:PerspectiveCamera,scene:Scene,renderer:WebGLRenderer;

let pointLight:PointLight;

let winWidth=window.innerWidth,winHeight=window.innerHeight;

let objs:Array<Mesh>=[],mats:Array<Material>=[];

init();

bindEvent();

animate();

render();

function init() {
    camera=new PerspectiveCamera(45,winWidth/winHeight,1,2000);
    camera.position.set(0,200,800);

    scene=new Scene();

    //网格
    let helper=new GridHelper(1000,40,0x303030,0x303030);
    helper.position.y=-75;
    scene.add(helper);

    let texture=new Texture(generateTexture());
    texture.needsUpdate=true;

    //一种非光泽表面的材质，没有镜面高光。
    mats.push(new MeshLambertMaterial({map:texture,transparent:true}));
    mats.push(new MeshLambertMaterial({color:0xdddddd}));
    //一种用于具有镜面高光的光泽表面的材质。
    mats.push(new MeshPhongMaterial({color:0xdddddd,specular:0x009900,shininess:30,flatShading:true}));

    //球体数组
    let geo=new SphereBufferGeometry(70,32,16);
    for(let i=0,l=mats.length;i<l;i++){
        addMesh(geo,mats[i]);
    }

    scene.add(new AmbientLight(0x111111));
    let dirLight=new DirectionalLight(0xffffff,0.125);

    dirLight.position.x=Math.random()-0.5;
    dirLight.position.y=Math.random()-0.5;
    dirLight.position.z=Math.random()-0.5;

    dirLight.position.normalize();

    scene.add(dirLight);

    pointLight=new PointLight(0xffffff,1);
    scene.add(pointLight);

    pointLight.add(new Mesh(new SphereBufferGeometry(4,8,8),new MeshBasicMaterial({color:0xffffff})));

    renderer=new WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(winWidth,winHeight);
    document.body.appendChild(renderer.domElement);
}

function generateTexture():HTMLCanvasElement{
    let canvas=document.createElement('canvas');
    canvas.width=256;
    canvas.height=256;

    let context=canvas.getContext('2d');
    if(context){
        let image=context.getImageData(0,0,256,256);
        
        let y=0;
        for(let i=0,j=0,l=image.data.length;i<l;i+=4,j++){
            let x=j%256;
            if(x===0){
                y+=1;
            }
            image.data[i]=255;
            image.data[i+1]=255;
            image.data[i+2]=255;
            image.data[i+3]=Math.floor(x^y);
        }

        context.putImageData(image,0,0);
    }

    return canvas;
}

function addMesh(geo:BufferGeometry,mat:Material){
    let mesh=new Mesh(geo,mat);

    mesh.position.x=(objs.length%4)*200-400;
    mesh.position.z=Math.floor(objs.length/4)*200-200;

    mesh.rotation.x=Math.random()*200-100;
    mesh.rotation.y=Math.random()*200-100;
    mesh.rotation.z=Math.random()*200-100;

    objs.push(mesh);
    scene.add(mesh);
}

function bindEvent() {

}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {
    let timer=0.0001*Date.now();
    camera.position.x=Math.cos(timer)*1000;
    camera.position.z=Math.sin(timer)*1000;
    camera.lookAt(scene.position);

    for(let i=0,l=objs.length;i<l;i++){
        let obj=objs[i];
        obj.rotation.x+=0.01;
        obj.rotation.y+=0.005;
    }

    //mats[mats.length-2]

    pointLight.position.x=Math.sin(timer*7)*300;
    pointLight.position.y=Math.cos(timer*5)*400;
    pointLight.position.z=Math.cos(timer*3)*300;

    renderer.render(scene,camera);
}
