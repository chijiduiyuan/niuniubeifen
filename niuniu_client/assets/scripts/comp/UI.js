

cc.Class({
    extends: cc.Component,

    properties: {
    },

    addClickEvent:function(node,target,component,handler){
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },

    ShowLoading:function(parent,timeout){
        var self = this
        if( timeout == undefined ||  timeout == null ){
            timeout = 8000;
        };
        cc.loader.loadRes("prefabs/LoadingUI",function(err,prefab){
            var loading = cc.instantiate(prefab);
            loading.tag = 10001;
            parent.addChild(loading);
        });
        parent.on("on_hide_loading_ui",function(event){
            if(parent.getChildByTag(10001)  !== null){
                parent.removeChildByTag(10001);
            }
        });
        setTimeout(function() {
            if(parent.getChildByTag(10001)  !== null){
                parent.removeChildByTag(10001);
            }
        }, timeout);
    },

    ShowAlert:function(parent,content,onok,showcancelbtn){
        cc.loader.loadRes("prefabs/AlertUI",function(err,prefab){
            var layer = cc.instantiate(prefab);
            layer.setPosition(cc.p(0, 0));
            layer.tag = 10003;
            if(parent.getChildByTag(10003)  !== null){
                parent.removeChildByTag(10003);
            }
            parent.addChild(layer);
            var alert = layer.getComponent("Alert");
            alert.show(content,onok,showcancelbtn);
        });
    },
    ShowAlert2:function(parent,content,onok,oncancel,showcancelbtn,okBtnTitle,cancelBtnTitle){
        cc.loader.loadRes("prefabs/AlertUI2",function(err,prefab){
            var layer = cc.instantiate(prefab);
            layer.setPosition(cc.p(0, 0));
            layer.tag = 10003;
            if(parent.getChildByTag(10003)  !== null){
                parent.removeChildByTag(10003);
            }
            parent.addChild(layer);
            var alert = layer.getComponent("Alert");
            alert.show2(content,onok,oncancel,showcancelbtn,okBtnTitle,cancelBtnTitle);
        });
    },
    ShowTips:function(parent,content,showtime,posx,posy){
        cc.loader.loadRes("prefabs/TipsUI",function(err,prefab){
            var layer = cc.instantiate(prefab);
            layer.tag = 10002;
            parent.addChild(layer);
            if(posx !== undefined || posy !== undefined ){
                layer.setPosition(cc.p(posx,posy));
            }
            var tips = layer.getComponent("Tips");
            tips.show(content);
        });
        if(showtime == null || showtime == undefined){
            showtime = 3000;
        }
        setTimeout(function() {
            if(parent.getChildByTag(10002)  !== null){
                parent.removeChildByTag(10002);
            }
        }, showtime);
    },

    ShowLayer:function(layerName,parent,agrs){
        cc.loader.loadRes("prefabs/"+layerName,function(err,prefab){
            var layer = cc.instantiate(prefab);
            layer.tag = 10004;
            if(parent.getChildByTag(10004)  !== null){
                parent.removeChildByTag(10004);
            }
            parent.addChild(layer);
            if(agrs && layer.getComponent(layerName)){ // 
                var script = layer.getComponent(layerName);
                script.init(agrs)
            } 
        });
    },

    ShowTime:function(layerName,parent,agrs){
        if(parent.getChildByTag(10005)  !== null){
            parent.removeChildByTag(10005);
        }
        cc.loader.loadRes("prefabs/"+layerName,function(err,prefab){
            var layer = cc.instantiate(prefab);
            layer.tag = 10005;
            if(parent.getChildByTag(10005)  !== null){
                parent.removeChildByTag(10005);
            }
            parent.addChild(layer);
            if(agrs && layer.getComponent(layerName)){ 
                var script = layer.getComponent(layerName);
                script.init(agrs)
            } 
        });
    },
    ClearTime:function(parent){
        if(parent.getChildByTag(10005)  !== null){
            parent.removeChildByTag(10005);
        }
    },

    ShowAnimation:function(actName,parent,agrs,callback){
        cc.loader.loadRes("prefabs/Animations",function(err,prefab){
            var layer = cc.instantiate(prefab);
            parent.addChild(layer);
            if(agrs !== undefined ){
                if(agrs.posx !== undefined && agrs.posy !== undefined){
                    layer.setPosition(cc.p(agrs.posx,agrs.posy))
                }
                if(agrs.rotation !== undefined ){
                    layer.rotation = agrs.rotation;
                }
                if(agrs.scalex !== undefined){
                    layer.scaleX = agrs.scalex;
                }
            }
            var ctrl = layer.getComponent("SpineAniCtrl");
            cc.loader.loadRes("animation/"+actName, sp.SkeletonData, function(err,res){
                ctrl.init(res,agrs,callback);
            });
        });
    },

    ShowAniNui:function(value,parent,pos){
        cc.loader.loadRes("prefabs/Pokertype",function(err,prefab){
            var layer = cc.instantiate(prefab);
            layer.setPositionY(-20);
            parent.addChild(layer);
            var ctrl = layer.getComponent("PokerAct");
            var sprite = layer.getComponent(cc.Sprite);
            var bgName = ""
            if(value >= 10){
                bgName = "bg_niu3";
            }else if(value > 0){
                bgName = "bg_niu2";
            }else{
                bgName = "bg_niu1";
            }
            if(pos !== undefined){
                layer.setPosition(cc.p(110,135));
            }else{
                if(parent.getPositionX()<0){
                    layer.setPosition(cc.p(26,-45));
                }else{
                    layer.setPosition(cc.p(0,-45));
                }
                
            }
			/*
            cc.loader.loadRes("niuniu/"+bgName + ".png", cc.SpriteFrame, function (err, spriteFrame){
                 sprite.spriteFrame = spriteFrame;
            });
			*/
            cc.loader.loadRes("niuniu/bullfight_type"+value + ".png", cc.SpriteFrame, function(err,res){
                ctrl.init(res);
            }); 
        });
    },

    ShowScoreAni:function(data){
        var node = new cc.Node();
        node.tag = 11001;
        node.addComponent("ScoreAni");
        cc.director.getScene().addChild(node);
        var ctrl = node.getComponent("ScoreAni");
        ctrl.show(data,node);
    },

    

});
