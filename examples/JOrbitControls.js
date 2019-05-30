"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
//取代事件监听回调函数中的this调用
//因为在指向回调函数时,this将不再是JOrbitControls对象本身
//可能是global/canvas等其他对象
let scope;
class JOrbitControls extends three_1.EventDispatcher {
    constructor(camera, domElement) {
        super();
        // "target" sets the location of focus, where the object orbits around
        this.target = new three_1.Vector3();
        // for reset
        this.target0 = this.target.clone();
        // Set to false to disable this control
        this.enabled = true;
        // How far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = 0;
        this.maxDistance = Infinity;
        // How far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Infinity;
        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.enableDamping = false;
        this.dampingFactor = 0.25;
        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;
        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 1.0;
        // Set to false to disable panning
        this.enablePan = true;
        this.panSpeed = 1.0;
        this.screenSpacePanning = false; // if true, pan in screen-space
        this.keyPanSpeed = 7.0; // pixels moved per arrow key push
        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
        // Set to false to disable use of the keys
        this.enableKeys = true;
        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
        this.changeEvent = { type: 'change' };
        this.startEvent = { type: 'start' };
        this.endEvent = { type: 'end' };
        this.state = STATE.NONE;
        this.EPS = 0.000001;
        // current position in spherical coordinates
        this.spherical = new three_1.Spherical();
        this.sphericalDelta = new three_1.Spherical();
        this.scale = 1;
        this.panOffset = new three_1.Vector3();
        this.zoomChanged = false;
        this.rotateStart = new three_1.Vector2();
        this.rotateEnd = new three_1.Vector2();
        this.rotateDelta = new three_1.Vector2();
        this.panStart = new three_1.Vector2();
        this.panEnd = new three_1.Vector2();
        this.panDelta = new three_1.Vector2();
        this.dollyStart = new three_1.Vector2();
        this.dollyEnd = new three_1.Vector2();
        this.dollyDelta = new three_1.Vector2();
        this.camera = camera;
        this.domElement = domElement;
        this.position0 = this.camera.position.clone();
        this.zoom0 = this.camera.zoom;
        this.panLeft = (() => {
            let v = new three_1.Vector3();
            return (distance, objectMatrix) => {
                v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
                v.multiplyScalar(-distance);
                this.panOffset.add(v);
            };
        })();
        this.panUp = (() => {
            let v = new three_1.Vector3();
            return (distance, objectMatrix) => {
                if (this.screenSpacePanning) {
                    v.setFromMatrixColumn(objectMatrix, 1);
                }
                else {
                    v.setFromMatrixColumn(objectMatrix, 0);
                    v.crossVectors(this.camera.up, v);
                }
                v.multiplyScalar(distance);
                this.panOffset.add(v);
            };
        })();
        // deltaX and deltaY are in pixels; right and down are positive
        this.pan = (() => {
            let offset = new three_1.Vector3();
            return (deltaX, deltaY) => {
                let element = this.domElement;
                if (this.camera instanceof three_1.PerspectiveCamera) {
                    // perspective
                    let position = this.camera.position;
                    offset.copy(position).sub(this.target);
                    let targetDistance = offset.length();
                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
                    // we use only clientHeight here so aspect ratio does not distort speed
                    this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.camera.matrix);
                    this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.camera.matrix);
                }
                else if (this.camera instanceof three_1.OrthographicCamera) {
                    // orthographic
                    this.panLeft(deltaX * (this.camera.right - this.camera.left) / this.camera.zoom / element.clientWidth, this.camera.matrix);
                    this.panUp(deltaY * (this.camera.top - this.camera.bottom) / this.camera.zoom / element.clientHeight, this.camera.matrix);
                }
                else {
                    // camera neither orthographic nor perspective
                    console.warn('WARNING: JOrbitControls.ts encountered an unknown camera type - pan disabled.');
                    this.enablePan = false;
                }
            };
        })();
        //update必须在这里进行定义
        //如果在构造函数外部定义
        //编译后的js代码将使得update函数的声明先于在构造函数中初始化的成员变量
        //这时,this.camera将是undefined
        this.update = (() => {
            let offset = new three_1.Vector3();
            // so camera.up is the orbit axis
            let quat = new three_1.Quaternion().setFromUnitVectors(this.camera.up, new three_1.Vector3(0, 1, 0));
            let quatInverse = quat.clone().inverse();
            let lastPosition = new three_1.Vector3();
            let lastQuaternion = new three_1.Quaternion();
            return () => {
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
                }
                else {
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
        scope = this;
        this.domElement.addEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('wheel', this.onMouseWheel, false);
        this.domElement.addEventListener('touchstart', this.onTouchStart, false);
        this.domElement.addEventListener('touchend', this.onTouchEnd, false);
        this.domElement.addEventListener('touchmove', this.onTouchMove, false);
        window.addEventListener('keydown', this.onKeyDown, false);
        // force an update at start
        this.update();
    }
    getPolarAngle() {
        return this.spherical.phi;
    }
    getAzimuthalAngle() {
        return this.spherical.theta;
    }
    ;
    saveState() {
        this.target0.copy(this.target);
        this.position0.copy(this.camera.position);
        this.zoom0 = this.camera.zoom;
    }
    ;
    reset() {
        this.target.copy(this.target0);
        this.camera.position.copy(this.position0);
        this.camera.zoom = this.zoom0;
        this.camera.updateProjectionMatrix();
        this.dispatchEvent(this.changeEvent);
        this.update();
        this.state = STATE.NONE;
    }
    ;
    dispose() {
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
    }
    ;
    getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }
    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }
    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }
    rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }
    dollyIn(dollyScale) {
        if (this.camera instanceof three_1.PerspectiveCamera) {
            this.scale /= dollyScale;
        }
        else if (this.camera instanceof three_1.OrthographicCamera) {
            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;
        }
        else {
            console.warn('WARNING: JOrbitControls.ts encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;
        }
    }
    dollyOut(dollyScale) {
        if (this.camera instanceof three_1.PerspectiveCamera) {
            this.scale *= dollyScale;
        }
        else if (this.camera instanceof three_1.OrthographicCamera) {
            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom / dollyScale));
            this.camera.updateProjectionMatrix();
            this.zoomChanged = true;
        }
        else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;
        }
    }
    //
    // event callbacks - update the object state
    //
    handleMouseDownRotate(event) {
        // console.log('handleMouseDownRotate');
        scope.rotateStart.set(event.clientX, event.clientY);
    }
    handleMouseDownDolly(event) {
        // console.log('handleMouseDownDolly');
        scope.dollyStart.set(event.clientX, event.clientY);
    }
    handleMouseDownPan(event) {
        // console.log('handleMouseDownPan');
        scope.panStart.set(event.clientX, event.clientY);
    }
    handleMouseMoveRotate(event) {
        // console.log('handleMouseMoveRotate');
        scope.rotateEnd.set(event.clientX, event.clientY);
        scope.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
        let element = this.domElement;
        scope.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight); // yes, height
        scope.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight);
        scope.rotateStart.copy(this.rotateEnd);
        scope.update();
    }
    handleMouseMoveDolly(event) {
        // console.log('handleMouseMoveDolly');
        scope.dollyEnd.set(event.clientX, event.clientY);
        scope.dollyDelta.subVectors(scope.dollyEnd, scope.dollyStart);
        if (scope.dollyDelta.y > 0) {
            scope.dollyIn(this.getZoomScale());
        }
        else if (scope.dollyDelta.y < 0) {
            scope.dollyOut(scope.getZoomScale());
        }
        scope.dollyStart.copy(scope.dollyEnd);
        scope.update();
    }
    handleMouseMovePan(event) {
        // console.log('handleMouseMovePan');
        scope.panEnd.set(event.clientX, event.clientY);
        scope.panDelta.subVectors(scope.panEnd, scope.panStart).multiplyScalar(scope.panSpeed);
        scope.pan(scope.panDelta.x, scope.panDelta.y);
        scope.panStart.copy(scope.panEnd);
        scope.update();
    }
    handleMouseUp(event) {
        // console.log('handleMouseUp');
    }
    handleMouseWheel(event) {
        // console.log('handleMouseWheel');
        if (event.deltaY < 0) {
            scope.dollyOut(scope.getZoomScale());
        }
        else if (event.deltaY > 0) {
            scope.dollyIn(scope.getZoomScale());
        }
        scope.update();
    }
    handleKeyDown(event) {
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
    handleTouchStartRotate(event) {
        // console.log('handleTouchStartRotate');
        scope.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    }
    handleTouchStartDollyPan(event) {
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
    handleTouchMoveRotate(event) {
        // console.log('handleTouchMoveRotate');
        scope.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        scope.rotateDelta.subVectors(scope.rotateEnd, scope.rotateStart).multiplyScalar(scope.rotateSpeed);
        let element = scope.domElement;
        scope.rotateLeft(2 * Math.PI * scope.rotateDelta.x / element.clientHeight); // yes, height
        scope.rotateUp(2 * Math.PI * scope.rotateDelta.y / element.clientHeight);
        scope.rotateStart.copy(scope.rotateEnd);
        scope.update();
    }
    handleTouchMoveDollyPan(event) {
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
    handleTouchEnd(event) {
        // console.log('handleTouchEnd');
    }
    //
    // event handlers - FSM: listen for events and reset state
    //
    onMouseMove(event) {
        if (!scope.enabled)
            return;
        event.preventDefault();
        switch (scope.state) {
            case STATE.ROTATE:
                if (!scope.enableRotate)
                    return;
                scope.handleMouseMoveRotate(event);
                break;
            case STATE.DOLLY:
                if (!scope.enableZoom)
                    return;
                scope.handleMouseMoveDolly(event);
                break;
            case STATE.PAN:
                if (!scope.enablePan)
                    return;
                scope.handleMouseMovePan(event);
                break;
        }
    }
    onMouseDown(event) {
        if (!scope.enabled)
            return;
        // Prevent the browser from scrolling.
        event.preventDefault();
        // Manually set the focus since calling preventDefault above
        // prevents the browser from setting it automatically.
        scope.domElement.focus ? scope.domElement.focus() : window.focus();
        switch (event.button) {
            case three_1.MOUSE.LEFT:
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    if (!scope.enablePan)
                        return;
                    scope.handleMouseDownPan(event);
                    scope.state = STATE.PAN;
                }
                else {
                    if (!scope.enableRotate)
                        return;
                    scope.handleMouseDownRotate(event);
                    scope.state = STATE.ROTATE;
                }
                break;
            case three_1.MOUSE.MIDDLE:
                if (!scope.enableZoom)
                    return;
                scope.handleMouseDownDolly(event);
                scope.state = STATE.DOLLY;
                break;
            case three_1.MOUSE.RIGHT:
                if (!scope.enablePan)
                    return;
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
    onMouseUp(event) {
        if (!scope.enabled)
            return;
        scope.handleMouseUp(event);
        document.removeEventListener('mousemove', scope.onMouseMove, false);
        document.removeEventListener('mouseup', scope.onMouseUp, false);
        scope.dispatchEvent(scope.endEvent);
        scope.state = STATE.NONE;
    }
    onMouseWheel(event) {
        if (!scope.enabled ||
            !scope.enableZoom ||
            (scope.state !== STATE.NONE &&
                scope.state !== STATE.ROTATE))
            return;
        event.preventDefault();
        event.stopPropagation();
        scope.dispatchEvent(scope.startEvent);
        scope.handleMouseWheel(event);
        scope.dispatchEvent(scope.endEvent);
    }
    onKeyDown(event) {
        if (!scope.enabled || !scope.enableKeys || !scope.enablePan)
            return;
        scope.handleKeyDown(event);
    }
    onTouchStart(event) {
        if (!scope.enabled)
            return;
        event.preventDefault();
        switch (event.touches.length) {
            case 1: // one-fingered touch: rotate
                if (!scope.enableRotate)
                    return;
                scope.handleTouchStartRotate(event);
                scope.state = STATE.TOUCH_ROTATE;
                break;
            case 2: // two-fingered touch: dolly-pan
                if (!scope.enableZoom && !scope.enablePan)
                    return;
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
    onTouchMove(event) {
        if (!scope.enabled)
            return;
        event.preventDefault();
        event.stopPropagation();
        switch (event.touches.length) {
            case 1: // one-fingered touch: rotate
                if (!scope.enableRotate)
                    return;
                if (scope.state !== STATE.TOUCH_ROTATE)
                    return; // is this needed?
                scope.handleTouchMoveRotate(event);
                break;
            case 2: // two-fingered touch: dolly-pan
                if (!scope.enableZoom && !scope.enablePan)
                    return;
                if (scope.state !== STATE.TOUCH_DOLLY_PAN)
                    return; // is this needed?
                scope.handleTouchMoveDollyPan(event);
                break;
            default:
                scope.state = STATE.NONE;
        }
    }
    onTouchEnd(event) {
        if (!scope.enabled)
            return;
        scope.handleTouchEnd(event);
        scope.dispatchEvent(scope.endEvent);
        scope.state = STATE.NONE;
    }
    onContextMenu(event) {
        if (!scope.enabled)
            return;
        event.preventDefault();
    }
}
exports.JOrbitControls = JOrbitControls;
class STATE {
}
STATE.NONE = -1;
STATE.ROTATE = 0;
STATE.DOLLY = 1;
STATE.PAN = 2;
STATE.TOUCH_ROTATE = 3;
STATE.TOUCH_DOLLY_PAN = 4;
//旧api
//center=>target
//noZoom=>enableZoom;
//noRotate=>enableRotate
//noPan=>enablePan
//noKeys=>enableKeys 
//staticMoving=>enableDamping
//dynamicDampingFactor=>dampingFactor
//# sourceMappingURL=JOrbitControls.js.map