"use strict";
cc._RF.push(module, 'a8d41VU8uFBfoSPkMusKpsP', 'Game');
// scripts/logic/Game.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        _roominfo: null,
        _roomstate: null,
        _roombeishu: null,
        _roomjushu: null,
        _tips: null,
        _tipLabel: null,
        _tipslast: null,
        _lastTime: 0,
        _shengyinBtn: null,
        _homeBtn: null
    },

    onLoad: function onLoad() {

        var roombg = this.node.getChildByName("room_bg");
        var gameview = this.node.getChildByName("gameview");
        this._roominfo = roombg.getChildByName("roominfo").getComponent(cc.Label);
        this._roomstate = roombg.getChildByName("roomstate");
        this._roomjushu = roombg.getChildByName("roomjushu").getComponent(cc.Label);
        this._tips = gameview.getChildByName("tips");
        this._tipLabel = this._tips.getChildByName("label").getComponent(cc.Label);
        this._roominfo.string = "桌号：" + Grobal.roomNum; //桌号
        var card = cc.find("Canvas/gameview/fangka/card");
        if (card != null && card != undefined) {
            card.getComponent(cc.Label).string = cc.args["currency"] + "张"; //房卡
        }
        this._choiceBtn = gameview.getChildByName("choiceBtn");
        if (this._choiceBtn != null) {
            cc.vv.uitools.addClickEvent(this._choiceBtn, this.node, "GameLogic", "ShowControlList");
        }

        this.initHandlers();
        this.UpdateRoomInfo();
        this.initPreLoad();
    },

    initPreLoad: function initPreLoad() {
        cc.loader.loadRes("prefabs/AlertUI", function (err, prefab) {});
    },

    onTestCallBack: function onTestCallBack() {},

    onGuizeBtnClick: function onGuizeBtnClick() {
        if (!cc.LOCALHOST) {
            cc.vv.hallSDK.goRule();
        }
    },
    onTishiClick: function onTishiClick() {
        cc.vv.uitools.ShowLayer("TipRule", this.node);
    },
    onShengyinBtnClick: function onShengyinBtnClick() {
        cc.vv.uitools.ShowLayer("SettingUI2", this.node);
    },
    onHomeBtnClick: function onHomeBtnClick() {
        cc.vv.uitools.ShowAlert(cc.director.getScene(), "确认返回主页", function () {
            if (!cc.LOCALHOST) {
                cc.vv.hallSDK.goHall();
            } else {
                window.location.href = "/";
            }
        }, true);
    },
    onWanfaBtnClick: function onWanfaBtnClick() {

        if (!cc.LOCALHOST) {
            cc.vv.hallSDK.goWanfa();
        }
    },

    SetClick: function SetClick() {
        cc.vv.uitools.ShowLayer("SettingUI2", this.node);
    },

    ShowControlList: function ShowControlList() {
        var self = this;
        cc.loader.loadRes("prefabs/ControllUI", function (err, prefab) {
            if (self.node.getChildByName("ControllUI") == null) {
                var layer = cc.instantiate(prefab);
                self.node.addChild(layer);
            }
        });
    },

    ShowTips: function ShowTips(msg) {
        var self = this;
        if (msg == null) {
            self._tips.active = false;
        } else {
            self._tips.active = true;
            self._tipLabel.string = msg;
            self._tips.height = this._tips.getChildByName("label").height + 20;
            if ((Grobal.status == "standup" || Grobal.status == "ready") && msg != "网络不稳定,正在重新连接") {
                if (cc.vv.gameNetMgr.getIsOpen()) {
                    self._tipLabel.string = "请等待下一局";
                }
            }
        }
    },

    initHandlers: function initHandlers() {
        var self = this;
        cc.vv.netRoot.on('show_tips_message', function (msg) {
            self.ShowTips(msg.detail);
        }, this);
    },

    UpdateRoomInfo: function UpdateRoomInfo() {
        if (cc.args['ext'] != undefined && cc.args['ext'] != null) {
            var ext = JSON.parse(decodeURIComponent(cc.args['ext']));
            var difen = this._roomstate.getChildByName("difen").getComponent(cc.Label);
            difen.string = "底分：" + ext.difen + "分";
        }
    },
    update: function update(dt) {
        if (this._tips.active == true) {
            var str = this._tipLabel.string.replace(this._tipslast, "");
            if (Date.now() - this._lastTime > 1000) {
                if (this._tipslast == null || this._tipslast == "...") {
                    this._tipslast = ".";
                } else {
                    this._tipslast = this._tipslast + ".";
                }
                this._tipLabel.string = str + this._tipslast;
                this._lastTime = Date.now();
            }
        }
    }
});

cc._RF.pop();