(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/WaitingConnection.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'deb5682vWtEWbM3tCfdfIxQ', 'WaitingConnection', __filename);
// scripts/comp/WaitingConnection.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        target: cc.Node,
        _isShow: false,
        lblContent: cc.Label
    },

    onLoad: function onLoad() {
        if (cc.vv == null) {
            return null;
        }

        cc.vv.wc = this;
        this.node.active = this._isShow;
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        this.target.rotation = this.target.rotation - dt * 45;
    },

    show: function show(content) {
        this._isShow = true;
        if (this.node) {
            this.node.active = this._isShow;
        }
        if (this.lblContent) {
            if (content == null) {
                content = "";
            }
            this.lblContent.string = content;
        }
    },
    hide: function hide() {
        this._isShow = false;
        if (this.node) {
            this.node.active = this._isShow;
        }
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=WaitingConnection.js.map
        