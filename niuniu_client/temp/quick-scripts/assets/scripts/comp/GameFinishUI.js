(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/GameFinishUI.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '70609wjrC9M6asQUUB/YoGT', 'GameFinishUI', __filename);
// scripts/comp/GameFinishUI.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        _args: null,
        info: cc.Node,
        share: cc.Button,
        follow: cc.Button,
        restart: cc.Button,
        close: cc.Button
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.info.active = false;
    },

    init: function init(args) {
        this._args = args;
        this.initView();
    },

    initView: function initView() {
        var self = this;
        this.info.active = true;
        var roominfo = self.info.getChildByName("roominfo");
        roominfo.getChildByName("roomnum").getComponent(cc.Label).string = Grobal.roomNum;
        roominfo.getChildByName("jushu").getComponent(cc.Label).string = Grobal.maxOfGame;
        for (var i = 0; i < self._args.playerList.length; i++) {
            var player = self._args.playerList[i];
            if (player.uid == Grobal.roomUser) {
                roominfo.getChildByName("roomuser").getComponent(cc.Label).string = player.userName;
            }
        }
        var d = new Date(Grobal.startTime);
        roominfo.getChildByName("starttime").getComponent(cc.Label).string = d.getMonth() + 1 + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();

        cc.vv.uitools.addClickEvent(self.follow, this.node, "GameFinishUI", "onFollowClick");
        cc.vv.uitools.addClickEvent(self.share, this.node, "GameFinishUI", "onShareClick");
        cc.vv.uitools.addClickEvent(self.restart, this.node, "GameFinishUI", "onRestartClick");
        cc.vv.uitools.addClickEvent(self.close, this.node, "GameFinishUI", "onCloseClick");
        self.ShowUserInfo();
    },

    ShowUserInfo: function ShowUserInfo() {
        var self = this;
        var user = self.info.getChildByName("user");
        var first = self._args.playerList[0];
        for (var i = 0; i < self._args.playerList.length; i++) {
            var name = "user" + (i + 1);
            var userinfo = user.getChildByName(name);
            var player = self._args.playerList[i];
            userinfo.getChildByName("username").getComponent(cc.Label).string = player.userName;
            userinfo.getChildByName("id").getComponent(cc.Label).string = player.uid;
            var score = player.score;
            userinfo.getChildByName("score").getComponent(cc.Label).string = score;
            userinfo.active = true;
            if (i == 0) {
                userinfo.getChildByName("fangzhu").active = true;
            } else if (first.score == score) {
                userinfo.getChildByName("fangzhu").active = true;
            } else {
                userinfo.getChildByName("fangzhu").active = false;
            }
            var index = cc.vv.gameNetMgr.getSeatNodeByUid(player.uid);
            if (cc.vv.gameNetMgr.seats[index] !== undefined) {
                userinfo.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = cc.vv.gameNetMgr.seats[index].getUserIcon();
            }
            userinfo.active = true;
        }
    },

    onRestartClick: function onRestartClick() {
        if (cc.args["ext"] == undefined) {
            //{"guipai":"0","jiase":"0","zuozhuang":"1","playType":"fzwf"}  本地调试，拿这个区encode
            cc.args["ext"] = "%7b%22guipai%22%3a%220%22%2c%22playType%22%3a%22nor%22%2c%22zhuangType%22%3a%22turn%22%2c%22niu7%22%3a%22bei1%22%7d";
            // cc.args["ext"] = "%7b%22guipai%22%3a%220%22%2c%22jiase%22%3a%220%22%2c%22zuozhuang%22%3a%221%22%2c%22playType%22%3a%22fzwf%22%7d"
        }
        if (cc.args["inningsNum"] == undefined) {
            cc.args["inningsNum"] = 4;
        }
        var data = {
            uid: Grobal.uid,
            userName: cc.args["userName"],
            avatar: cc.args["avatar"],
            roomNum: Grobal.roomNum,
            conf: cc.args["ext"],
            inningsNum: cc.args["inningsNum"]
        };
        Grobal.status = "standup";
        cc.vv.socket.send('startagain', data);
    },

    onCloseClick: function onCloseClick() {
        if (cc.sys.isNative) {
            cc.director.loadScene("web");
        } else {
            window.location.href = "/";
        }
    },

    onFollowClick: function onFollowClick() {
        if (cc.sys.isNative) {
            cc.director.loadScene("web");
        } else {
            cc.vv.uitools.ShowAlert(cc.director.getScene(), "关注", null, true);
        }
    },

    onShareClick: function onShareClick() {
        cc.vv.hallSDK.goShare();
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
        //# sourceMappingURL=GameFinishUI.js.map
        