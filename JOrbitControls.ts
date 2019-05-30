import {
    EventDispatcher,
    Matrix4,
    MOUSE,
    OrthographicCamera,
    PerspectiveCamera,
    Quaternion,
    Spherical,
    Vector2,
    Vector3
} from "three";

//取代一些地方的this调用
let scope:JOrbitControls;

export class JOrbitControls extends EventDispatcher {

    camera: PerspectiveCamera | OrthographicCamera;

    domElement: HTMLElement;

    // "target" sets the location of focus, where the object orbits around
    target: Vector3 = new Vector3();
    // for reset
    target0: Vector3 = this.target.clone();
    position0: Vector3;
    zoom0: number;

    panLeft: (distance: number, objectMatrix: Matrix4) => void;

    panUp: (distance: number, objectMatrix: Matrix4) => void;

    pan: (deltaX: number, deltaY: number) => void;

    update: () => boolean;

    constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
        super();
        console.log(1);
        console.log(scope);
        this.camera = camera;
        this.domElement = domElement;
        this.position0 = this.camera.position.clone();
        this.zoom0 = this.camera.zoom;

        this.panLeft = (() => {
            let v = new Vector3();

            return (distance: number, objectMatrix: Matrix4): void => {

                v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
                v.multiplyScalar(-distance);

                this.panOffset.add(v);

            };

        })();

        this.panUp = (() => {

            let v = new Vector3();

            return (distance: number, objectMatrix: Matrix4): void => {

                if (this.screenSpacePanning) {

                    v.setFromMatrixColumn(objectMatrix, 1);

                } else {

                    v.setFromMatrixColumn(objectMatrix, 0);
                    v.crossVectors(this.camera.up, v);

                }

                v.multiplyScalar(distance);

                this.panOffset.add(v);

            }

        })();

