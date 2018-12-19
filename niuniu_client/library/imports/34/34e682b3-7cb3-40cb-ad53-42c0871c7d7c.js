"use strict";
cc._RF.push(module, '34e68KzfLNAy61TQsCHHH18', 'PokerAct');
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