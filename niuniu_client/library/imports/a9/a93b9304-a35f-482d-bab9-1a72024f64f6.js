"use strict";
cc._RF.push(module, 'a93b9MEo19ILbq5GnICT2T2', 'GamePlay');
// scripts/logic/GamePlay.js

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function clone(obj) {
    if (null == obj || "object" != (typeof obj === "undefined" ? "undefined" : _typeof(obj))) return obj;
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0; i < obj.length; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
}

cc.Class({
    extends: cc.Component,

    properties: {
        poker: {
            default: null,
            type: cc.Prefab
        },
        myNode: {
            default: null,
            type: cc.Node
        },
        readyBtn: {
            default: null,
            type: cc.Button
        },
        backPrefab: {
            default: null,
            type: cc.Prefab
        },
        _backPrefabPool: null,
        _clickTimeArray: null,
        _voiceMsgQueue: [],
        _lastPlayTime: null,
        _voice_btn: {
            default: null,
            type: cc.Button
        },
        _playingSeat: null
    },

    onLoad: function onLoad() {
        cc.view.setDesignResolutionSize(640, 1024, 0);
        this._backPrefabPool = new cc.NodePool();
        this._pokerSpriteFrameMap = {};
        this._clickTimeArray = new Array();
        var _pokerSpriteFrameMap = this._pokerSpriteFrameMap;
        var self = this;
        this.myNode.active = true;
        //出牌按钮注册
        this.readyBtn.node.on(cc.Node.EventType.TOUCH_START, this.readyCallBack, this);

        if (Grobal.numOfGame == 0) {
            cc.find("Canvas/room_bg/roomjushu").getComponent(cc.Label).string = "1 / " + Grobal.maxOfGame + " 局";
        } else {
            cc.find("Canvas/room_bg/roomjushu").getComponent(cc.Label).string = "" + Grobal.numOfGame + " / " + Grobal.maxOfGame + " 局";
        }

        cc.loader.loadRes("comm/pokers", cc.SpriteAtlas, function (err, assets) {
            var sflist = assets.getSpriteFrames();
            for (var i = 0; i < sflist.length; i++) {
                var sf = sflist[i];
                _pokerSpriteFrameMap[sf._name] = sf;
                Grobal.pokerSpriteFrameMap = _pokerSpriteFrameMap;
            }
            if (Grobal.numOfGame == 0) {
                var userNames = "";
                for (var i = 0; i < cc.vv.gameNetMgr.playerList.length; ++i) {
                    var p = cc.vv.gameNetMgr.playerList[i];
                    if (p.uid == Grobal.uid) {
                        continue;
                    }
                    if (userNames == "") {
                        userNames = userNames + p.userName;
                    } else {
                        userNames = userNames + "、" + p.userName;
                    }
                }
                if (userNames != "") {
                    self.init();
                } else {
                    self.init();
                }
            } else {
                self.init();
            }
        });
        cc.vv.audioMgr.playBGM("bgm_room_1.mp3");
    },

    init: function init() {
        cc.vv.gameNetMgr.dispatchEvent('game_play_init_over', true);
        this.myNode.active = false;
        var self = this;

        if (cc.vv.gameNetMgr.getIsOpen()) {
            self.readyBtn.node.active = false;
        }
        this._voice_btn = cc.find("Canvas/gameview/voiceBtn").getComponent(cc.Button);
        var pokerPrefab = this.poker;

        if (Grobal.status != "standup" || Grobal.status != "ready") {
            self.checkPlayerStatus();
        }
        if (Grobal.numOfGame == 0) {
            if (cc.vv.gameNetMgr.readyCount >= 2) {
                if (Grobal.seatIndex == 0) {}
            }
        }
        cc.vv.netRoot.on('game_restart', function (msgBean) {
            self.readyBtn.node.active = true;
            if (Grobal.numOfGame == Grobal.maxOfGame) {
                self.readyCallBack();
            }
            cc.vv.uitools.ClearTime(cc.director.getScene());
        }, this);
        cc.vv.netRoot.on('game_restart_notice', function (msgBean) {
            self.readyBtn.node.active = true;
        }, this);
        cc.vv.netRoot.on('reconnect_update', function (msg) {
            cc.vv.userMgr.enterRoom(Grobal.roomNum);
            self.checkPlayerStatus();
        }, this);
        cc.vv.netRoot.on('gameplayTimeout', function (msgBean) {
            self.readyCallBack();
        }, this);

        cc.vv.netRoot.on('single_game_finish', function (msg) {
            if (!cc.LOCALHOST) {
                var result = cc.vv.hallSDK.goResult();
                if (!result) {
                    cc.vv.uitools.ShowLayer("GameFinishUI", self.node, msg.detail);
                }
            } else {
                cc.vv.uitools.ShowLayer("GameFinishUI", self.node, msg.detail);
            }
        }, this);

        cc.vv.netRoot.on('user_state_dealingCards', function (msgBean) {
            cc.find("Canvas/room_bg/roomjushu").getComponent(cc.Label).string = "" + Grobal.numOfGame + " / " + Grobal.maxOfGame + " 局";
            self.readyBtn.node.active = false;
            if (Grobal.allPokers.length > 0) {
                var myNodeScript = self.myNode.getComponent('Control');
                //myNodeScript.showSelectNiu()
                myNodeScript.displayAndClickPokers(clone(Grobal.allPokers));
                self.myNode.active = true;
            }
        }, this);

        cc.vv.netRoot.on('user_dealingTheFiveCards', function (msgBean) {
            self.readyBtn.node.active = false;
            if (Grobal.allPokers.length > 0) {
                var myNodeScript = self.myNode.getComponent('Control');
                myNodeScript.showSelectNiu();
                myNodeScript.displayPokers(clone(Grobal.allPokers), false);
                self.myNode.active = true;
            }
        }, this);

        cc.vv.netRoot.on('user_dealingTheFourCards', function (msgBean) {
            self.readyBtn.node.active = false;
            if (Grobal.allPokers.length > 0) {
                var myNodeScript = self.myNode.getComponent('Control');
                myNodeScript.displayPokers(clone(Grobal.allPokers), false);
                self.myNode.active = true;
            }
        }, this);

        cc.vv.netRoot.on('start_qiang_zhuang', function (msgBean) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                self.readyBtn.node.active = false;
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "请等待下一局");
                return;
            }
            self.readyBtn.node.active = false;
            var myNodeScript = self.myNode.getComponent('Control');
            myNodeScript.showQiangZhuan();
            cc.vv.audioMgr.playSFX('effect/room_start_compare.mp3');
            self.myNode.active = true;
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "抢庄");
        }, this);

        cc.vv.netRoot.on('shezhi_beishu', function (msgBean) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            self.readyBtn.node.active = false;
            if (Grobal.isGrab == true) {
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "等待闲家下注");
            } else {
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "请下注");
            }
        }, this);
    },
    checkPlayerStatus: function checkPlayerStatus() {
        cc.vv.socket.send('checkPlayerStatus', { roomNum: Grobal.roomNum });
    },

    readyCallBack: function readyCallBack() {
        var time = this.node.getChildByName("Time");
        if (time != undefined && time != null) {
            time.removeFromParent();
        }
        cc.vv.socket.send('ready', { uid: Grobal.uid, roomNum: Grobal.roomNum });
        var myNodeScript = this.myNode.getComponent('Control');
        myNodeScript.reset();
        this.readyBtn.node.active = false;
    },

    update: function update(dt) {
        if (this._lastPlayTime != null) {
            if (Date.now() > this._lastPlayTime + 1000) {
                this.onPlayerOver();
                this._lastPlayTime = null;
            }
        } else {
            if (this._voiceMsgQueue.length > 0) {
                this.playVoice();
            }
        }
    }
});

cc._RF.pop();