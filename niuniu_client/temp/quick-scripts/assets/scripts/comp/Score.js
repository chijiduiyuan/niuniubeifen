(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/Score.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'dd0289n215KZ5Rj7Um4xO3Q', 'Score', __filename);
// scripts/comp/Score.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        adds: {
            default: [],
            type: [cc.Node]
        },
        _totalAdd: cc.Node,
        _tatalScore: 0
    },

    init: function init() {
        this.node.active = true;
        for (var i = 0; i < 3; i++) {
            this.adds[i].active = false;
        }
        this._totalAdd = this.node.getChildByName("total_score");
        this._totalAdd.active = false;
        this._tatalScore = 0;
    },

    ShowScore: function ShowScore(index, data) {
        var self = this;
        this.adds[index].active = true;
        var score = this.adds[index].getChildByName("add_score").getComponent(cc.Label);
        score.string = data.score;
        var ext_score = this.adds[index].getChildByName("ext_add").getComponent(cc.Label);
        ext_score.string = data.ext_score;
        var total = parseInt(data.score) + parseInt(data.ext_score);
        self.AddTotal(total);
    },

    AddTotal: function AddTotal(total) {
        this._tatalScore = this._tatalScore + total;
        this.ShowAddTotal();
    },

    ShowTotal: function ShowTotal(total) {
        this._tatalScore = total;
        this.ShowAddTotal();
    },

    ShowAddTotal: function ShowAddTotal() {
        var self = this;
        self._totalAdd.active = true;
        var score = self._totalAdd.getChildByName("add_score").getComponent(cc.Label);
        score.string = self._tatalScore;
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
        //# sourceMappingURL=Score.js.map
        