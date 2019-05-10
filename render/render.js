"use strict";
function writeContent() {
    let span = document.getElementById("content-span");
    if (span !== null) {
        span.innerText =
            `We are using node ${process.versions.node},
            V8 ${process.versions.v8},`;
    }
}
writeContent();
//# sourceMappingURL=render.js.map