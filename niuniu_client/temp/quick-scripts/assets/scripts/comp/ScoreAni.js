(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/ScoreAni.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '76c0fHi3Q9EM60lP1lXCNIR', 'ScoreAni', __filename);
// scripts/comp/ScoreAni.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        _prefabs: null,
        _data: null,
        _parent: null
    },

    onLoad: function onLoad() {},

    show: function show(data, parent) {
        var self = this;
        this._data = data;
        this._parent = parent;
        cc.loader.loadRes("prefabs/coin", function (err, prefab) {
            self._prefabs = prefab;
            self.showOut();
        });
    },

    showOut: function showOut() {
        var self = this;
        if (this._data.outArr.length > 0) {
            for (var i = 0; i < this._data.outArr.length; i++) {
                this.createSingle(this._data.outArr[i], this._data.sourcePos);
            }
            cc.vv.audioMgr.playSFX('effect/coin_income.mp3');
            setTimeout(function () {
                self.showIn();
            }, 1500);
        } else {
            self.showIn();
        }
    },

    showIn: function showIn() {
        var self = this;
        if (this._data.inArr.length > 0) {
            for (var i = 0; i < this._data.inArr.length; i++) {
                this.createSingle(this._data.sourcePos, this._data.inArr[i]);
            }
            cc.vv.audioMgr.playSFX('effect/coin_income.mp3');
            setTimeout(function () {
                self._parent.removeFromParent();
            }, 1500);
        } else {
            self._parent.removeFromParent();
        }
    },

    createSingle: function createSingle(fromPos, tarPos) {
        for (var i = 0; i < 5; i++) {
            var coin = cc.instantiate(this._prefabs);
            var posx = fromPos.x;
            var posy = fromPos.y;
            coin.setPosition(cc.p(posx, posy));

            var actArr = new Array();
            var ac1 = cc.moveTo(1, tarPos);
            var call = cc.callFunc(function () {
                coin.removeFromParent();
            });
            coin.runAction(cc.moveTo(0.1 + 0.15 * (i + 1), tarPos));
            this._parent.addChild(coin);
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
        //# sourceMappingURL=ScoreAni.js.map
        