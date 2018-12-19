"use strict";
cc._RF.push(module, 'e8e118sLfNKiJkR8tTsEQj+', 'Seat');
// scripts/comp/Seat.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        _isinit: false,
        _unsel: null,
        _userInfo: null,
        _offline: null,
        _userName: null,
        _userScore: null,
        _userImage: null,
        _userState: null,
        _userFrame: null,
        _bg: null,
        _info: null,
        _userIcon: null,
        _voicemsg: null,
        _adj: null,
        _voicetime: 0,
        _voicenum: 3,
        _fangzhu: null,
        _guanzhan: null
    },

    onLoad: function onLoad() {
        if (this._isinit == false) {
            this.init();
        }
    },

    init: function init() {
        this._state = this.node.getChildByName("state");

        this._statesp = this._state.getChildByName("spr");
        this._stateSpr = this._state.getChildByName("spr").getComponent(cc.Sprite);
        this._userInfo = this.node.getChildByName("user_info");
        this._guanzhan = this._userInfo.getChildByName("guanzhan");
        this._offline = this._userInfo.getChildByName("user_offline");
        this._fangzhu = this._userInfo.getChildByName("fangzhu");
        this._userState = this._userInfo.getChildByName("user_state");
        this._userName = this._userInfo.getChildByName("user_name").getComponent(cc.Label);
        this._userScore = this._userInfo.getChildByName("user_score").getComponent(cc.Label);
        this._userIcon = this._userInfo.getChildByName("user_icon").getComponent(cc.Sprite);
        this._userFrame = this._userInfo.getChildByName("frame");
        this._userFrame.active = false;
        this._voicemsg = this.node.getChildByName("voicemsg");
        if (this._voicemsg != null) {
            this._adj = this._voicemsg.getChildByName("adj");
            this._voicemsg.active = false;
        }
        this._isinit = true;
    },

    getUserIcon: function getUserIcon() {
        return this._userIcon.spriteFrame;
    },
    showZhuan: function showZhuan(bool) {
        this._fangzhu.active = bool;
    },
    getIsZhuan: function getIsZhuan() {
        if (this._fangzhu.active == true) {
            return true;
        }
        return false;
    },
    onIconClicked: function onIconClicked(event) {
        if (this._info.status == "standup") {
            return;
        }
        var msg = {};
        msg.spriteFrame = this._userIcon.spriteFrame;
        msg.uid = this._info.uid;
        msg.ip = this._info.ip;
        msg.userName = this._info.userName;
        cc.vv.uitools.ShowLayer("UserInfo", cc.director.getScene(), msg);
    },
    setUserIcon: function setUserIcon(avatar) {
        var self = this;
        cc.loader.load(decodeURIComponent(avatar), function (err, tex) {
            if (tex && tex.width > 0) {
                self._userIcon.spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
            }
        });
    },
    getSeatUid: function getSeatUid() {
        if (this._info == undefined || this._info == null) {
            return -1;
        }
        return this._info.uid;
    },
    voiceMsg: function voiceMsg(show) {
        if (this._voicemsg) {
            this._voicemsg.active = show;
            if (show === true) {
                this._voicenum = 3;
                this._voicetime = Date.now();
            } else {
                this._voicetime = 0;
            }
        }
    },
    updateQiangStatus: function updateQiangStatus() {
        var self = this;
        var beishu_0 = self._state.getChildByName("beishu");
        for (var i = 0; i < cc.vv.gameNetMgr.playerList.length; i++) {
            var p = cc.vv.gameNetMgr.playerList[i];
            if (p.isGrab == true && p.uid == self._info.uid) {
                if (beishu_0 != undefined && beishu_0 != null) {
                    beishu_0.active = true;
                }
            }
        }
        self._statesp.active = false;
    },
    onShowState: function onShowState(pic, beishu) {
        var self = this;
        if (!beishu) {
            beishu = 0;
        }
        if (pic == "wu") {
            self._state.active = false;
            self._statesp.active = false;
            return;
        }
        self._state.active = true;
        self._statesp.active = true;
        var rate = self._state.getChildByName("rate");
        var win = self._state.getChildByName("win");
        var lose = self._state.getChildByName("lose");
        var beishu_0 = self._state.getChildByName("beishu");
        var ready = self._state.getChildByName("ready");
        rate.active = false;
        win.active = false;
        lose.active = false;
        ready.active = false;
        if (pic == "ready") {
            self._statesp.active = false;
            cc.loader.loadRes("niuniu/" + pic + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                ready.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            ready.active = true;
            return;
        }
        if (beishu_0 != undefined && beishu_0 != null) {
            beishu_0.active = false;
        }
        var beishuSpr = self._statesp.getChildByName("beishu");
        if (beishu > 0) {
            cc.loader.loadRes("niuniu/" + pic + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                self._stateSpr.spriteFrame = spriteFrame;
            });
            cc.loader.loadRes("niuniu/x" + beishu + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                beishuSpr.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            beishuSpr.active = true;
            if (beishu_0 != undefined && beishu_0 != null) {
                cc.loader.loadRes("niuniu/x" + beishu + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                    beishu_0.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                beishu_0.active = false;
            }
        } else {
            cc.loader.loadRes("niuniu/" + pic + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                self._stateSpr.spriteFrame = spriteFrame;
            });
            if (beishuSpr != undefined && beishuSpr != null) {
                beishuSpr.active = false;
            }
            if (beishu_0 != undefined && beishu_0 != null) {
                cc.loader.loadRes("niuniu/x1.png", cc.SpriteFrame, function (err, spriteFrame) {
                    beishu_0.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                beishu_0.active = false;
            }
        }
    },

    onShowStateBNum: function onShowStateBNum(value, state) {
        var self = this;
        self._state.active = true;
        self._statesp.active = false;
        var rate = self._state.getChildByName("rate");
        var win = self._state.getChildByName("win");
        var lose = self._state.getChildByName("lose");
        var beishu_0 = self._state.getChildByName("beishu");
        var ready = self._state.getChildByName("ready");
        beishu_0.active = false;
        ready.active = false;
        win.stopAllActions();
        lose.stopAllActions();
        if (state == "rate") {
            rate.active = true;
            win.active = false;
            lose.active = false;
            var label = rate.getComponent(cc.Label);
            label.string = "x" + value;
        } else {
            if (value > 0) {
                rate.active = false;
                win.active = true;
                win.opacity = 255;
                lose.active = false;
                var label = win.getComponent(cc.Label);
                label.string = "+" + Math.abs(value);
            } else {
                rate.active = false;
                win.active = false;
                lose.active = true;
                lose.opacity = 255;
                var label = lose.getComponent(cc.Label);
                label.string = "-" + Math.abs(value);
            }
            var actArr = new Array();
            var action1 = cc.moveBy(2, cc.p(0, 30));
            var action2 = cc.fadeOut(0.1);
            var action3 = cc.moveBy(0.2, cc.p(0, -30));
            actArr.push(action1);
            actArr.push(action2);
            actArr.push(action3);
            var seq = cc.sequence(actArr);
            if (value > 0) {
                win.runAction(seq);
            } else {
                lose.runAction(seq);
            }
        }
    },
    updateUser: function updateUser(infos) {
        var self = this;
        var ready = self._state.getChildByName("ready");
        var beishuSpr = self._statesp.getChildByName("beishu");
        var beishu_0 = self._state.getChildByName("beishu");
        var rate = self._state.getChildByName("rate");
        if (infos.status == "standup") {
            var card = this.node.getComponent("Card");
            card.hideCard();
            if (Grobal.uid == self._info.uid) {
                cc.vv.gameNetMgr.dispatchEvent('game_restart_notice');
            }
        } else if (infos.status == "ready") {
            self._statesp.active = false;
            beishu_0.active = false;
            self._state.active = true;
            rate.active = false;
            cc.loader.loadRes("niuniu/ready.png", cc.SpriteFrame, function (err, spriteFrame) {
                ready.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            ready.active = true;
        } else if (infos.status == "qianged") {
            ready.active = false;
            beishu_0.active = false;
            self._statesp.active = true;
            rate.active = false;
            if (infos.QiangNum > 0) {
                cc.loader.loadRes("niuniu/qiangzhuang.png", cc.SpriteFrame, function (err, spriteFrame) {
                    self._stateSpr.spriteFrame = spriteFrame;
                });
                cc.loader.loadRes("niuniu/x" + infos.QiangNum + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                    beishuSpr.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                beishuSpr.active = true;
            } else {
                cc.loader.loadRes("niuniu/nograb_icon.png", cc.SpriteFrame, function (err, spriteFrame) {
                    self._stateSpr.spriteFrame = spriteFrame;
                });
                beishuSpr.active = false;
            }
        } else if (infos.status == "beishu") {
            ready.active = false;
            beishu_0.active = false;
            self._statesp.active = false;
            rate.active = false;
            if (infos.isGrab == true) {
                cc.loader.loadRes("niuniu/x" + infos.QiangNum + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                    beishu_0.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                beishu_0.active = true;
                self._fangzhu.active = true;
            }
        } else if (infos.status == "beishued" || infos.status == "arranging" || self._info.status == "arranged") {
            ready.active = false;
            beishu_0.active = false;
            self._statesp.active = false;
            if (infos.isGrab == true) {
                cc.loader.loadRes("niuniu/x" + infos.QiangNum + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                    beishu_0.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                beishu_0.active = true;
                self._fangzhu.active = true;
                rate.active = false;
            } else {
                if (infos.baserate > 0) {
                    var label = rate.getComponent(cc.Label);
                    label.string = "x" + infos.baserate;
                    rate.active = true;
                }
            }
        }
    },
    setUserInfo: function setUserInfo(info) {
        var self = this;
        self._info = info;
        if (this._isinit == false) {
            self.init();
        }
        if (self._info == null || self._info.status == null) {
            this._state.active = false;
            this._userInfo.active = false;
        } else {
            var ready = self._state.getChildByName("ready");
            var beishuSpr = self._statesp.getChildByName("beishu");
            var beishu_0 = self._state.getChildByName("beishu");
            var rate = self._state.getChildByName("rate");
            this._state.active = false;

            if (self._info.isOnline) {
                if (self._info.status == "ready") {
                    this._state.active = true;
                    ready.active = true;
                    beishuSpr.active = false;
                    beishu_0.active = false;
                    rate.active = false;
                    self._statesp.active = false;
                    self._fangzhu.active = false;
                } else if (self._info.status == "qianged") {
                    if (self._info.QiangNum > 0) {
                        cc.loader.loadRes("niuniu/qiangzhuang.png", cc.SpriteFrame, function (err, spriteFrame) {
                            self._stateSpr.spriteFrame = spriteFrame;
                        });
                        cc.loader.loadRes("niuniu/x" + self._info.QiangNum + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                            beishuSpr.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        });
                        beishuSpr.active = true;
                    } else {
                        cc.loader.loadRes("niuniu/nograb_icon.png", cc.SpriteFrame, function (err, spriteFrame) {
                            self._stateSpr.spriteFrame = spriteFrame;
                        });
                        beishuSpr.active = false;
                    }
                    self._statesp.active = true;
                    self._state.active = true;
                    ready.active = false;
                    beishu_0.active = false;
                    rate.active = false;
                } else if (self._info.status == "beishu") {
                    if (self._info.isGrab == true) {
                        if (self._info.QiangNum == 0 || self._info.QiangNum == undefined) {
                            self._info.QiangNum = 1;
                        }
                        cc.loader.loadRes("niuniu/x" + self._info.QiangNum + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                            beishu_0.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        });
                        beishu_0.active = true;
                        self._state.active = true;
                        self._fangzhu.active = true;
                    } else {
                        self._state.active = false;
                    }
                    self._statesp.active = false;
                    ready.active = false;
                    beishuSpr.active = false;
                    rate.active = false;
                } else if (self._info.status == "beishued" || self._info.status == "arranging" || self._info.status == "arranged") {
                    if (self._info.isGrab == true) {
                        if (self._info.QiangNum == 0 || self._info.QiangNum == undefined) {
                            self._info.QiangNum = 1;
                        }
                        cc.loader.loadRes("niuniu/x" + self._info.QiangNum + ".png", cc.SpriteFrame, function (err, spriteFrame) {
                            beishu_0.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        });
                        self._fangzhu.active = true;
                        beishu_0.active = true;
                        self._state.active = true;
                        self._statesp.active = false;
                        ready.active = false;
                        beishuSpr.active = false;
                        rate.active = false;
                    } else {
                        if (self._info.baserate > 0) {
                            var label = rate.getComponent(cc.Label);
                            label.string = "x" + self._info.baserate;
                            rate.active = true;
                            self._state.active = true;
                            beishu_0.active = false;
                        }
                        self._statesp.active = false;
                        ready.active = false;
                        beishuSpr.active = false;
                    }
                }
            }

            this._userInfo.active = true;
            if (self._info.avatar != null && self._info.avatar != undefined) {
                self.setUserIcon(self._info.avatar);
            }
            self._guanzhan.active = false;
            if ((self._info.status == "standup" || self._info.status == "ready") && self._info.isOnline) {
                if (cc.vv.gameNetMgr.getIsOpen()) {
                    self._guanzhan.active = true;
                }
            }
            if (self._info.isOnline) {
                self._offline.active = false;
            } else {
                self._offline.active = true;
            }
            if (self._info.isGrab == false || self._info.isGrab == null) {
                self._fangzhu.active = false;
            } else {
                self._fangzhu.active = true;
            }
        }
        if (this._userName && self._info !== null && self._info.uid !== null) {
            this._userName.string = decodeURIComponent(self._info.userName);
            this._userScore.string = self._info.score + "";
        }
        if (self._info !== null) {
            if (self._info.isQiang !== null) {
                if (self._info.isQiang == true) {
                    self.onShowState("graber_icon");
                }
            }
        }
    },

    setUserFrame: function setUserFrame(act) {
        if (act == true) {
            this._userFrame.active = true;
            this._userFrame.opacity = 255;
            var actArr = new Array();
            var action1 = cc.scaleTo(0.15, 1.1);
            var action2 = cc.scaleTo(0.15, 1);
            var action3 = cc.fadeOut(0.1);
            actArr.push(action1);
            actArr.push(action2);
            actArr.push(action3);
            var seq = cc.sequence(actArr);
            this._userFrame.runAction(seq);
            cc.vv.audioMgr.playSFX("effect/select.mp3");
        } else {
            this._userFrame.active = false;
            this._userFrame.opacity = 0;
        }
    },
    hideStatus: function hideStatus() {
        var self = this;
        self._state.active = false;
    },
    showFrameAction: function showFrameAction() {
        var self = this;
        self._userFrame.stopAllActions();
        self._userFrame.active = true;
        self._userFrame.opacity = 255;
        var actArr = new Array();
        var action0 = cc.fadeIn(0.1);
        var action1 = cc.scaleTo(0.4, 1.3);
        var action2 = cc.scaleTo(0.4, 1.05);
        var action3 = cc.blink(0.8, 3);
        var action4 = cc.fadeIn(0.1);
        actArr.push(action0);
        actArr.push(action1);
        actArr.push(action2);
        actArr.push(action3);
        actArr.push(action4);
        var seq = cc.sequence(actArr);
        this._userFrame.runAction(seq);
    },

    updateScore: function updateScore(score) {
        this._userScore.string = score + "";
    },
    update: function update(dt) {
        if (this._voicemsg != null) {
            if (this._voicemsg.active === true) {
                if (Date.now() - this._voicetime > 700 && this._voicetime > 0) {
                    this._voicetime = Date.now();
                    for (var i = 0; i < this._adj.children.length; ++i) {
                        this._adj.children[i].active = false;
                    }
                    this._adj.children[this._voicenum - 1].active = true;
                    this._voicenum = this._voicenum - 1;
                    if (this._voicenum <= 0) {
                        this._voicenum = 3;
                    }
                }
            }
        }
    }
});

cc._RF.pop();