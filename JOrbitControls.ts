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

export class JOrbitControls extends EventDispatcher {

    // "target" sets the location of focus, where the object orbits around
    target: Vector3 = new Vector3();
    // for reset
    target0: Vector3 = this.target.clone();
    position0: Vector3;
    zoom0:number;

    constructor(public camera: PerspectiveCamera | OrthographicCamera, public domElement: HTMLElement) {
        super();

        this.position0 = this.camera.position.clone();
        this.zoom0=this.camera.zoom;

        this.domElement.addEventListener('contextmenu', this.onContextMenu, false);

        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('wheel', this.onMouseWheel, false);

        this.domElement.addEventListener('touchstart', this.onTouchStart, false);
        this.domElement.addEventListener('touchend', this.onTouchEnd, false);
        this.domElement.addEventListener('touchmove', this.onTouchMove, false);

        window.addEventListener('keydown', this.onKeyDown, false);

        console.log("events added");
        console.log("constructor");
        console.log(this);
        console.log(this.camera);
        console.log(this.zoom0);
        // force an update at start
        this.update();
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

    panLeft: (distance: number, objectMatrix: Matrix4) => void = (() => {
        let v = new Vector3();

        return (distance: number, objectMatrix: Matrix4): void => {

            v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
            v.multiplyScalar(-distance);

            this.panOffset.add(v);

        };

    })();

    panUp: (distance: number, objectMatrix: Matrix4) => void = (() => {

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
    pan: (deltaX: number, deltaY: number) => void = (() => {
        let offset = new Vector3();

        return (deltaX: number, deltaY: number): void => {

            let element = this.domElement;

            if (this.camera instanceof PerspectiveCamera) {

                // perspective
                var position = this.camera.position;
                offset.copy(position).sub(this.target);
                var targetDistance = offset.length();

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

        //console.log( 'handleMouseDownRotate' );

        this.rotateStart.set(event.clientX, event.clientY);

    }

    handleMouseDownDolly(event: MouseEvent) {

        //console.log( 'handleMouseDownDolly' );

        this.dollyStart.set(event.clientX, event.clientY);

    }

    handleMouseDownPan(event: MouseEvent) {

        //console.log( 'handleMouseDownPan' );

        this.panStart.set(event.clientX, event.clientY);

    }

    handleMouseMoveRotate(event: MouseEvent) {

        //console.log( 'handleMouseMoveRotate' );

        this.rotateEnd.set(event.clientX, event.clientY);

        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

        let element = this.domElement;

        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

        this.rotateStart.copy(this.rotateEnd);

        this.update();

    }

    handleMouseMoveDolly(event: MouseEvent) {

        //console.log( 'handleMouseMoveDolly' );

        this.dollyEnd.set(event.clientX, event.clientY);

        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

        if (this.dollyDelta.y > 0) {

            this.dollyIn(this.getZoomScale());

        } else if (this.dollyDelta.y < 0) {

            this.dollyOut(this.getZoomScale());

        }

        this.dollyStart.copy(this.dollyEnd);

        this.update();

    }

    handleMouseMovePan(event: MouseEvent) {

        //console.log( 'handleMouseMovePan' );

        this.panEnd.set(event.clientX, event.clientY);

        this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

        this.pan(this.panDelta.x, this.panDelta.y);

        this.panStart.copy(this.panEnd);

        this.update();

    }

    handleMouseUp(event: MouseEvent) {

        // console.log( 'handleMouseUp' );

    }

    handleMouseWheel(event: MouseWheelEvent) {

        // console.log( 'handleMouseWheel' );

        if (event.deltaY < 0) {

            this.dollyOut(this.getZoomScale());

        } else if (event.deltaY > 0) {

            this.dollyIn(this.getZoomScale());

        }

        this.update();

    }

    handleKeyDown(event: KeyboardEvent) {

        // console.log( 'handleKeyDown' );

        let needsUpdate = false;

        switch (event.keyCode) {

            case this.keys.UP:
                this.pan(0, this.keyPanSpeed);
                needsUpdate = true;
                break;

            case this.keys.BOTTOM:
                this.pan(0, -this.keyPanSpeed);
                needsUpdate = true;
                break;

            case this.keys.LEFT:
                this.pan(this.keyPanSpeed, 0);
                needsUpdate = true;
                break;

            case this.keys.RIGHT:
                this.pan(-this.keyPanSpeed, 0);
                needsUpdate = true;
                break;
        }

        if (needsUpdate) {

            // prevent the browser from scrolling on cursor keys
            event.preventDefault();

            this.update();

        }


    }

    handleTouchStartRotate(event: TouchEvent) {

        //console.log( 'handleTouchStartRotate' );

        this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

    }

    handleTouchStartDollyPan(event: TouchEvent) {

        //console.log( 'handleTouchStartDollyPan' );

        if (this.enableZoom) {

            let dx = event.touches[0].pageX - event.touches[1].pageX;
            let dy = event.touches[0].pageY - event.touches[1].pageY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            this.dollyStart.set(0, distance);

        }

        if (this.enablePan) {

            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            this.panStart.set(x, y);

        }

    }

    handleTouchMoveRotate(event: TouchEvent) {

        //console.log( 'handleTouchMoveRotate' );

        this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

        let element = this.domElement;

        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height

        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);

        this.rotateStart.copy(this.rotateEnd);

        this.update();

    }

    handleTouchMoveDollyPan(event: TouchEvent) {

        //console.log( 'handleTouchMoveDollyPan' );

        if (this.enableZoom) {

            let dx = event.touches[0].pageX - event.touches[1].pageX;
            let dy = event.touches[0].pageY - event.touches[1].pageY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            this.dollyEnd.set(0, distance);

            this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed));

            this.dollyIn(this.dollyDelta.y);

            this.dollyStart.copy(this.dollyEnd);

        }

        if (this.enablePan) {

            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            this.panEnd.set(x, y);

            this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

            this.pan(this.panDelta.x, this.panDelta.y);

            this.panStart.copy(this.panEnd);

        }

        this.update();

    }

    handleTouchEnd(event: TouchEvent) {

        //console.log( 'handleTouchEnd' );

    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    onMouseDown(event: MouseEvent) {

        if (!this.enabled) return;

        // Prevent the browser from scrolling.

        event.preventDefault();

        // Manually set the focus since calling preventDefault above
        // prevents the browser from setting it automatically.

        this.domElement.focus ? this.domElement.focus() : window.focus();

        switch (event.button) {

            case MOUSE.LEFT:

                if (event.ctrlKey || event.metaKey || event.shiftKey) {

                    if (!this.enablePan) return;

                    this.handleMouseDownPan(event);

                    this.state = STATE.PAN;

                } else {

                    if (!this.enableRotate) return;

                    this.handleMouseDownRotate(event);

                    this.state = STATE.ROTATE;

                }

                break;

            case MOUSE.MIDDLE:

                if (!this.enableZoom) return;

                this.handleMouseDownDolly(event);

                this.state = STATE.DOLLY;

                break;

            case MOUSE.RIGHT:

                if (!this.enablePan) return;

                this.handleMouseDownPan(event);

                this.state = STATE.PAN;

                break;

        }

        if (this.state !== STATE.NONE) {

            document.addEventListener('mousemove', this.onMouseMove, false);
            document.addEventListener('mouseup', this.onMouseUp, false);

            this.dispatchEvent(this.startEvent);

        }

    }

    onMouseMove(event: MouseEvent) {

        if (!this.enabled) return;

        event.preventDefault();

        switch (this.state) {

            case STATE.ROTATE:

                if (!this.enableRotate) return;

                this.handleMouseMoveRotate(event);

                break;

            case STATE.DOLLY:

                if (!this.enableZoom) return;

                this.handleMouseMoveDolly(event);

                break;

            case STATE.PAN:

                if (!this.enablePan) return;

                this.handleMouseMovePan(event);

                break;

        }

    }

    onMouseUp(event: MouseEvent) {

        if (!this.enabled) return;

        this.handleMouseUp(event);

        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);

        this.dispatchEvent(this.endEvent);

        this.state = STATE.NONE;

    }

    onMouseWheel(event: MouseWheelEvent) {

        if (!this.enabled ||
            !this.enableZoom ||
            (this.state !== STATE.NONE &&
                this.state !== STATE.ROTATE)) return;

        event.preventDefault();
        event.stopPropagation();

        this.dispatchEvent(this.startEvent);

        this.handleMouseWheel(event);

        this.dispatchEvent(this.endEvent);

    }

    onKeyDown(event: KeyboardEvent) {

        if (!this.enabled || !this.enableKeys || !this.enablePan) return;

        this.handleKeyDown(event);

    }

    onTouchStart(event: TouchEvent) {

        if (!this.enabled) return;

        event.preventDefault();

        switch (event.touches.length) {

            case 1:	// one-fingered touch: rotate

                if (!this.enableRotate) return;

                this.handleTouchStartRotate(event);

                this.state = STATE.TOUCH_ROTATE;

                break;

            case 2:	// two-fingered touch: dolly-pan

                if (!this.enableZoom && !this.enablePan) return;

                this.handleTouchStartDollyPan(event);

                this.state = STATE.TOUCH_DOLLY_PAN;

                break;

            default:

                this.state = STATE.NONE;

        }

        if (this.state !== STATE.NONE) {

            this.dispatchEvent(this.startEvent);

        }

    }

    onTouchMove(event: TouchEvent) {

        if (!this.enabled) return;

        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (!this.enableRotate) return;
                if (this.state !== STATE.TOUCH_ROTATE) return; // is this needed?

                this.handleTouchMoveRotate(event);

                break;

            case 2: // two-fingered touch: dolly-pan

                if (!this.enableZoom && !this.enablePan) return;
                if (this.state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?

                this.handleTouchMoveDollyPan(event);

                break;

            default:

                this.state = STATE.NONE;

        }

    }

    onTouchEnd(event: TouchEvent) {

        if (!this.enabled) return;

        this.handleTouchEnd(event);

        this.dispatchEvent(this.endEvent);

        this.state = STATE.NONE;

    }

    onContextMenu(event: MouseEvent) {

        if (!this.enabled) return;

        event.preventDefault();

    }


    // this method is exposed, but perhaps it would be better if we can make it private...
    update: () => boolean = (() => {

        let offset = new Vector3();

        // so camera.up is the orbit axis
        console.log("update");
        console.log(this);
        console.log(this.camera);
        console.log(this.zoom0);
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
