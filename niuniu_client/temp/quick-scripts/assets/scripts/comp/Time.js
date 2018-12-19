(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/comp/Time.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1e1a8aDeEhDXpCp2LDjN0b6', 'Time', __filename);
// scripts/comp/Time.js

"use strict";

cc.Class({
	extends: cc.Component,
	properties: {
		_time: 10,
		_args: null,
		_showtime: 0,
		_eventName: null
	},

	onLoad: function onLoad() {},

	init: function init(args) {
		this.node.active = false;
		this._args = args;
		this._time = this._args.time;
		this._showtime = Date.parse(new Date()) / 1000;
		this.node.x = this._args.x;
		this.node.y = this._args.y;
		this._eventName = this._args.eventName;
		this.node.getChildByName("timelabel").getComponent(cc.Label).string = this._time;
		this.initView();
	},
	initView: function initView() {
		this.node.active = true;
	},
	hide: function hide() {
		this.node.removeFromParent();
	},
	update: function update() {
		if (this.node.active == true) {
			if (this._showtime > 0) {
				if (this._time > 0) {
					if (Date.parse(new Date()) / 1000 >= this._showtime + 1) {
						this._showtime = Date.parse(new Date()) / 1000;
						this._time = this._time - 1;
						if (this._time < 10) {
							this._time = this._time;
						}
						this.node.getChildByName("timelabel").getComponent(cc.Label).string = this._time;
					}
				} else {
					if (this.node.active == true) {
						if (this._eventName != null) {
							cc.vv.gameNetMgr.dispatchEvent(this._eventName);
							this.hide();
						}
					}
				}
			} else {}
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
        //# sourceMappingURL=Time.js.map
        