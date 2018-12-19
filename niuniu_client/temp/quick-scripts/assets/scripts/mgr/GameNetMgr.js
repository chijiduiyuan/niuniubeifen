(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/mgr/GameNetMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '36540G872FH34jVagdvHhHN', 'GameNetMgr', __filename);
// scripts/mgr/GameNetMgr.js

"use strict";

window.Grobal = {
    uid: null, //玩家ID
    socket: null,
    roomNum: 0, //房号
    allPokers: new Array(), //所有牌
    selectPokers: new Array(), //选择的牌
    isPass: false, //是否点了不出
    isReady: false,
    status: "standup",
    isGrab: false, //
    seatIndex: -1, // 当前玩家位置的序号 （0，1，2）
    pokerSpriteFrameMap: null,
    dealInfo: null,
    roomUser: null, //房主用户名
    maxOfGame: 0, //最大局数
    numOfGame: 0,
    startTime: null, //房间创建时间
    roomStatus: "ready"
};

Grobal.reset = function () {
    Grobal.allPokers = new Array();
    Grobal.selectPokers = new Array();
    Grobal.isPass = false;
    Grobal.isReady = false;
    Grobal.status = "standup";
    Grobal.dealInfo = null;
};

cc.Class({
    extends: cc.Component,
    properties: {
        dataEventHandler: null,
        readyCount: 0,
        playerList: new Array(),
        seats: null,
        chatVoices: null
    },

    dispatchEvent: function dispatchEvent(event, data) {
        if (this.dataEventHandler) {
            this.dataEventHandler.emit(event, data);
        }
    },


    connectGameServer: function connectGameServer(data) {
        var self = this;
        cc.vv.socket.ip = data.ip + ":" + data.port;
        var onConnectOK = function onConnectOK() {};
        var onConnectFail = function onConnectFail() {};
        cc.vv.socket.connect(onConnectOK, onConnectFail);
        Grobal.socket = cc.vv.socket;
    },

    getLocalIndex: function getLocalIndex(index) {
        var playerNum = cc.args["ext_json"]['playerNum'] * 1;
        var ret = (Grobal.seatIndex + playerNum - index) % playerNum;
        return ret;
    },
    getSeatIndexByID: function getSeatIndexByID(userid) {
        for (var i = 0; i < this.playerList.length; ++i) {
            var s = this.playerList[i];
            if (s !== null && s.uid == userid) {
                return i;
            }
        }
        return -1;
    },
    getSeatNodeByUid: function getSeatNodeByUid(userid) {
        var localIndex = -1;
        if (this.seats == null) {
            return localIndex;
        }
        var index = cc.vv.gameNetMgr.getSeatIndexByID(userid);
        localIndex = cc.vv.gameNetMgr.getLocalIndex(index);
        return localIndex;
    },

    getIsOpen: function getIsOpen() {
        for (var i = 0; i < this.playerList.length; i++) {
            var p = this.playerList[i];
            if (p.status != "standup" && p.status != "ready") {
                return true;
            }
        }
        return false;
    },
    SetSeatInfo: function SetSeatInfo() {
        for (var i = 0; i < this.playerList.length; ++i) {
            var s = this.playerList[i];
            if (s !== null && s.uid == Grobal.uid) {
                Grobal.seatIndex = i;
                Grobal.isReady = s.isReady;
                Grobal.status = s.status;
                Grobal.isGrab = s.isGrab;
            }
        }
    },

    doPlayVoice: function doPlayVoice(data) {
        this.dispatchEvent("voice_msg_owners", data);
    },

    onRoomJoin: function onRoomJoin() {
        var self = this;
        cc.vv.socket.addHandler('startagain_success', function (msg) {
            Grobal.status = "standup";
            cc.vv.userMgr.enterRoom(Grobal.roomNum);
        });
        cc.vv.socket.addHandler('exit_success', function (msg) {
            if (!cc.LOCALHOST) {
                cc.vv.hallSDK.goHall();
            } else {
                window.location.href = "/";
            }
        });

        cc.vv.socket.addHandler(Grobal.roomNum + 'room_player_changed', function (msg) {
            var messagestr = "";
            var messagestr2 = "";
            for (var i = 0; i < msg.length; ++i) {
                var p = msg[i];
                if (p.uid == Grobal.uid && p.status == "ready") {
                    messagestr = "你已准备";
                } else if (p.status == "ready") {
                    if (messagestr2 == "") {
                        messagestr2 = "已准备的用户有:" + p.userName;
                    } else {
                        messagestr2 = messagestr2 + "、" + p.userName;
                    }
                }
            }
            if (messagestr != "" && messagestr2 == "") {
                messagestr2 = "还没有其他用户准备";
            }
            if (messagestr != "") {
                //self.dispatchEvent('show_tips_message',messagestr);
            }
        });
        cc.vv.socket.addHandler('room_dissolve', function (msg) {
            cc.vv.uitools.ShowAlert(cc.director.getScene(), "房间已经被房主解散了", function () {
                if (!cc.LOCALHOST) {
                    cc.vv.hallSDK.goHall();
                } else {
                    window.location.href = "/";
                }
            }, false);
        });

        cc.vv.socket.addHandler(Grobal.roomNum + 'joinRoom', function (msg) {
            cc.vv.gameNetMgr.playerList = msg.playerList;
            Grobal.maxOfGame = msg.maxOfGame;
            Grobal.startTime = msg.startTime;
            Grobal.roomUser = msg.roomUser;
            Grobal.numOfGame = msg.numOfGame;
            cc.vv.gameNetMgr.SetSeatInfo();
            self.dispatchEvent('new_user_comes_push');
        });
        cc.vv.socket.addHandler(Grobal.uid + 'disconnect_server', function (msg) {
            cc.vv.userMgr.login();
        });
        cc.vv.socket.addHandler(Grobal.roomNum + 'startGame', function (msg) {
            Grobal.numOfGame = msg;
        });
        cc.vv.socket.addHandler('checkPlayerStatus_success', function (msg) {
            cc.vv.gameNetMgr.playerList = msg.playerList;
            self.dispatchEvent('checkPlayerStatus_success');
        });

        //抢庄的模式
        cc.vv.socket.addHandler(Grobal.roomNum + 'startGrab', function (msg) {
            if (msg && msg.playerList) {
                cc.vv.gameNetMgr.playerList = msg.playerList;
                cc.vv.gameNetMgr.SetSeatInfo();
            }
            self.dispatchEvent('start_qiang_zhuang');
        });
        //选择倍数
        cc.vv.socket.addHandler(Grobal.roomNum + 'selectrate', function (msg) {
            if (msg && msg.playerList) {
                cc.vv.gameNetMgr.playerList = msg.playerList;
                cc.vv.gameNetMgr.SetSeatInfo();
            }

            if (msg && msg.isdeal_zhuan == true) {} else {
                self.dispatchEvent('shezhi_beishu');
            }
        });
        //用户状态更新，打牌，抢庄，倍数
        cc.vv.socket.addHandler(Grobal.roomNum + 'play_state_change', function (msg) {
            self.dispatchEvent("play_state_change", msg);
        });
        //通知用户看牌
        cc.vv.socket.addHandler(Grobal.roomNum + 'kanpai_state_change', function (msg) {
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "点击牌面看牌");
        });
        //显示信息
        cc.vv.socket.addHandler('show_tips', function (msg) {
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message', msg.info);
        });
        //房间状态更新
        cc.vv.socket.addHandler(Grobal.roomNum + 'state_changed', function (msg) {
            if (msg && msg.playerList) {
                cc.vv.gameNetMgr.playerList = msg.playerList;
                cc.vv.gameNetMgr.SetSeatInfo();
                self.dispatchEvent('user_state_changed');
            }
        });
        cc.vv.socket.addHandler("voice_msg_push", function (data) {
            self.dispatchEvent("voice_msg", data);
        });

        cc.vv.socket.addHandler("quick_chat_push", function (data) {
            self.dispatchEvent("quick_chat_push", data);
        });

        cc.vv.socket.addHandler("emoji_push", function (data) {
            self.dispatchEvent("emoji_push", data);
        });

        cc.vv.socket.addHandler(Grobal.roomNum + "deal_zhuang", function (data) {
            if (data.zhuang == Grobal.uid) {
                Grobal.isGrab = true;
            } else {
                Grobal.isGrab = false;
            }
            //cc.vv.gameNetMgr.dispatchEvent('show_tips_message',"等待系统决定庄家");
            self.dispatchEvent("deal_zhuang", data);
        });

        cc.vv.socket.addHandler(Grobal.uid + 'dealingCards', function (msg) {
            Grobal.allPokers = msg.pokerList;
            if (msg && msg.playerList) {
                cc.vv.gameNetMgr.playerList = msg.playerList;
            }
            self.dispatchEvent('user_state_dealingCards', msg);
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message');
        });

        cc.vv.socket.addHandler(Grobal.uid + 'dealingTheFiveCards', function (msg) {
            Grobal.allPokers = msg.pokerList;
            self.dispatchEvent('user_dealingTheFiveCards', msg);
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "请摊牌");
        });

        cc.vv.socket.addHandler(Grobal.uid + 'dealingTheFourCards', function (msg) {
            Grobal.allPokers = msg.pokerList;
            self.dispatchEvent('user_dealingTheFourCards', msg);
        });

        cc.vv.socket.addHandler(Grobal.roomNum + 'play', function (msg) {
            self.dispatchEvent('user_state_play', msg);
        });
        cc.vv.socket.addHandler('playError', function (msg) {
            cc.vv.uitools.ShowAlert(cc.director.getScene(), msg, function () {}, false);
        });
        cc.vv.socket.addHandler(Grobal.roomNum + 'gameFinish', function (msg) {
            Grobal.allPokers.splice(0, Grobal.allPokers.length);
            Grobal.selectPokers.splice(0, Grobal.selectPokers.length);
            self.dispatchEvent('single_game_finish', msg);
        });

        cc.vv.socket.addHandler(Grobal.roomNum + 'playSuccess', function (msg) {
            if (msg.error !== 0) {
                Grobal.selectPokers = new Array();
            } else {
                if (msg.pokerPlayList != null && msg.pokerPlayList != undefined) {
                    Grobal.selectPokers = msg.pokerPlayList;
                }
                self.dispatchEvent('card_playSuccess', msg);
            }
        });

        cc.vv.socket.addHandler(Grobal.roomNum + 'ready_done', function (msg) {
            self.dispatchEvent('ready_done');
            //cc.vv.gameNetMgr.dispatchEvent('show_tips_message',"等待其他玩家准备");
        });

        cc.vv.socket.addHandler('qiangzhuang_done', function (msg) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            Grobal.status = "qianged";
            self.dispatchEvent('qiangzhuang_done');
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "等待其他玩家选择");
        });
        cc.vv.socket.addHandler('dealbaserate_success', function (msg) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            Grobal.status = "beishu";
            self.dispatchEvent('dealbaserate_success');
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "等待闲家下注");
        });
        cc.vv.socket.addHandler('dealpoker_done', function (msg) {
            if (Grobal.status == "standup" || Grobal.status == "ready") {
                return;
            }
            Grobal.status = "arranged";
            self.dispatchEvent('dealpoker_done');
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "等待摊牌");
        });
        cc.vv.socket.addHandler(Grobal.roomNum + 'game_score', function (msg) {
            Grobal.dealInfo = msg;
            self.dispatchEvent('card_start_play', msg);
            cc.vv.gameNetMgr.dispatchEvent('show_tips_message');
            cc.vv.uitools.ClearTime(cc.director.getScene());
        });
        cc.vv.socket.addHandler(Grobal.roomNum + 'user_deal_poker_done', function (msg) {
            self.dispatchEvent('user_deal_poker_done', msg);
        });
        cc.vv.socket.addHandler(Grobal.uid + '_user_deal_poker_done', function (msg) {
            self.dispatchEvent('user_deal_poker_done', msg);
        });

        cc.vv.socket.addHandler(Grobal.roomNum + 'room_time_update', function (msg) {
            var event = msg.roomStage + "_event";
            var passTime = msg.stagetime - msg.servertime;
            var time = msg.lasttime - passTime;
            cc.vv.uitools.ShowTime("Time", cc.director.getScene(), { time: time, x: cc.director.getVisibleSize().width / 2, y: 600, eventName: event });
        });
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
        //# sourceMappingURL=GameNetMgr.js.map
        