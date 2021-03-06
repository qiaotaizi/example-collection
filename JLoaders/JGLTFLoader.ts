import {
    AnimationClip, BufferAttribute,
    Camera,
    DefaultLoadingManager,
    FileLoader, InterleavedBufferAttribute,
    LoaderUtils,
    LoadingManager,
    Scene,
    TextureLoader
} from "three";
import {JDracoLoader} from "./JDracoLoader";

let BINARY_EXTENSION_BUFFER_NAME: string = 'binary_glTF';
let BINARY_EXTENSION_HEADER_MAGIC: string = 'glTF';
let BINARY_EXTENSION_HEADER_LENGTH: number = 12;

class BINARY_EXTENSION_CHUNK_TYPES {
    static readonly JSON: number = 0x4E4F534A;
    static readonly BIN: number = 0x004E4942;
}

class EXTENSIONS {
    static readonly KHR_BINARY_GLTF: string = 'KHR_binary_glTF';
    static readonly KHR_DRACO_MESH_COMPRESSION: string = 'KHR_draco_mesh_compression';
    static readonly KHR_LIGHTS_PUNCTUAL: string = 'KHR_lights_punctual';
    static readonly KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: string = 'KHR_materials_pbrSpecularGlossiness';
    static readonly KHR_MATERIALS_UNLIT: string = 'KHR_materials_unlit';
    static readonly KHR_TEXTURE_TRANSFORM: string = 'KHR_texture_transform';
    static readonly MSFT_TEXTURE_DDS: string = 'MSFT_texture_dds';
}

export class JGLTFLoader {

    manager: LoadingManager;
    dracoLoader: JDracoLoader | null;
    crossOrigin: string = 'anonymous';

    constructor(manager?: LoadingManager) {
        this.manager = manager ? manager : DefaultLoadingManager;
        this.dracoLoader = null;
    }

    // private resourcePath:string | undefined;
    //
    // private path:string | undefined;

    load(url: string,
         onLoad: (gltf: JGLTF) => void,
         onProgress?: (event: ProgressEvent) => void,
         onError?: (event: ErrorEvent) => void): void {

        let resourcePath: string = LoaderUtils.extractUrlBase(url);

        //暂时不需要resourcePath和path属性,直接略过
        // if ( this.resourcePath ) {
        //     resourcePath = this.resourcePath;
        // } else if ( this.path ) {
        //     resourcePath = this.path;
        // } else {
        //     resourcePath = LoaderUtils.extractUrlBase( url );
        // }

        // Tells the LoadingManager to track an extra item, which resolves after
        // the model is fully loaded. This means the count of items loaded will
        // be incorrect, but ensures manager.onLoad() does not fire early.
        this.manager.itemStart(url);

        let _onError = (e: ErrorEvent) => {

            if (onError) {
                onError(e);
            } else {
                console.error(e);
            }
            this.manager.itemError(url);
            this.manager.itemEnd(url);

        };

        let loader = new FileLoader(this.manager);

        loader.setPath(resourcePath);
        loader.setResponseType('arraybuffer');

        loader.load(url, (data) => {
            try {
                this.parse(data, resourcePath, (gltf: JGLTF) => {
                    onLoad(gltf);
                    this.manager.itemEnd(url);
                }, _onError);
            } catch (e) {
                _onError(e);
            }
        }, onProgress, _onError);
    }

    parse(data: ArrayBuffer | string, path: string, onLoad: (gltf: JGLTF) => void, onError?: (event: ErrorEvent) => void): void {
        let content;
        //let extensions: NameMap = [];
        let extensions: Map<string, any> = new Map<string, any>();

        if (typeof data === 'string') {
            content = data;
        } else {
            let magic = LoaderUtils.decodeText(new Uint8Array(data, 0, 4));

            if (magic === BINARY_EXTENSION_HEADER_MAGIC) {

                try {

                    extensions.set(EXTENSIONS.KHR_BINARY_GLTF, new JGLTFBinaryExtension(data));

                } catch (error) {

                    if (onError) onError(error);
                    return;

                }

                content = extensions.get(EXTENSIONS.KHR_BINARY_GLTF).content;

            } else {

                content = LoaderUtils.decodeText(new Uint8Array(data));

            }

        }

        let json = JSON.parse(content);

        if (!json.asset || json.asset.version[0] < 2) {

            if (onError) onError(
                new ErrorEvent('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.')
                //new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.' )
            );
            return;

        }

        if (json.extensionsUsed) {

            for (let i = 0; i < json.extensionsUsed.length; ++i) {

                let extensionName = json.extensionsUsed[i];
                let extensionsRequired = json.extensionsRequired || [];

                switch (extensionName) {

                    case EXTENSIONS.KHR_LIGHTS_PUNCTUAL:
                        extensions.set(extensionName, new JGLTFLightsExtension(json));
                        //extensions[extensionName] = new JGLTFLightsExtension(json);
                        break;

                    case EXTENSIONS.KHR_MATERIALS_UNLIT:
                        // extensions.set(extensionName, new GLTFMaterialsUnlitExtension(json));
                        // extensions[extensionName] = new GLTFMaterialsUnlitExtension(json);
                        break;

                    case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
                        // extensions.set(extensionName, new GLTFMaterialsPbrSpecularGlossinessExtension(json));
                        // extensions[extensionName] = new GLTFMaterialsPbrSpecularGlossinessExtension(json);
                        break;

                    case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
                        // extensions.set(extensionName, new GLTFDracoMeshCompressionExtension(json, this.dracoLoader));
                        // extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
                        break;

                    case EXTENSIONS.MSFT_TEXTURE_DDS:
                        // extensions.set(extensionName, new GLTFTextureDDSExtension());
                        // extensions[EXTENSIONS.MSFT_TEXTURE_DDS] = new GLTFTextureDDSExtension();
                        break;

                    case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
                        // extensions.set(extensionName, new GLTFTextureTransformExtension(json));
                        // extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] = new GLTFTextureTransformExtension(json);
                        break;

                    default:

                        if (extensionsRequired.indexOf(extensionName) >= 0) {

                            console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');

                        }

                }

            }

        }

        let parser = new JGLTFParser(json, extensions, {

            path: path,
            crossOrigin: this.crossOrigin,
            manager: this.manager

        });

        parser.parse(onLoad, onError);

    }

}

