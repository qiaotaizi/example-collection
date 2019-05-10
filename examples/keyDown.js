"use strict";
function listenKeyDown() {
    window.addEventListener('keydown', function (event) {
        if (event.key === 'Backspace') {
            window.history.back();
        }
    }, true);
}
listenKeyDown();
//# sourceMappingURL=keyDown.js.map