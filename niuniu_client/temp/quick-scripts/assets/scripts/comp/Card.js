(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/Card.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '70df0jJ2IpMHaLSR+slL8kk', 'Card', __filename);
// scripts/comp/Card.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        card_pos: '',
        card_node: cc.Node,
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    onLoad: function onLoad() {
        this._posx = new Array(60, 95, 130, 46, 72, 96, 124, 145, 50, 75, 98, 125, 151);
        this._posy = new Array(120, 125, 120, 78, 82, 85, 81, 73, 35, 39, 42, 38, 30);
        this._rotation = new Array(-10, 0, 10, -25, -10, 0, 10, 20, -25, -10, 0, 10, 20);

        //this.ShowCardNormal()
        //this.ShowSelfCardFinish();
    },

    ShowCurrentStatus: function ShowCurrentStatus(data) {
        // if( data.status != "standup"){  
        //     this.ShowCardNormal();
        // }
        // if(data.xiazhuType == "mingpai"){
        //     this.ShowCardSee()
        // }
        // if(data.status == "ShowCardQipai"){
        //     this.ShowCardSee()
        // }
        // if(data.status == "lose"){
        //     this.ShowCardLose()
        // }
    },

    ShowCardNormal: function ShowCardNormal(index) {
        var self = this;
        self.card_node.removeAllChildren();
        self.card_node.active = true;
        self.card_node.setScale(1);
        var gap = 20;
        var scale = 0.32;
        //var scale = 0.28
        if (index == 0) {
            gap = 20;
            scale = 0.55;
            //scale = 0.5; 
        }

        for (var i = 0; i < 5; i++) {
            var pokerSprite = cc.instantiate(self.pokerPrefab);
            pokerSprite.setScale(scale);

            self.card_node.addChild(pokerSprite);
            if (i > 0) {
                //pokerSprite.runAction(cc.moveBy(0.5,cc.p(i*gap,0))) 
            }
            var pos = self.card_node.convertToNodeSpaceAR(cc.p(320, 600));
            pokerSprite.setPosition(pos);
            pokerSprite.setPosition(pos.x, pos.y);
            //pokerSprite.setPosition( -2* gap , 5); 
            var delay = cc.delayTime(0.05 + 0.05 * i);
            var ac0 = cc.moveTo(0.3, cc.p(-30 + i * gap, -10));
            pokerSprite.runAction(cc.sequence(delay, ac0));
        }
    },

    ShowCardFinish: function ShowCardFinish() {
        var node = new cc.Node();
        var sprite = node.addComponent(cc.Sprite);
        this.card_node.addChild(node);
        cc.loader.loadRes("niuniu/arrange_complete.png", cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
    },

    ShowSelfCardFinish: function ShowSelfCardFinish() {
        var self = this;
        self.card_node.removeAllChildren();
        self.card_node.active = true;

        var gap = 75;
        //var scale = 0.5
        var scale = 0.45;
        for (var i = 0; i < 5; i++) {
            var pokerSprite = cc.instantiate(self.pokerPrefab);
            pokerSprite.setScale(scale);
            //pokerSprite.setPosition( -145 + i*gap, 35); 
            pokerSprite.setPosition(-145, 35);
            self.card_node.addChild(pokerSprite);
            if (i > 0) {
                pokerSprite.runAction(cc.moveBy(0.5, cc.p(i * gap, 0)));
            }
        }
        var node = new cc.Node();
        var sprite = node.addComponent(cc.Sprite);
        this.card_node.addChild(node);
        cc.loader.loadRes("niuniu/arrange_complete.png", cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
        cc.vv.audioMgr.playSFX('effect/poker_deal.mp3');
    },

    hideCard: function hideCard() {
        var self = this;
        self.card_node.active = false;
    },

    ShowCardResult: function ShowCardResult(cards, value, showType) {
        var self = this;
        self.card_node.removeAllChildren();
        self.card_node.active = true;
        var gap = 25;
        //var scale = 0.4;
        var scale = 0.45;
        var list = null;
        if (value > 0) {
            list = self.getNiuList(cards, value);
        }
        for (var i = 0; i < 5; i++) {
            var pokerSprite = cc.instantiate(self.pokerPrefab);
            pokerSprite.setScale(scale);
            if (i == 3) {
                gap = 25;
            }
            if (self.card_node.getPositionX() < 0) {
                if (list !== null) {
                    pokerSprite.setPosition(-39, 0);
                } else {
                    pokerSprite.setPosition(-24, 0);
                }
            } else {
                pokerSprite.setPosition(-50, 0);
            }
            if (list !== null) {
                if (i >= 3) {
                    pokerSprite.runAction(cc.moveBy(0.5, cc.p(i * gap + 20, 0)));
                } else {
                    if (i > 0) {
                        pokerSprite.runAction(cc.moveBy(0.5, cc.p(i * gap, 0)));
                    }
                }
            } else {
                if (i > 0) {
                    pokerSprite.runAction(cc.moveBy(0.5, cc.p(i * gap, 0)));
                }
            }
            var poker = cards[i];
            if (list !== null) {
                poker = cards[list[i]];
            }
            pokerSprite.getComponent(cc.Sprite).spriteFrame = Grobal.pokerSpriteFrameMap[poker.name];
            self.card_node.addChild(pokerSprite);
        }
        self.card_node.setScale(0.65);
        cc.vv.uitools.ShowAniNui(value, self.card_node);
    },

    ShowSeflCardResult: function ShowSeflCardResult(cards, value, showType) {
        var self = this;
        self.card_node.removeAllChildren();
        self.card_node.active = true;
        var gap = 85;
        //var scale = 0.55;
        var scale = 0.61;
        var list = null;
        if (value > 0) {
            list = self.getNiuList(cards, value);
        }

        if (cc.args["ext_json"]['playerNum'] == 6) {
            var move1 = new Array(-2, 48, 98, 148, 198);
        } else {
            var move1 = new Array(-42, 8, 58, 108, 158);
        }
        var move2 = new Array(-42, 8, 58, 178, 228);
        for (var i = 0; i < 5; i++) {
            var pokerSprite = cc.instantiate(self.pokerPrefab);
            pokerSprite.setScale(scale);
            var poker = cards[i];
            if (list !== null) {
                poker = cards[list[i]];
            }
            // if(showType == "1"){
            //     pokerSprite.setPosition(-110 + i*gap, 30);
            //     pokerSprite.runAction(cc.moveBy (0.3,cc.p(movex[i],0)));
            // }else{
            //     pokerSprite.setPosition(move2[i], 30);
            // }
            pokerSprite.setPosition(-42 + i * gap, 38);
            if (list !== null) {
                pokerSprite.runAction(cc.moveTo(0.3, cc.p(move2[i], 38)));
            } else {
                pokerSprite.runAction(cc.moveTo(0.3, cc.p(move1[i], 38)));
            }
            pokerSprite.getComponent(cc.Sprite).spriteFrame = Grobal.pokerSpriteFrameMap[poker.name];
            self.card_node.addChild(pokerSprite);
        }
        self.card_node.setScale(0.85);
        cc.vv.uitools.ShowAniNui(value, self.card_node, 1);
    },

    getNiuList: function getNiuList(cards, value) {
        var indexList = new Array();
        var m = 0;
        var n = 0;
        var s = 0;
        for (var i = 0; i < 3; i++) {
            for (var k = i + 1; k < 5; k++) {
                for (var b = k + 1; b < 5; b++) {
                    if ((cards[i].value + cards[k].value + cards[b].value) % 10 == 0) {
                        m = i;
                        n = k;
                        s = b;
                    }
                }
            }
        }
        indexList.push(m);
        indexList.push(n);
        indexList.push(s);
        if (m == 0 && n == 0 && s == 0) {
            return null;
        }
        var checkVlue = 0;
        for (var l = 0; l < 5; l++) {
            if (l !== m && l !== n && l !== s) {
                indexList.push(l);
            }
        }
        return indexList;
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
        //# sourceMappingURL=Card.js.map
        