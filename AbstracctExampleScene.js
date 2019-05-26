"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AExampleScene {
}
exports.AExampleScene = AExampleScene;
class SceneExecutor {
    static exec(exampleScene) {
        let [s, c, r, rd] = [exampleScene.scene, exampleScene.camera, exampleScene.renderer, exampleScene.render];
        let animFunc = function () {
            rd();
            r.render(s, c);
            requestAnimationFrame(animFunc);
        };
        animFunc();
    }
}
exports.SceneExecutor = SceneExecutor;
//# sourceMappingURL=AbstracctExampleScene.js.map