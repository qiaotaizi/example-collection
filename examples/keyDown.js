"use strict";
function listenKeyDown() {
    console.log(window.innerHeight + "," + window.innerWidth);
    window.addEventListener('keydown', function (event) {
        if (event.key === 'Backspace') {
            window.history.back();
        }
    }, true);
}
listenKeyDown();
//# sourceMappingURL=keyDown.js.map