        // deltaX and deltaY are in pixels; right and down are positive
        this.pan = (() => {
            let offset = new Vector3();

            return (deltaX: number, deltaY: number): void => {

                let element = this.domElement;

                if (this.camera instanceof PerspectiveCamera) {

                    // perspective
                    let position = this.camera.position;
                    offset.copy(position).sub(this.target);
                    let targetDistance = offset.length();

                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

                    // we use only clientHeight here so aspect ratio does not distort speed
                    this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.camera.matrix);
                    this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.camera.matrix);

                } else if (this.camera instanceof OrthographicCamera) {

                    // orthographic
                    this.panLeft(deltaX * (this.camera.right - this.camera.left) / this.camera.zoom / element.clientWidth, this.camera.matrix);
                    this.panUp(deltaY * (this.camera.top - this.camera.bottom) / this.camera.zoom / element.clientHeight, this.camera.matrix);

                } else {

                    // camera neither orthographic nor perspective
                    console.warn('WARNING: JOrbitControls.ts encountered an unknown camera type - pan disabled.');
                    this.enablePan = false;

                }

            };

        })();

        // this method is exposed, but perhaps it would be better if we can make it private...
        this.update = (() => {

            let offset = new Vector3();

            // so camera.up is the orbit axis
            let quat = new Quaternion().setFromUnitVectors(this.camera.up, new Vector3(0, 1, 0));
            let quatInverse = quat.clone().inverse();

            let lastPosition = new Vector3();
            let lastQuaternion = new Quaternion();

            return (): boolean => {

                let position = this.camera.position;

                offset.copy(position).sub(this.target);

                // rotate offset to "y-axis-is-up" space
                offset.applyQuaternion(quat);

                // angle from z-axis around y-axis
                this.spherical.setFromVector3(offset);

                if (this.autoRotate && this.state === STATE.NONE) {

                    this.rotateLeft(this.getAutoRotationAngle());

                }

                this.spherical.theta += this.sphericalDelta.theta;
                this.spherical.phi += this.sphericalDelta.phi;

                // restrict theta to be between desired limits
                this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));

                // restrict phi to be between desired limits
                this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

                this.spherical.makeSafe();


                this.spherical.radius *= this.scale;

                // restrict radius to be between desired limits
                this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

                // move target to panned location
                this.target.add(this.panOffset);

                offset.setFromSpherical(this.spherical);

                // rotate offset back to "camera-up-vector-is-up" space
                offset.applyQuaternion(quatInverse);

                position.copy(this.target).add(offset);

                this.camera.lookAt(this.target);

                if (this.enableDamping) {

                    this.sphericalDelta.theta *= (1 - this.dampingFactor);
                    this.sphericalDelta.phi *= (1 - this.dampingFactor);

                    this.panOffset.multiplyScalar(1 - this.dampingFactor);

                } else {

                    this.sphericalDelta.set(0, 0, 0);

                    this.panOffset.set(0, 0, 0);

                }

                this.scale = 1;

                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                if (this.zoomChanged ||
                    lastPosition.distanceToSquared(this.camera.position) > this.EPS ||
                    8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > this.EPS) {

                    this.dispatchEvent(this.changeEvent);

                    lastPosition.copy(this.camera.position);
                    lastQuaternion.copy(this.camera.quaternion);
                    this.zoomChanged = false;

                    return true;

                }

                return false;

            };

        })();

        scope=this;

        this.domElement.addEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('wheel', this.onMouseWheel, false);
        this.domElement.addEventListener('touchstart', this.onTouchStart, false);
        this.domElement.addEventListener('touchend', this.onTouchEnd, false);
        this.domElement.addEventListener('touchmove', this.onTouchMove, false);
        window.addEventListener('keydown', this.onKeyDown, false);

        // force an update at start
        this.update();

        console.log(2);
        console.log(scope);
    }

    // Set to false to disable this control
    enabled: boolean = true;

    // How far you can dolly in and out ( PerspectiveCamera only )
    minDistance: number = 0;
    maxDistance: number = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    minZoom: number = 0;
    maxZoom: number = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    minPolarAngle: number = 0;
    maxPolarAngle: number = Math.PI;

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    minAzimuthAngle = -Infinity;
    maxAzimuthAngle = Infinity;

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    enableDamping: boolean = false;
    dampingFactor: number = 0.25;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    enableZoom: boolean = true;
    zoomSpeed: number = 1.0;

    // Set to false to disable rotating
    enableRotate: boolean = true;
    rotateSpeed: number = 1.0;

    // Set to false to disable panning
    enablePan: boolean = true;
    panSpeed: number = 1.0;
    screenSpacePanning: boolean = false; // if true, pan in screen-space
    keyPanSpeed: number = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    autoRotate: boolean = false;
    autoRotateSpeed: number = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    enableKeys: boolean = true;

    // The four arrow keys
    keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};

    private changeEvent = {type: 'change'};
    private startEvent = {type: 'start'};
    private endEvent = {type: 'end'};

    private state = STATE.NONE;

    private EPS = 0.000001;

    // current position in spherical coordinates
    private spherical = new Spherical();
    private sphericalDelta = new Spherical();

    private scale = 1;
    private panOffset = new Vector3();
    private zoomChanged = false;

    private rotateStart = new Vector2();
    private rotateEnd = new Vector2();
    private rotateDelta = new Vector2();

    private panStart = new Vector2();
    private panEnd = new Vector2();
    private panDelta = new Vector2();

    private dollyStart = new Vector2();
    private dollyEnd = new Vector2();
    private dollyDelta = new Vector2();

    getPolarAngle(): number {
        return this.spherical.phi;
    }

    getAzimuthalAngle(): number {
        return this.spherical.theta;
    };

    saveState(): void {
        this.target0.copy(this.target);
        this.position0.copy(this.camera.position);
        this.zoom0 = this.camera.zoom;

    };

    reset(): void {
        this.target.copy(this.target0);
        this.camera.position.copy(this.position0);
        this.camera.zoom = this.zoom0;

        this.camera.updateProjectionMatrix();
        this.dispatchEvent(this.changeEvent);

        this.update();

        this.state = STATE.NONE;
    };

    dispose(): void {

        this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.domElement.removeEventListener('wheel', this.onMouseWheel, false);

        this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
        this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
        this.domElement.removeEventListener('touchmove', this.onTouchMove, false);

        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);

        window.removeEventListener('keydown', this.onKeyDown, false);

        //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

    };

    getAutoRotationAngle(): number {

        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;

    }

    getZoomScale(): number {

        return Math.pow(0.95, this.zoomSpeed);

    }

    rotateLeft(angle: number): void {
        this.sphericalDelta.theta -= angle;
    }

    rotateUp(angle: number): void {
        this.sphericalDelta.phi -= angle;
    }

    dollyIn(dollyScale: number): void {

        if (this.camera instanceof PerspectiveCamera) {

            this.scale /= dollyScale;

        } else if (this.camera instanceof OrthographicCamera) {

            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {
            console.warn('WARNING: JOrbitControls.ts encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;
        }

    }

    dollyOut(dollyScale: number): void {

        if (this.camera instanceof PerspectiveCamera) {

            this.scale *= dollyScale;

        } else if (this.camera instanceof OrthographicCamera) {

            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom / dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;

        } else {

            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;

        }

    }

    //
    // event callbacks - update the object state
    //

    handleMouseDownRotate(event: MouseEvent): void {

        // console.log('handleMouseDownRotate');

        scope.rotateStart.set(event.clientX, event.clientY);

    }

    handleMouseDownDolly(event: MouseEvent) {

        // console.log('handleMouseDownDolly');

        scope.dollyStart.set(event.clientX, event.clientY);

    }

    handleMouseDownPan(event: MouseEvent) {

        // console.log('handleMouseDownPan');

        scope.panStart.set(event.clientX, event.clientY);

    }

    handleMouseMoveRotate(event: MouseEvent) {

        // console.log('handleMouseMoveRotate');

        scope.rotateEnd.set(event.clientX, event.clientY);

        scope.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

        let element = this.domElement;

        scope.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

        scope.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

        scope.rotateStart.copy(this.rotateEnd);

        scope.update();

    }

    handleMouseMoveDolly(event: MouseEvent) {

        // console.log('handleMouseMoveDolly');

        scope.dollyEnd.set(event.clientX, event.clientY);

        scope.dollyDelta.subVectors(scope.dollyEnd, scope.dollyStart);

        if (scope.dollyDelta.y > 0) {

            scope.dollyIn(this.getZoomScale());

        } else if (scope.dollyDelta.y < 0) {

            scope.dollyOut(scope.getZoomScale());

        }

        scope.dollyStart.copy(scope.dollyEnd);

        scope.update();

    }

    handleMouseMovePan(event: MouseEvent) {

        // console.log('handleMouseMovePan');

        scope.panEnd.set(event.clientX, event.clientY);

        scope.panDelta.subVectors(scope.panEnd, scope.panStart).multiplyScalar(scope.panSpeed);

        scope.pan(scope.panDelta.x, scope.panDelta.y);

        scope.panStart.copy(scope.panEnd);

        scope.update();

    }

    handleMouseUp(event: MouseEvent) {

        // console.log('handleMouseUp');

    }

    handleMouseWheel(event: MouseWheelEvent) {

        // console.log('handleMouseWheel');

        if (event.deltaY < 0) {

            scope.dollyOut(scope.getZoomScale());

        } else if (event.deltaY > 0) {

            scope.dollyIn(scope.getZoomScale());

        }

        scope.update();

    }

    handleKeyDown(event: KeyboardEvent) {

        // console.log('handleKeyDown');

        let needsUpdate = false;

        switch (event.keyCode) {

            case scope.keys.UP:
                scope.pan(0, scope.keyPanSpeed);
                needsUpdate = true;
                break;

            case scope.keys.BOTTOM:
                scope.pan(0, -scope.keyPanSpeed);
                needsUpdate = true;
                break;

            case scope.keys.LEFT:
                scope.pan(scope.keyPanSpeed, 0);
                needsUpdate = true;
                break;

            case scope.keys.RIGHT:
                scope.pan(-scope.keyPanSpeed, 0);
                needsUpdate = true;
                break;
        }

        if (needsUpdate) {

            // prevent the browser from scrolling on cursor keys
            event.preventDefault();

            scope.update();

        }


    }

    handleTouchStartRotate(event: TouchEvent) {

        // console.log('handleTouchStartRotate');

        scope.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

    }

    handleTouchStartDollyPan(event: TouchEvent) {

        // console.log('handleTouchStartDollyPan');

        if (scope.enableZoom) {

            let dx = event.touches[0].pageX - event.touches[1].pageX;
            let dy = event.touches[0].pageY - event.touches[1].pageY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            scope.dollyStart.set(0, distance);

        }

        if (scope.enablePan) {

            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            scope.panStart.set(x, y);

        }

    }

    handleTouchMoveRotate(event: TouchEvent) {

        // console.log('handleTouchMoveRotate');

        scope.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

        scope.rotateDelta.subVectors(scope.rotateEnd, scope.rotateStart).multiplyScalar(scope.rotateSpeed);

        let element = scope.domElement;

        scope.rotateLeft(2 * Math.PI * scope.rotateDelta.x / element.clientHeight); // yes, height

        scope.rotateUp(2 * Math.PI * scope.rotateDelta.y / element.clientHeight);

        scope.rotateStart.copy(scope.rotateEnd);

        scope.update();

    }

    handleTouchMoveDollyPan(event: TouchEvent) {

        // console.log('handleTouchMoveDollyPan');

        if (scope.enableZoom) {

            let dx = event.touches[0].pageX - event.touches[1].pageX;
            let dy = event.touches[0].pageY - event.touches[1].pageY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            scope.dollyEnd.set(0, distance);

            scope.dollyDelta.set(0, Math.pow(scope.dollyEnd.y / scope.dollyStart.y, scope.zoomSpeed));

            scope.dollyIn(scope.dollyDelta.y);

            scope.dollyStart.copy(scope.dollyEnd);

        }

        if (scope.enablePan) {

            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            scope.panEnd.set(x, y);

            scope.panDelta.subVectors(scope.panEnd, scope.panStart).multiplyScalar(scope.panSpeed);

            scope.pan(scope.panDelta.x, scope.panDelta.y);

            scope.panStart.copy(scope.panEnd);

        }

        scope.update();

    }

    handleTouchEnd(event: TouchEvent) {

        // console.log('handleTouchEnd');

    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    onMouseMove(event: MouseEvent) {

        if (!scope.enabled) return;

        event.preventDefault();

        switch (scope.state) {

            case STATE.ROTATE:

                if (!scope.enableRotate) return;

                scope.handleMouseMoveRotate(event);

                break;

            case STATE.DOLLY:

                if (!scope.enableZoom) return;

                scope.handleMouseMoveDolly(event);

                break;

            case STATE.PAN:

                if (!scope.enablePan) return;

                scope.handleMouseMovePan(event);

                break;

        }

    }

    onMouseDown(event: MouseEvent) {
        if (!scope.enabled) return;

        // Prevent the browser from scrolling.

        event.preventDefault();

        // Manually set the focus since calling preventDefault above
        // prevents the browser from setting it automatically.

        scope.domElement.focus ? scope.domElement.focus() : window.focus();

        switch (event.button) {

            case MOUSE.LEFT:

                if (event.ctrlKey || event.metaKey || event.shiftKey) {

                    if (!scope.enablePan) return;

                    scope.handleMouseDownPan(event);

                    scope.state = STATE.PAN;

                } else {

                    if (!scope.enableRotate) return;

                    scope.handleMouseDownRotate(event);

                    scope.state = STATE.ROTATE;

                }

                break;

            case MOUSE.MIDDLE:

                if (!scope.enableZoom) return;

                scope.handleMouseDownDolly(event);

                scope.state = STATE.DOLLY;

                break;

            case MOUSE.RIGHT:

                if (!scope.enablePan) return;

                scope.handleMouseDownPan(event);

                scope.state = STATE.PAN;

                break;

        }

        if (scope.state !== STATE.NONE) {

            document.addEventListener('mousemove', scope.onMouseMove, false);
            document.addEventListener('mouseup', scope.onMouseUp, false);

            scope.dispatchEvent(scope.startEvent);

        }

    }

    onMouseUp(event: MouseEvent) {

        if (!scope.enabled) return;

        scope.handleMouseUp(event);

        document.removeEventListener('mousemove', scope.onMouseMove, false);
        document.removeEventListener('mouseup', scope.onMouseUp, false);

        scope.dispatchEvent(scope.endEvent);

        scope.state = STATE.NONE;

    }

    onMouseWheel(event: MouseWheelEvent) {

        if (!scope.enabled ||
            !scope.enableZoom ||
            (scope.state !== STATE.NONE &&
                scope.state !== STATE.ROTATE)) return;

        event.preventDefault();
        event.stopPropagation();

        scope.dispatchEvent(scope.startEvent);

        scope.handleMouseWheel(event);

        scope.dispatchEvent(scope.endEvent);

    }

    onKeyDown(event: KeyboardEvent) {
        if (!scope.enabled || !scope.enableKeys || !scope.enablePan) return;

        scope.handleKeyDown(event);

    }

    onTouchStart(event: TouchEvent) {

        if (!scope.enabled) return;

        event.preventDefault();

        switch (event.touches.length) {

            case 1:	// one-fingered touch: rotate

                if (!scope.enableRotate) return;

                scope.handleTouchStartRotate(event);

                scope.state = STATE.TOUCH_ROTATE;

                break;

            case 2:	// two-fingered touch: dolly-pan

                if (!scope.enableZoom && !scope.enablePan) return;

                scope.handleTouchStartDollyPan(event);

                scope.state = STATE.TOUCH_DOLLY_PAN;

                break;

            default:

                scope.state = STATE.NONE;

        }

        if (scope.state !== STATE.NONE) {

            scope.dispatchEvent(scope.startEvent);

        }

    }

    onTouchMove(event: TouchEvent) {

        if (!scope.enabled) return;

        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (!scope.enableRotate) return;
                if (scope.state !== STATE.TOUCH_ROTATE) return; // is this needed?

                scope.handleTouchMoveRotate(event);

                break;

            case 2: // two-fingered touch: dolly-pan

                if (!scope.enableZoom && !scope.enablePan) return;
                if (scope.state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?

                scope.handleTouchMoveDollyPan(event);

                break;

            default:

                scope.state = STATE.NONE;

        }

    }

    onTouchEnd(event: TouchEvent) {

        if (!scope.enabled) return;

        scope.handleTouchEnd(event);

        scope.dispatchEvent(scope.endEvent);

        scope.state = STATE.NONE;

    }

    onContextMenu(event: MouseEvent) {

        if (!scope.enabled) return;

        event.preventDefault();

    }

}

class STATE {
    static NONE = -1;
    static ROTATE = 0;
    static DOLLY = 1;
    static PAN = 2;
    static TOUCH_ROTATE = 3;
    static TOUCH_DOLLY_PAN = 4;
}

//旧api
//center=>target

//noZoom=>enableZoom;

//noRotate=>enableRotate

//noPan=>enablePan

//noKeys=>enableKeys 

//staticMoving=>enableDamping

//dynamicDampingFactor=>dampingFactor
