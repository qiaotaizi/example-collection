"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
let BINARY_EXTENSION_BUFFER_NAME = 'binary_glTF';
let BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
let BINARY_EXTENSION_HEADER_LENGTH = 12;
class BINARY_EXTENSION_CHUNK_TYPES {
}
BINARY_EXTENSION_CHUNK_TYPES.JSON = 0x4E4F534A;
BINARY_EXTENSION_CHUNK_TYPES.BIN = 0x004E4942;
class EXTENSIONS {
}
EXTENSIONS.KHR_BINARY_GLTF = 'KHR_binary_glTF';
EXTENSIONS.KHR_DRACO_MESH_COMPRESSION = 'KHR_draco_mesh_compression';
EXTENSIONS.KHR_LIGHTS_PUNCTUAL = 'KHR_lights_punctual';
EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS = 'KHR_materials_pbrSpecularGlossiness';
EXTENSIONS.KHR_MATERIALS_UNLIT = 'KHR_materials_unlit';
EXTENSIONS.KHR_TEXTURE_TRANSFORM = 'KHR_texture_transform';
EXTENSIONS.MSFT_TEXTURE_DDS = 'MSFT_texture_dds';
class JGLTFLoader {
    constructor(manager) {
        this.crossOrigin = 'anonymous';
        this.manager = manager ? manager : three_1.DefaultLoadingManager;
        this.dracoLoader = null;
    }
    // private resourcePath:string | undefined;
    //
    // private path:string | undefined;
    load(url, onLoad, onProgress, onError) {
        let resourcePath = three_1.LoaderUtils.extractUrlBase(url);
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
        let _onError = (e) => {
            if (onError) {
                onError(e);
            }
            else {
                console.error(e);
            }
            this.manager.itemError(url);
            this.manager.itemEnd(url);
        };
        let loader = new three_1.FileLoader(this.manager);
        loader.setPath(resourcePath);
        loader.setResponseType('arraybuffer');
        loader.load(url, (data) => {
            try {
                this.parse(data, resourcePath, (gltf) => {
                    onLoad(gltf);
                    this.manager.itemEnd(url);
                }, _onError);
            }
            catch (e) {
                _onError(e);
            }
        }, onProgress, _onError);
    }
    parse(data, path, onLoad, onError) {
        let content;
        let extensions = [];
        if (typeof data === 'string') {
            content = data;
        }
        else {
            let magic = three_1.LoaderUtils.decodeText(new Uint8Array(data, 0, 4));
            if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
                try {
                    extensions[EXTENSIONS.KHR_BINARY_GLTF] = new JGLTFBinaryExtension(data);
                }
                catch (error) {
                    if (onError)
                        onError(error);
                    return;
                }
                content = extensions[EXTENSIONS.KHR_BINARY_GLTF].content;
            }
            else {
                content = three_1.LoaderUtils.decodeText(new Uint8Array(data));
            }
        }
        let json = JSON.parse(content);
        if (!json.asset || json.asset.version[0] < 2) {
            if (onError)
                onError(new ErrorEvent('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.')
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
                        extensions[extensionName] = new JGLTFLightsExtension(json);
                        break;
                    case EXTENSIONS.KHR_MATERIALS_UNLIT:
                        // extensions[ extensionName ] = new GLTFMaterialsUnlitExtension( json );
                        break;
                    case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
                        // extensions[ extensionName ] = new GLTFMaterialsPbrSpecularGlossinessExtension( json );
                        break;
                    case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
                        // extensions[ extensionName ] = new GLTFDracoMeshCompressionExtension( json, this.dracoLoader );
                        break;
                    case EXTENSIONS.MSFT_TEXTURE_DDS:
                        // extensions[ EXTENSIONS.MSFT_TEXTURE_DDS ] = new GLTFTextureDDSExtension();
                        break;
                    case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
                        // extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] = new GLTFTextureTransformExtension( json );
                        break;
                    default:
                        if (extensionsRequired.indexOf(extensionName) >= 0) {
                            console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');
                        }
                }
            }
        }
        let parser = new GLTFParser(json, extensions, {
            path: path,
            crossOrigin: this.crossOrigin,
            manager: this.manager
        });
        // parser.parse( onLoad, onError );
    }
}
exports.JGLTFLoader = JGLTFLoader;
class JGLTFBinaryExtension {
    constructor(data) {
        this.name = EXTENSIONS.KHR_BINARY_GLTF;
        this.data = data;
        this.headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
        this.header = {
            magic: three_1.LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
            version: this.headerView.getUint32(4, true),
            length: this.headerView.getUint32(8, true)
        };
        if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
            throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');
        }
        else if (this.header.version < 2.0) {
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
                this.content = three_1.LoaderUtils.decodeText(contentArray);
            }
            else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
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
    constructor(json) {
        this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
        let extension = (json.extensions && json.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL]) || {};
        this.lightDefs = extension.lights || [];
    }
}
class GLTFParser {
    constructor(json, extensions, options) {
        this.json = json || {};
        this.extensions = extensions || {};
        this.options = options || {};
    }
}
//# sourceMappingURL=JGLTFLoader.js.map