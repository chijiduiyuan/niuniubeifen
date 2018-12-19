(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/Alert.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '588fbn0WshPn7r+mDdfxrLe', 'Alert', __filename);
// scripts/comp/Alert.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        _btnOK: null,
        _btnCancle: null,
        _content: null,
        _closeBtn: null,
        _onok: null,
        _oncancel: null
    },

    onLoad: function onLoad() {
        this._btnOK = this.node.getChildByName("btnEnable");
        this._btnCancle = this.node.getChildByName("btnCancel");
        this._content = this.node.getChildByName("content").getComponent(cc.Label);
        this._closeBtn = this.node.getChildByName("clostBtn");
    },

    OnOkClick: function OnOkClick(event) {
        if (this._onok) {
            this._onok();
        };
        this.node.removeFromParent();
    },

    OnCancleClick: function OnCancleClick(event) {
        if (this._oncancel) {
            this._oncancel();
        };
        this.node.removeFromParent();
    },

    OnCloseClick: function OnCloseClick(event) {
        if (this._onok) {
            this._onok();
        };
        this.node.removeFromParent();
    },

    show: function show(content, onok, showcancelbtn) {
        var self = this;
        this._onok = onok;
        this._content.string = content + "";
        console.log("showcancelbtn status " + showcancelbtn);
        if (showcancelbtn == true) {} else {
            self._btnCancle.active = false;
            self._btnOK.x = 320;
        }
    },
    show2: function show2(content, onok, oncancel, showcancelbtn, okBtnTitle, cancelBtnTitle) {
        var self = this;
        this._onok = onok;
        this._oncancel = oncancel;
        this._content.string = content + "";
        console.log("showcancelbtn status " + showcancelbtn);
        if (okBtnTitle != "") {
            this._btnOK.getChildByName("Label").getComponent(cc.Label).string = okBtnTitle;
        }
        if (cancelBtnTitle != "") {
            this._btnCancle.getChildByName("Label").getComponent(cc.Label).string = cancelBtnTitle;
        }
        //this._btnOK.width=160;
        //this._btnCancle.width=160;
        if (showcancelbtn == true) {
            self._closeBtn.active = false;
        } else {
            self._btnCancle.active = false;
            self._btnOK.x = 320;
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
        //# sourceMappingURL=Alert.js.map
        