export interface JGLTF {
    animations: AnimationClip[];
    scene: Scene;
    scenes: Scene[];
    cameras: Camera[];
    asset: object;
}

class JGLTFBinaryExtension {

    data: ArrayBuffer;

    name: string = EXTENSIONS.KHR_BINARY_GLTF;
    content: string | undefined;
    body: ArrayBuffer | undefined;

    private headerView: DataView;

    header: { magic: string, version: number, length: number };

    constructor(data: ArrayBuffer) {
        this.data = data;
        this.headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);

        this.header = {
            magic: LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
            version: this.headerView.getUint32(4, true),
            length: this.headerView.getUint32(8, true)
        };

        if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {

            throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');

        } else if (this.header.version < 2.0) {

            throw new Error('THREE.GLTFLoader: Legacy binary file detected. Use LegacyGLTFLoader instead.');

        }

        let chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
        let chunkIndex = 0;

        while (chunkIndex < chunkView.byteLength) {

            let chunkLength = chunkView.getUint32(chunkIndex, true);
            chunkIndex += 4;

            let chunkType = chunkView.getUint32(chunkIndex, true);
            chunkIndex += 4;

            if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {

                let contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
                this.content = LoaderUtils.decodeText(contentArray);

            } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {

                let byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
                this.body = data.slice(byteOffset, byteOffset + chunkLength);

            }

            // Clients must ignore chunks with unknown types.

            chunkIndex += chunkLength;

        }

        if (!this.content) {

            throw new Error('THREE.GLTFLoader: JSON content not found.');

        }

    }
}

class JGLTFLightsExtension {
    name: string;
    lightDefs: any;

    constructor(json: any) {
        this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
        let extension = (json.extensions && json.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL]) || {};
        this.lightDefs = extension.lights || [];
    }
}

class JGLTFParser {

    json: any;
    extensions: Map<string, any>;
    options: {
        path: string,
        crossOrigin: string,
        manager: LoadingManager
    };

    cache: JGLTFRegistry;
    primitiveCache: {};
    textureLoader: TextureLoader;
    fileLoader: FileLoader;

    constructor(json: any, extensions: Map<string, any>, options: {
        path: string,
        crossOrigin: string,
        manager: LoadingManager
    }) {
        this.json = json;
        this.extensions = extensions;
        this.options = options;

        // loader object cache
        this.cache = new JGLTFRegistry();

        // BufferGeometry caching
        this.primitiveCache = {};

        this.textureLoader = new TextureLoader(this.options.manager);
        this.textureLoader.setCrossOrigin(this.options.crossOrigin);

        this.fileLoader = new FileLoader(this.options.manager);
        this.fileLoader.setResponseType('arraybuffer');
    }

    parse(onLoad: (gltf: JGLTF) => void, onError?: (event: ErrorEvent) => void): void {

        let parser = this;
        let json = this.json;
        let extensions = this.extensions;

        // Clear the loader cache
        this.cache.removeAll();

        // Mark the special nodes/meshes in json for efficient parse
        this.markDefs();

        Promise.all([

            this.getDependencies('scene'),
            this.getDependencies('animation'),
            this.getDependencies('camera'),

        ]).then(function (dependencies) {

            let result = {
                scene: dependencies[0][json.scene || 0],
                scenes: dependencies[0],
                animations: dependencies[1],
                cameras: dependencies[2],
                asset: json.asset,
                parser: parser,
                userData: {}
            };

            // addUnknownExtensionsToUserData(extensions, result, json);

            onLoad(result);

        }).catch(onError);

    }

