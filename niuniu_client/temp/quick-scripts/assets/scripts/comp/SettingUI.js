(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/SettingUI.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'b6e45Bv3H9FAJrJv6ilRwKz', 'SettingUI', __filename);
// scripts/comp/SettingUI.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        soundSprite: cc.Sprite,
        effectSprite: cc.Sprite
    },

    onLoad: function onLoad() {
        this.initView();
    },

    initView: function initView() {
        var self = this;
        var s = cc.sys.localStorage.getItem("bgmVolume");
        var e = cc.sys.localStorage.getItem("sfxVolume");
        if (s == 0 || s == null) {
            cc.loader.loadRes("comm/onsetclose.png", cc.SpriteFrame, function (err, spriteFrame) {
                self.soundSprite.spriteFrame = spriteFrame;
            });
        } else {
            cc.loader.loadRes("comm/onsetopen.png", cc.SpriteFrame, function (err, spriteFrame) {
                self.soundSprite.spriteFrame = spriteFrame;
            });
        }
        if (e == 0 || e == null) {
            cc.loader.loadRes("comm/onsetclose.png", cc.SpriteFrame, function (err, spriteFrame) {
                self.effectSprite.spriteFrame = spriteFrame;
            });
        } else if (e == 1) {
            cc.loader.loadRes("comm/onsetopen.png", cc.SpriteFrame, function (err, spriteFrame) {
                self.effectSprite.spriteFrame = spriteFrame;
            });
        }
    },

    OnCloseClick: function OnCloseClick() {
        this.node.removeFromParent();
    },

    OnSoundClick: function OnSoundClick() {
        var s = cc.sys.localStorage.getItem("bgmVolume");
        if (s == 0) {
            cc.vv.audioMgr.setBGMVolume(0.3);
        } else {
            cc.vv.audioMgr.setBGMVolume(0);
        }
        this.initView();
    },

    OnEffectClick: function OnEffectClick() {
        var e = cc.sys.localStorage.getItem("sfxVolume");
        if (e == 0) {
            cc.vv.audioMgr.setSFXVolume(1);
        } else {
            cc.vv.audioMgr.setSFXVolume(0);
        }
        this.initView();
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
        //# sourceMappingURL=SettingUI.js.map
        