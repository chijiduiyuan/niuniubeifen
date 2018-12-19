(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/PokerAct.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '34e68KzfLNAy61TQsCHHH18', 'PokerAct', __filename);
// scripts/comp/PokerAct.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        sprite: cc.Sprite
    },

    onLoad: function onLoad() {},

    init: function init(spriteFrame) {
        this.sprite.spriteFrame = spriteFrame;
        var actArr = new Array();
        var action1 = cc.scaleTo(0.2, 1.2);
        var action2 = cc.scaleTo(0.2, 1);
        actArr.push(action1);
        actArr.push(action2);
        var seq = cc.sequence(actArr);
        this.node.runAction(seq);
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
        //# sourceMappingURL=PokerAct.js.map
        