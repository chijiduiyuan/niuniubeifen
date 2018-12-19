"use strict";
cc._RF.push(module, '19a3dEguhlEr7Dn9K1ADshi', 'Voice');
// scripts/comp/Voice.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        _emoji: null,
        _chatBubble: null,
        _voicemsg: null,
        _adj: null,
        _voicetime: 0,
        _voicenum: 3,
        _lastChatTime: -1
    },

    onLoad: function onLoad() {
        this.init();
    },

    init: function init() {
        this._chatBubble = this.node.getChildByName("ChatBubble");
        this._emoji = this.node.getChildByName("emoji");
        this._voicemsg = this.node.getChildByName("voicemsg");
        if (this._voicemsg != null) {
            this._adj = this._voicemsg.getChildByName("adj");
            this._voicemsg.active = false;
        }
        this._chatBubble.active = false;
        this._emoji.active = false;
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
    chat: function chat(content) {
        if (this._chatBubble == null || content == null) {
            return;
        }
        this._emoji.active = false;
        this._chatBubble.active = true;
        this._chatBubble.getChildByName("message").getComponent(cc.Label).string = content;
        this._chatBubble.getChildByName("chatbubble_bg").width = this._chatBubble.getChildByName("message").width + 35;
        this._lastChatTime = 3;
    },

    emoji: function emoji(_emoji) {
        if (this._emoji == null || _emoji == null) {
            return;
        }
        this._chatBubble.active = false;
        this._emoji.active = true;
        this._emoji.getComponent(cc.Animation).play(_emoji);
        this._lastChatTime = 3;
    },
    update: function update(dt) {
        if (this._lastChatTime > 0) {
            this._lastChatTime -= dt;
            if (this._lastChatTime < 0) {
                this._chatBubble.active = false;
                this._emoji.active = false;
                this._emoji.getComponent(cc.Animation).stop();
            }
        }
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