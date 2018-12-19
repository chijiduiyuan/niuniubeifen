(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/logic/Loading.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'd5514vyyh1PT79voJ6ap6oD', 'Loading', __filename);
// scripts/logic/Loading.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel: cc.Label,
        _tipStr: '1',
        _isloading: false,
        _progress: 0.0,

        _lasttime: 0,
        _load: 0
    },

    onLoad: function onLoad() {
        cc.view.setDesignResolutionSize(640, 1024, 0);
        this.initConfig();
    },

    initConfig: function initConfig() {
        var self = this;
        cc.vv = {};
        cc.vv.http = require("../utils/HTTP");
        cc.loader.load(cc.url.raw('resources/config.json'), function (err, res) {
            if (err) {} else {
                cc.LOCALHOST = res.localhost;
                console.log('------------');
                console.log(location.hostname);
                if (res.localhost == 'auto') {
                    if (!cc.sys.isNative && location && (location.hostname == 'localhost' || location.hostname == '127.0.0.1')) {
                        cc.LOCALHOST = true;
                    } else {
                        cc.LOCALHOST = false;
                    }
                }
                cc.vv.http.url = res.http;
                cc.VERSION = res.version;
                cc.LocalGameId = res.localGameId;
                cc.LocalGameNum = res.localGameNum;
                self.initMgr();
            }
        });
    },

    initMgr: function initMgr() {
        cc.vv.socket = require("../utils/Socket");

        var AudioMgr = require("../mgr/AudioMgr");
        cc.vv.audioMgr = new AudioMgr();
        cc.vv.audioMgr.init();

        var UserMgr = require("../mgr/UserMgr");
        cc.vv.userMgr = new UserMgr();

        if (cc.vv.gameNetMgr == undefined) {
            var GameNetMgr = require("../mgr/GameNetMgr");
            cc.vv.gameNetMgr = new GameNetMgr();
        }
        var root = cc.find("root");
        cc.vv.gameNetMgr.dataEventHandler = root;
        cc.vv.netRoot = root;

        var UI = require("../comp/UI");
        cc.vv.uitools = new UI();

        if (cc.LOCALHOST == undefined || cc.VERSION == undefined) {
            cc.vv.uitools.ShowAlert(cc.director.getScene(), "配置加载失败，请重进", function () {
                window.parent.location.href = "/";
            }, false);
        }

        if (!cc.LOCALHOST) {
            cc.vv.hallPlay = hall_config;
        } else {
            cc.vv.hallPlay = {};
        }
        //console.log(cc.vv.hallPlay);
        //console.log(cc.vv.hallPlay.gameId);
        if (cc.vv.hallPlay.gameId != '') {
            cc.args = cc.vv.hallPlay;
        } else {
            cc.args = this.urlParse();
        }
        if (cc.args["ext"] != undefined) {
            var json = decodeURIComponent(cc.args["ext"]);
            cc.args["ext_json"] = JSON.parse(json);
            var wanfa = cc.args["ext_json"]['wanfa'];
            if (wanfa !== null) {
                var wanfas = wanfa.split("_");
                cc.args["ext_json"]['playType'] = wanfas[0];
                cc.args["ext_json"]['zhuangType'] = wanfas[1];
            }
            cc.args["ext"] = JSON.stringify(cc.args["ext_json"]);
        }
        if (!cc.LOCALHOST) {
            cc.vv.hallSDK = hall_api;
            cc.vv.hallSDK.init('{"uid":"' + cc.args["uid"] + '","gameId":"' + cc.args["gameId"] + '","roomNum":"' + cc.args["roomNum"] + '"}');
        }
        if (cc.args == undefined) {
            cc.args = {};
        }
        this._tips = cc.find("Canvas/nettips");
        this._tipLabel = this._tips.getComponent(cc.Label);
        this.startPreLoading();
    },

    ShowTips: function ShowTips(msg) {
        var self = this;
        if (msg == null) {
            self._tips.active = false;
        } else {
            self._tips.active = true;
            self._tipLabel.string = msg;
        }
    },

    startPreLoading: function startPreLoading() {
        this._tipStr = "正在加载资源，请稍候";
        this._isloading = true;
        var self = this;
        var process = 1;
        if (cc.args["uid"] !== undefined) {
            Grobal.uid = cc.args["uid"];
        } else {
            if (cc.LOCALHOST) {
                var num = Math.floor(Math.random() * 100) + 100;
                Grobal.uid = num.toString();
                cc.args["uid"] = Grobal.uid;
                cc.args["userName"] = Grobal.uid;
                if (cc.args["gameId"] == undefined) {
                    cc.args['gameId'] = cc.LocalGameId;
                }
                if (cc.args["roomNum"] == undefined) {
                    cc.args['roomNum'] = cc.LocalGameNum;
                }
            } else {}
        }

        if (cc.args["uid"] == undefined || cc.args["uid"] == null) {
            cc.vv.uitools.ShowAlert(cc.director.getScene(), "网络问题,请刷新重进", function () {
                if (cc.LOCALHOST) {
                    window.parent.location.href = "/";
                } else {
                    cc.vv.hallSDK.backRoom(cc.args["roomNum"]);
                }
            }, false);
        } else {
            cc.vv.userMgr.login();
        }
        cc.vv.netRoot.on('show_tips_message', function (msg) {
            self.ShowTips(msg.detail);
        }, this);
    },

    urlParse: function urlParse() {
        var params = {};
        if (window.location == null) {
            return params;
        }
        var name, value;
        var str = window.location.href;
        var num = str.indexOf("?");
        var href = str.substr(0, num);
        str = str.substr(num + 1);

        var arr = str.split("&");
        for (var i = 0; i < arr.length; i++) {
            num = arr[i].indexOf("=");
            if (num > 0) {
                name = arr[i].substring(0, num);
                value = arr[i].substr(num + 1);
                params[name] = value;
            }
        }
        params["href"] = href;
        return params;
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
        //# sourceMappingURL=Loading.js.map
        