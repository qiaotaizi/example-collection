import {AnimationClip, Camera, DefaultLoadingManager, FileLoader, LoaderUtils, LoadingManager, Scene} from "three";
import {JDracoLoader} from "./JDracoLoader";
import {NameMap} from "./NameMap";


let BINARY_EXTENSION_BUFFER_NAME:string = 'binary_glTF';
let BINARY_EXTENSION_HEADER_MAGIC:string = 'glTF';
let BINARY_EXTENSION_HEADER_LENGTH:number = 12;
class BINARY_EXTENSION_CHUNK_TYPES{
    static readonly JSON:number= 0x4E4F534A;
    static readonly BIN:number= 0x004E4942;
}
class EXTENSIONS{
    static readonly KHR_BINARY_GLTF:string= 'KHR_binary_glTF';
    static readonly KHR_DRACO_MESH_COMPRESSION:string= 'KHR_draco_mesh_compression';
    static readonly KHR_LIGHTS_PUNCTUAL:string= 'KHR_lights_punctual';
    static readonly KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:string= 'KHR_materials_pbrSpecularGlossiness';
    static readonly KHR_MATERIALS_UNLIT:string= 'KHR_materials_unlit';
    static readonly KHR_TEXTURE_TRANSFORM:string= 'KHR_texture_transform';
    static readonly MSFT_TEXTURE_DDS:string= 'MSFT_texture_dds';
}

export class JGLTFLoader{

    manager:LoadingManager;
    dracoLoader:JDracoLoader | null;
    crossOrigin:string= 'anonymous';
    constructor(manager?:LoadingManager){
        this.manager=manager?manager:DefaultLoadingManager;
        this.dracoLoader=null;
    }

    // private resourcePath:string | undefined;
    //
    // private path:string | undefined;

    load(url: string,
         onLoad: (gltf: JGLTF) => void,
         onProgress?: (event: ProgressEvent) => void,
         onError?: (event: ErrorEvent) => void): void {

        let resourcePath:string= LoaderUtils.extractUrlBase( url );

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
        this.manager.itemStart( url );

        let _onError = ( e:ErrorEvent )=> {

            if ( onError ) {
                onError( e );
            } else {
                console.error( e );
            }
            this.manager.itemError( url );
            this.manager.itemEnd( url );

        };

        let loader = new FileLoader( this.manager );

        loader.setPath( resourcePath );
        loader.setResponseType( 'arraybuffer' );

        loader.load( url, ( data )=> {
            try {
                this.parse( data, resourcePath,( gltf:JGLTF )=> {
                    onLoad( gltf );
                    this.manager.itemEnd( url );
                }, _onError );
            } catch ( e ) {
                _onError( e );
            }
        }, onProgress, _onError );
    }

    parse(data: ArrayBuffer | string, path: string, onLoad: (gltf: JGLTF) => void, onError?: (event: ErrorEvent) => void): void{
        let content;
        let extensions:NameMap=[];

        if ( typeof data === 'string') {
            content = data;
        } else {
            let magic = LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

            if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

                try {

                    extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new JGLTFBinaryExtension( data );

                } catch ( error ) {

                    if ( onError ) onError( error );
                    return;

                }

                content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

            } else {

                content = LoaderUtils.decodeText( new Uint8Array( data ) );

            }

        }

        let json = JSON.parse( content );

        if ( !json.asset || json.asset.version[ 0 ] < 2 ) {

            if ( onError ) onError(
                new ErrorEvent('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.')
                //new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.' )
        );
            return;

        }

        if ( json.extensionsUsed ) {

            for ( let i = 0; i < json.extensionsUsed.length; ++ i ) {

                let extensionName = json.extensionsUsed[ i ];
                let extensionsRequired = json.extensionsRequired || [];

                switch ( extensionName ) {

                    case EXTENSIONS.KHR_LIGHTS_PUNCTUAL:
                        extensions[ extensionName ] = new JGLTFLightsExtension( json );
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

                        if ( extensionsRequired.indexOf( extensionName ) >= 0 ) {

                            console.warn( 'THREE.GLTFLoader: Unknown extension "' + extensionName + '".' );

                        }

                }

            }

        }

        let parser = new GLTFParser( json, extensions, {

            path: path,
            crossOrigin: this.crossOrigin,
            manager: this.manager

        } );

        // parser.parse( onLoad, onError );

    }

}

export interface JGLTF{
    animations: AnimationClip[];
    scene: Scene;
    scenes: Scene[];
    cameras: Camera[];
    asset: object;
}

class JGLTFBinaryExtension{

    data:ArrayBuffer;

    name:string = EXTENSIONS.KHR_BINARY_GLTF;
    content:string | undefined;
    body:ArrayBuffer | undefined;

    private headerView:DataView;

    header:{magic:string,version:number,length:number};

    constructor(data: ArrayBuffer){
        this.data=data;
        this.headerView=new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

        this.header={
            magic:LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
            version:this.headerView.getUint32( 4, true ),
            length:this.headerView.getUint32( 8, true )
        };

        if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

            throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );

        } else if ( this.header.version < 2.0 ) {

            throw new Error( 'THREE.GLTFLoader: Legacy binary file detected. Use LegacyGLTFLoader instead.' );

        }

        let chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
        let chunkIndex = 0;

        while ( chunkIndex < chunkView.byteLength ) {

            let chunkLength = chunkView.getUint32( chunkIndex, true );
            chunkIndex += 4;

            let chunkType = chunkView.getUint32( chunkIndex, true );
            chunkIndex += 4;

            if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

                let contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
                this.content = LoaderUtils.decodeText( contentArray );

            } else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

                let byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
                this.body = data.slice( byteOffset, byteOffset + chunkLength );

            }

            // Clients must ignore chunks with unknown types.

            chunkIndex += chunkLength;

        }

        if ( !this.content ) {

            throw new Error( 'THREE.GLTFLoader: JSON content not found.' );

        }

    }
}

class JGLTFLightsExtension{
    name:string;
    lightDefs:any;
    constructor( json:any ){
        this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
        let extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_LIGHTS_PUNCTUAL ] ) || {};
        this.lightDefs = extension.lights || [];
    }
}

class GLTFParser {

    json:any;
    extensions:NameMap;
    options:{
        path: string,
        crossOrigin: string,
        manager: LoadingManager
    };
    constructor(json:any, extensions:NameMap, options:{
        path: string,
        crossOrigin: string,
        manager: LoadingManager
    } ){
        this.json = json || {};
        this.extensions = extensions || {};
        this.options = options || {};
    }

    // // loader object cache
    // this.cache = new GLTFRegistry();
    //
    // // BufferGeometry caching
    // this.primitiveCache = {};
    //
    // this.textureLoader = new THREE.TextureLoader( this.options.manager );
    // this.textureLoader.setCrossOrigin( this.options.crossOrigin );
    //
    // this.fileLoader = new THREE.FileLoader( this.options.manager );
    // this.fileLoader.setResponseType( 'arraybuffer' );

}
