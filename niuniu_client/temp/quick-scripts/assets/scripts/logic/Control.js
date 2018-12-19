(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/logic/Control.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '34d560o89VJfaMkN+jEe7ht', 'Control', __filename);
// scripts/logic/Control.js

"use strict";

var POSITION_UP = 1;
var POSITION_DOWN = 2;
cc.Class({
    extends: cc.Component,
    properties: {
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },
        cardList: cc.Node,
        qiangzhuan: {
            default: null,
            type: cc.Node
        },
        qiangzhuan2: {
            default: null,
            type: cc.Node
        },
        beishu: {
            default: null,
            type: cc.Node
        },
        selectniu: {
            default: null,
            type: cc.Node
        },
        _selectList: null,
        _pokerSpriteList: null,
        _pokerList: null
    },

    onLoad: function onLoad() {
        cc.vv.netRoot.on('qiangzhuang_done', function (msgBean) {
            if (Grobal.status == "standup") {
                return;
            }
            this.qiangzhuan.active = false;
            this.qiangzhuan2.active = false;
            var nameList = ["buqiang", "qiang1", "qiang2", "qiang4"];
            for (var i = 0; i < 4; i++) {
                var btn = this.qiangzhuan2.getChildByName(nameList[i]).getComponent(cc.Button);
                btn._updateState();
            }
        }, this);
        cc.vv.netRoot.on('dealbaserate_success', function (msgBean) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            this.beishu.active = false;
        }, this);
        cc.vv.netRoot.on('dealpoker_done', function (msgBean) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            this.selectniu.active = false;
            this.node.active = false;
        }, this);
        cc.vv.netRoot.on('card_start_play', function (msgBean) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            this.selectniu.active = false;
            this.node.active = false;
        }, this);
        cc.vv.netRoot.on('shezhi_beishu', function (msgBean) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            this.node.active = true;
            if (Grobal.isGrab == true) {
                this.qiangzhuan.active = false;
                this.qiangzhuan2.active = false;
                this.beishu.active = false;
                this.selectniu.active = false;
            } else {
                this.qiangzhuan.active = false;
                this.qiangzhuan2.active = false;
                this.beishu.active = true;
                this.selectniu.active = false;
            }
            for (var j = 0; j < 10; j++) {
                if (this.beishu.getChildByName("multiple" + j) !== null) {
                    var btn = this.beishu.getChildByName("multiple" + j).getComponent(cc.Button);
                    btn._updateState();
                }
            }
        }, this);
        cc.vv.netRoot.on('game_restart_notice', function (msgBean) {
            this.qiangzhuan.active = false;
            this.qiangzhuan2.active = false;
            this.beishu.active = false;
            this.selectniu.active = false;
            this.cardList.removeAllChildren();
            this._pokerSpriteList = new Array();
            this._selectList = new Array();
        }, this);
        this._selectList = new Array();
    },
    reset: function reset() {
        var self = this;
        self.cardList.removeAllChildren();
        self._pokerSpriteList = new Array();
        this._selectList = new Array();
        this.selectniu.active = false;
    },

    showQiangZhuan: function showQiangZhuan() {
        if (cc.args["ext_json"].playType == "see") {
            this.qiangzhuan.active = false;
            this.qiangzhuan2.active = true;
        } else if (cc.args["ext_json"].playType == "nor") {
            this.qiangzhuan.active = true;
            this.qiangzhuan2.active = false;
        }
        this.beishu.active = false;
        this.selectniu.active = false;
        var time = this.node.getChildByName("Time");
        if (time != undefined && time != null) {
            time.removeFromParent();
        }
    },
    showSelectNiu: function showSelectNiu() {
        this.qiangzhuan.active = false;
        this.qiangzhuan2.active = false;
        this.beishu.active = false;
        this.selectniu.active = true;
    },

    displayAndClickPokers: function displayAndClickPokers(pokerList) {
        var self = this;
        self.cardList.removeAllChildren();
        self._pokerSpriteList = new Array();
        var gap = 85; //牌间隙
        this._pokerList = pokerList;
        for (var i = 0; i < 5; i++) {
            var pokerSprite = cc.instantiate(self.pokerPrefab);
            pokerSprite.status = POSITION_DOWN;
            pokerSprite.setScale(0.55);
            var poker = pokerList[i];
            pokerSprite.setPosition(320, 640);
            var pokerName = null;
            if (poker != undefined) {
                pokerName = poker.name;
            }
            var actArr = new Array();
            var delay = cc.delayTime(0.05 + 0.05 * i);
            if (cc.args["ext_json"]['playerNum'] == 6) {
                var ac0 = cc.moveTo(0.3, cc.p(150 + i * gap, 290));
            } else {
                var ac0 = cc.moveTo(0.3, cc.p(220 + i * gap, 180));
            }

            var ac1 = cc.scaleTo(0.2, 0, 0.55);
            var call = cc.callFunc(function (target) {
                if (target.poker !== null && target.poker !== undefined) {
                    target.getComponent(cc.Sprite).spriteFrame = Grobal.pokerSpriteFrameMap[target.poker.name];
                }
            });
            var ac2 = cc.scaleTo(0.2, 0.55, 0.55);
            actArr.push(delay);
            actArr.push(ac0);
            actArr.push(ac1);
            actArr.push(call);
            actArr.push(ac2);
            this.cardList.addChild(pokerSprite);
            self._pokerSpriteList.push(pokerSprite);

            if (poker != undefined) {
                pokerSprite.poker = poker;
                if (this._pokerList.length == 5) {
                    if (i < 3) {
                        pokerSprite.runAction(cc.sequence(actArr));
                    } else {
                        if (i == 3) {
                            pokerSprite.on(cc.Node.EventType.TOUCH_START, self.fourPokerClick, this);
                        } else {
                            pokerSprite.on(cc.Node.EventType.TOUCH_START, self.lastPokerClick, this);
                        }
                        var delay = cc.delayTime(0.05 + 0.05 * i);
                        if (cc.args["ext_json"]['playerNum'] == 6) {
                            var ac0 = cc.moveTo(0.3, cc.p(150 + i * gap, 290));
                        } else {
                            var ac0 = cc.moveTo(0.3, cc.p(220 + i * gap, 180));
                        }
                        pokerSprite.runAction(cc.sequence(delay, ac0));
                    }
                } else {
                    pokerSprite.runAction(cc.sequence(actArr));
                }
            } else {
                pokerSprite.poker = {};
                var delay = cc.delayTime(0.05 + 0.05 * i);
                if (cc.args["ext_json"]['playerNum'] == 6) {
                    var ac0 = cc.moveTo(0.3, cc.p(150 + i * gap, 290));
                } else {
                    var ac0 = cc.moveTo(0.3, cc.p(220 + i * gap, 180));
                }
                pokerSprite.runAction(cc.sequence(delay, ac0));
                if (i == 3) {
                    pokerSprite.on(cc.Node.EventType.TOUCH_START, self.fourPokerClick, this);
                } else {
                    pokerSprite.on(cc.Node.EventType.TOUCH_START, self.lastPokerClick, this);
                }
            }
        }
        cc.vv.audioMgr.playSFX('effect/poker_deal.mp3');
    },

    /**显示手中的牌 */
    displayPokers: function displayPokers(pokerList, isNeedAction) {
        var self = this;
        self.cardList.removeAllChildren();
        self._pokerSpriteList = new Array();
        var gap = 85; //牌间隙
        this._pokerList = pokerList;
        var pokerAction = 0;
        for (var i = 0; i < 5; i++) {
            var poker = pokerList[i];
            var pokerSprite = cc.instantiate(self.pokerPrefab);
            pokerSprite.status = POSITION_DOWN;
            pokerSprite.setScale(0.55);
            if (poker != undefined) {
                var pokerName = poker.name;
                if (isNeedAction == false && i == pokerList.length - 1) {
                    pokerAction = i;
                } else {
                    pokerSprite.getComponent(cc.Sprite).spriteFrame = Grobal.pokerSpriteFrameMap[pokerName];
                }
                pokerSprite.poker = poker;
            } else {
                pokerSprite.poker = {};
                if (i == 3) {
                    pokerSprite.on(cc.Node.EventType.TOUCH_START, self.fourPokerClick, this);
                } else {
                    pokerSprite.on(cc.Node.EventType.TOUCH_START, self.lastPokerClick, this);
                }
            }
            if (isNeedAction == false) {
                if (cc.args["ext_json"]['playerNum'] == 6) {
                    pokerSprite.setPosition(150 + i * gap, 290);
                } else {
                    pokerSprite.setPosition(220 + i * gap, 180);
                }
            } else {
                if (cc.args["ext_json"]['playerNum'] == 6) {
                    pokerSprite.setPosition(150, 290);
                } else {
                    pokerSprite.setPosition(200, 160);
                }
                if (i > 0) {
                    pokerSprite.runAction(cc.moveBy(0.5, cc.p(i * gap, 0)));
                }
            }
            this.cardList.addChild(pokerSprite);
            self._pokerSpriteList.push(pokerSprite);
        }
        if (pokerAction != 0) {
            var pokerSprite = self._pokerSpriteList[pokerAction];
            var actArr = new Array();
            var ac1 = cc.scaleTo(0.2, 0, 0.55);
            var call = cc.callFunc(function () {
                pokerSprite.getComponent(cc.Sprite).spriteFrame = Grobal.pokerSpriteFrameMap[pokerName];
            });
            var ac2 = cc.scaleTo(0.2, 0.55, 0.55);
            actArr.push(ac1);
            actArr.push(call);
            actArr.push(ac2);
            pokerSprite.runAction(cc.sequence(actArr));
        }
        cc.vv.audioMgr.playSFX('effect/poker_deal.mp3');
    },

    showPokerClick: function showPokerClick(event) {
        var poker = event.target;
        var pokerName = event.target.poker.name;
        var actArr = new Array();
        var ac1 = cc.scaleTo(0.2, 0, 0.55);
        var call = cc.callFunc(function () {
            poker.getComponent(cc.Sprite).spriteFrame = Grobal.pokerSpriteFrameMap[pokerName];
        });
        var ac2 = cc.scaleTo(0.2, 0.55, 0.55);
        actArr.push(ac1);
        actArr.push(call);
        actArr.push(ac2);
        poker.runAction(cc.sequence(actArr));
        cc.vv.audioMgr.playSFX('effect/poker_click.mp3');
    },

    lastPokerClick: function lastPokerClick() {
        if (Grobal.status == "standup" || Grobal.status == "ready") {
            return;
        }
        cc.vv.socket.send('showAllPokers');
        cc.vv.audioMgr.playSFX('effect/poker_click.mp3');
    },
    fourPokerClick: function fourPokerClick() {
        if (Grobal.status == "standup" || Grobal.status == "ready") {
            return;
        }
        cc.vv.socket.send('showFourPokers');
        cc.vv.audioMgr.playSFX('effect/poker_click.mp3');
    },
    _getCardForTouch: function _getCardForTouch(touch) {
        var self = this;
        for (var i = self._pokerSpriteList.length - 1; i >= 0; i--) {
            // 需要倒序
            var pokerSprite = self._pokerSpriteList[i];
            var box = pokerSprite.getBoundingBox();
            if (cc.rectContainsPoint(box, touch)) {
                pokerSprite.isChiose = true;
                pokerSprite.opacity = 185;
                this.ChangePokerState();
                cc.vv.audioMgr.playSFX("effect/btn_click.mp3");
                return; //关键， 找到一个就返回
            }
        }
    },

    //点击结束来，处理事件，选中牌，或者放下牌
    endCallback: function endCallback(event) {
        if (this._pokerSpriteList == null || this._pokerSpriteList.length < 5) {
            return;
        }
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this._touchEnd = this.node.convertToNodeSpace(touchLoc);
        this._getCardForTouch(this._touchEnd);
    },

    //把选中的牌，位置上挪，还有放入_selectList 数组
    ChangePokerState: function ChangePokerState() {
        var self = this;
        for (var i = 0; i < this._pokerSpriteList.length; i++) {
            var pokerSprite = this._pokerSpriteList[i];
            if (pokerSprite.isChiose) {
                pokerSprite.isChiose = false;
                pokerSprite.opacity = 255;
                if (pokerSprite.status === POSITION_UP) {
                    pokerSprite.status = POSITION_DOWN;
                    pokerSprite.y -= 20;

                    var index = -1;
                    for (var k in self._selectList) {
                        var selectPoker = self._selectList[k];
                        if (selectPoker.name == pokerSprite.poker.name) index = k;
                    }
                    if (index != -1) self._selectList.splice(index, 1);
                } else {
                    if (self._selectList.length >= 3) {
                        return;
                    }
                    pokerSprite.status = POSITION_UP;
                    pokerSprite.y += 20;
                    self._selectList.push(pokerSprite.poker);
                }
            }
        }
    },

    onHasNiuClick: function onHasNiuClick() {
        var self = this;
        cc.vv.socket.send('dealpoker', "");
    },

    onQiangClick: function onQiangClick(event) {
        var str = event.target.name;
        str = str.slice(-1);
        var beishu = parseInt(str);
        cc.vv.socket.send('qiangzhuang', { qiangzhuang: beishu });
    },
    onBuqiangClick: function onBuqiangClick() {
        cc.vv.socket.send('qiangzhuang', { qiangzhuang: 0 });
    },
    sendRateClick: function sendRateClick(event) {
        var index = event.target.name.slice(8);
        var arr = [1, 2, 4, 5, 3, 8];
        cc.vv.socket.send('dealbaserate', { rate: arr[index] });
        //cc.vv.audioMgr.playSFX('effect/compare_bet.mp3');
    },

    checkNiu: function checkNiu() {
        var self = this;
        var s = 0;
        var t = 0;
        var dict = {};
        var dict2 = {};
        var than10 = 0;
        for (var i = 0; i < self._pokerList.length; i++) {
            var ci = self._pokerList[i].value;
            s += ci;
            t += ci;
            if (ci == 0) {
                t += 10;
            }
            dict[ci] = dict[ci] === undefined ? 1 : dict[ci] + 1;
            var si = self._pokerList[i].num;
            dict2[si] = dict2[si] === undefined ? 1 : dict2[si] + 1;
            if (self._pokerList[i].num > 10) {
                than10 = than10 + 1;
            }
        };
        var point = s % 10;
        var exists = false;
        for (var i in dict) {
            var other = (10 + point - i) % 10;
            if (dict[other]) {
                if (other == i && dict[other] >= 2 || other != i && dict[other] >= 1) {
                    exists = true;
                    break;
                }
            }
        }
        if (point == 0) {
            point = 10;
        }; //牛牛
        if (t <= 10) {
            point = 13;
        }; //五小
        for (var k in dict2) {
            if (dict2[k] >= 4) {
                point = 12; //炸弹
            }
        }
        if (than10 == 5) {
            point = 11; //五花
        }
        return exists ? point : 0;
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
        //# sourceMappingURL=Control.js.map
        