/**
 * @deprecated 准备用JGLTFLoader代替
 */
const GLTFLoader=require("three-gltf-loader");

function initGLTFLoader() {
    return new GLTFLoader();
}

export =initGLTFLoader;