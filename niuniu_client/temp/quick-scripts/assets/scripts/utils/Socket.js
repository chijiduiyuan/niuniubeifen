(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/utils/Socket.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '5349ay+m/ZJ84WTjxw3colC', 'Socket', __filename);
// scripts/utils/Socket.js

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

if (window.io == null) {
    // window.io = require("socket-io");
}

var Global = cc.Class({
    extends: cc.Component,

    statics: {
        ip: "",
        sio: null,
        isPinging: false,
        fnDisconnect: null,
        timeId: null,
        handlers: {},
        online: true,
        addHandler: function addHandler(event, fn) {
            if (this.handlers[event]) {
                return;
            }
            var handler = function handler(data) {
                if (event != "disconnect" && typeof data == "string") {
                    //console.log("Socket:"+data)
                    data = JSON.parse(data);
                }
                fn(data);
            };
            this.handlers[event] = handler;
            if (this.sio) {
                this.sio.on(event, handler);
            }
        },

        connect: function connect(fnConnect, fnError) {
            var self = this;
            var opts = {
                'reconnect': true,
                'reconnectionAttempts': 10,
                'reconnectionDelay': 1000,
                'reconnectionDelayMax': 2000,
                'timeout': 5000,
                'force new connection': true,
                'max reconnection attempts': 10,
                'transports': ['websocket', 'polling']
            };
            var isReconnext = false;
            this.sio = window.io.connect(this.ip, opts);
            this.sio.on('connecting', function (data) {});
            this.sio.on('connect', function (data) {
                self.sio.connected = true;
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', null);
                if (isReconnext) {
                    cc.vv.gameNetMgr.dispatchEvent('reconnect_update', null);
                }
            });
            this.sio.on('reconnecting', function (data) {
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "正在重连");
            });
            this.sio.on('reconnect', function (data) {
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "重连成功");
                isReconnext = true;
            });
            this.sio.on('connect_error', function (data) {
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "重连失败");
            });
            this.sio.on('disconnect', function (data) {
                self.sio.connected = false;
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "已断开连接，请重进");
            });
            this.sio.on('reconnect_failed', function (data) {
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "重连失败，请重进");
                cc.vv.uitools.ShowAlert(cc.director.getScene(), "你已断开连接,请重新连接", function () {
                    if (cc.sys.isNative) {
                        cc.director.loadScene("web");
                    } else {
                        window.parent.location.href = "/";
                    }
                }, false);
            });
            this.sio.on('connect_failed', function () {
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message', "连接失败");
                isReconnext = true;
            });

            for (var key in this.handlers) {
                var value = this.handlers[key];
                if (typeof value == "function") {
                    if (key == 'disconnect') {
                        this.fnDisconnect = value;
                    } else {
                        this.sio.on(key, value);
                    }
                }
            }
        },

        startHearbeat: function startHearbeat() {
            this.sio.on('game_pong', function (data) {
                self.lastRecieveTime = Date.now();
                self.delayMS = self.lastRecieveTime - self.lastSendTime;
                if (self.online == false) {
                    cc.vv.gameNetMgr.dispatchEvent('show_tips_message', null);
                    cc.vv.gameNetMgr.dispatchEvent('reconnect_update', null);
                }
                self.online = true;
            });
            this.lastRecieveTime = Date.now();
            var self = this;
            if (!self.isPinging) {
                self.isPinging = true;
                cc.game.on(cc.game.EVENT_HIDE, function () {
                    self.ping();
                });
                setInterval(function () {
                    if (self.sio) {
                        self.ping();
                    }
                }.bind(this), 5000);
                setInterval(function () {
                    if (self.sio) {
                        if (Date.now() - self.lastRecieveTime > 20000) {
                            self.close();
                        }
                    }
                }.bind(this), 500);
            }
        },

        send: function send(event, data) {
            if (this.sio && this.sio.connected) {
                if (data != null && (typeof data === "undefined" ? "undefined" : _typeof(data)) == "object") {
                    data = JSON.stringify(data);
                }
                this.sio.emit(event, data);
            }
        },
        ping: function ping() {
            if (this.sio) {
                var isonline = this.online;
                this.lastSendTime = Date.now();
                this.send('game_ping', { isonline: isonline });
            }
        },

        close: function close() {
            this.delayMS = null;
            if (this.sio && this.sio.connected) {
                this.sio.connected = false;
                this.sio.disconnect();
                this.sio = null;
            }
            this.sio = null;
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
        //# sourceMappingURL=Socket.js.map
        