    /**
     * Marks the special nodes/meshes in json for efficient parse.
     */
    markDefs(): void {

        let nodeDefs = this.json.nodes || [];
        let skinDefs = this.json.skins || [];
        let meshDefs = this.json.meshes || [];

        let meshReferences = [];
        let meshUses = [];

        // Nothing in the node definition indicates whether it is a Bone or an
        // Object3D. Use the skins' joint references to mark bones.
        for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {

            let joints = skinDefs[skinIndex].joints;

            for (let i = 0, il = joints.length; i < il; i++) {

                nodeDefs[joints[i]].isBone = true;

            }

        }

        // Meshes can (and should) be reused by multiple nodes in a glTF asset. To
        // avoid having more than one THREE.Mesh with the same name, count
        // references and rename instances below.
        //
        // Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
        for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {

            let nodeDef = nodeDefs[nodeIndex];

            if (nodeDef.mesh !== undefined) {

                if (meshReferences[nodeDef.mesh] === undefined) {

                    meshReferences[nodeDef.mesh] = meshUses[nodeDef.mesh] = 0;

                }

                meshReferences[nodeDef.mesh]++;

                // Nothing in the mesh definition indicates whether it is
                // a SkinnedMesh or Mesh. Use the node's mesh reference
                // to mark SkinnedMesh if node has skin.
                if (nodeDef.skin !== undefined) {

                    meshDefs[nodeDef.mesh].isSkinnedMesh = true;

                }

            }

        }

        this.json.meshReferences = meshReferences;
        this.json.meshUses = meshUses;

    }

    /**
     * Requests the specified dependency asynchronously, with caching.
     * @param {string} type
     * @param {number} index
     * @return {Promise<THREE.Object3D|THREE.Material|THREE.Texture|THREE.AnimationClip|ArrayBuffer|Object>}
     */
    getDependency(type: string, index: number) {

        var cacheKey = type + ':' + index;
        var dependency = this.cache.get(cacheKey);

        if (!dependency) {

            switch (type) {

                case 'scene':
                    // dependency = this.loadScene(index);
                    break;

                case 'node':
                    // dependency = this.loadNode(index);
                    break;

                case 'mesh':
                    // dependency = this.loadMesh(index);
                    break;

                case 'accessor':
                    // dependency = this.loadAccessor(index);
                    break;

                case 'bufferView':
                    dependency = this.loadBufferView(index);
                    break;

                case 'buffer':
                    dependency = this.loadBuffer(index);
                    break;

                case 'material':
                    // dependency = this.loadMaterial(index);
                    break;

                case 'texture':
                    // dependency = this.loadTexture(index);
                    break;

                case 'skin':
                    // dependency = this.loadSkin(index);
                    break;

                case 'animation':
                    // dependency = this.loadAnimation(index);
                    break;

                case 'camera':
                    // dependency = this.loadCamera(index);
                    break;

                case 'light':
                    dependency = this.extensions.get(EXTENSIONS.KHR_LIGHTS_PUNCTUAL).loadLight(index);
                    break;

                default:
                    throw new Error('Unknown type: ' + type);

            }

            this.cache.add(cacheKey, dependency);

        }

        return dependency;

    }

    /**
     * Requests all dependencies of the specified type asynchronously, with caching.
     * @param {string} type
     * @return {Promise<Array<Object>>}
     */
    getDependencies(type: string) {

        let dependencies = this.cache.get(type);

        if (!dependencies) {

            let parser = this;
            let defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || [];

            dependencies = Promise.all(defs.map(function (value: any, index: number) {

                return parser.getDependency(type, index);

            }));

            this.cache.add(type, dependencies);

        }

        return dependencies;

    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferIndex
     * @return {Promise<ArrayBuffer>}
     */
    loadBuffer(bufferIndex: number) {

        let bufferDef = this.json.buffers[bufferIndex];
        let loader = this.fileLoader;

        if (bufferDef.type && bufferDef.type !== 'arraybuffer') {

            throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.');

        }

        // If present, GLB container is required to be the first buffer.
        if (bufferDef.uri === undefined && bufferIndex === 0) {

            return Promise.resolve(this.extensions.get(EXTENSIONS.KHR_BINARY_GLTF).body);

        }

        let options = this.options;

        return new Promise(function (resolve, reject) {

            // loader.load( resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {
            //
            //     reject( new Error( 'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".' ) );
            //
            // } );

        });

    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferViewIndex
     * @return {Promise<ArrayBuffer>}
     */
    loadBufferView(bufferViewIndex: number) {

        let bufferViewDef = this.json.bufferViews[bufferViewIndex];

        return this.getDependency('buffer', bufferViewDef.buffer).then(function (buffer: any) {

            let byteLength = bufferViewDef.byteLength || 0;
            let byteOffset = bufferViewDef.byteOffset || 0;
            return buffer.slice(byteOffset, byteOffset + byteLength);

        });

    }

}

class JGLTFRegistry {

    objects: Map<string, any>;

    constructor() {
        this.objects = new Map();
    }

    get(key: string): any {
        return this.objects.get(key);
    }

    add(key: string, value: any) {
        this.objects.set(key, value);
    }

    remove(key: string) {
        this.objects.delete(key);
    }

    removeAll() {
        this.objects.clear();
    }

}
