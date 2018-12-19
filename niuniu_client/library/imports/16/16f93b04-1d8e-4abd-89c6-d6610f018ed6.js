"use strict";
cc._RF.push(module, '16f93sEHY5KvYnG1mEPAY7W', 'Root');
// scripts/mgr/Root.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function onLoad() {
        cc.game.addPersistRootNode(this.node);
    }
});

cc._RF.pop();