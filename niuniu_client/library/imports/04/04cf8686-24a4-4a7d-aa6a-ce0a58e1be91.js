"use strict";
cc._RF.push(module, '04cf8aGJKRKfapqzgpY4b6R', 'AudioMgr');
// scripts/mgr/AudioMgr.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume: 1.0,
        sfxVolume: 1.0,
        bgmAudioID: -1
    },

    init: function init() {
        this.resetLocalAudio();
        cc.game.on(cc.game.EVENT_HIDE, function () {
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.audioEngine.resumeAll();
        });
    },
    resetLocalAudio: function resetLocalAudio() {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if (t != null) {
            this.bgmVolume = parseFloat(t);
        } else {
            this.bgmVolume = parseFloat(0.2);
            this.setBGMVolume(0.3);
        }
        var t = cc.sys.localStorage.getItem("sfxVolume");
        if (t != null) {
            this.sfxVolume = parseFloat(t);
        } else {
            this.sfxVolume = parseFloat(0.9);
            this.setSFXVolume(1);
        }
    },
    getUrl: function getUrl(url) {
        return cc.url.raw("resources/sounds/" + url);
    },

    setSFXVolume: function setSFXVolume(v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    },

    setBGMVolume: function setBGMVolume(v) {
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            } else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
        }
        if (this.bgmVolume != v) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    },

    pauseAll: function pauseAll() {
        cc.audioEngine.pauseAll();
    },

    resumeAll: function resumeAll() {
        cc.audioEngine.resumeAll();
    },

    playBGM: function playBGM(url) {
        var audioUrl = this.getUrl(url);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        if (this.bgmVolume > 0) {
            this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
        }
    },
    playSFX: function playSFX(url) {
        var audioUrl = this.getUrl(url);
        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    }
});

cc._RF.pop();