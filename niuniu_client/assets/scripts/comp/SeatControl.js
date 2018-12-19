cc.Class({
    extends: cc.Component,

    properties: {
        seats:{
            default:[],
            type:[cc.Node],
        },
        _seats:[],
        _chatVoices:[],
        _cards:null,
        _daqiang_agrs:null,
        _beida_agrs:null,
    },
    onLoad: function () {
        this.initView();
        this.initEventHandlers();
        this.initTempDate();
        if(Grobal.numOfGame==0){
            var isHideNode = false
            for(var i=0;i<cc.vv.gameNetMgr.playerList.length;++i){
                var p = cc.vv.gameNetMgr.playerList[i];
                if(p.uid==Grobal.uid){
                    continue;
                }
                isHideNode = true
            }
            if(isHideNode == true){
                this.node.active = false;
            }
        }else{
            this.node.active = true;  
        }
    },


    initTempDate:function(){

    },

    initView:function(){
        
        var self = this;
        this._seats = new Array();
        this._chatVoices = new Array();
        this._cards = new Array();
        for(let j = 0;j<self.seats.length;j++){
            var set = self.seats[j].getComponent("Seat");
            self.seats[j].active = false;
        }
        var playerList = cc.vv.gameNetMgr.playerList 
        for(let i=0;i<playerList.length;i++){
            var index = cc.vv.gameNetMgr.getLocalIndex(i)
            var card = self.seats[index].getComponent("Card");
            card.ShowCurrentStatus(playerList[i]);
            self._cards.push(card);
        }
        for(let i=0;i<playerList.length;i++){
            var index = cc.vv.gameNetMgr.getLocalIndex(i)
            var set = self.seats[index].getComponent("Seat");
            self._seats.push(set);
            set.setUserInfo(playerList[i]);
            self.seats[index].active = true;
        };
        cc.vv.gameNetMgr.seats = self._seats;
    },

    initSeatCard:function(uid){
       var self = this;
        var playerList = cc.vv.gameNetMgr.playerList 
        for(var i=0;i<playerList.length;i++){
            var index = cc.vv.gameNetMgr.getSeatIndexByID(playerList[i].uid);
            var card = self._seats[index].getComponent("Card");
            self._cards.push(card);
            if(playerList[i].uid !== Grobal.uid){
                if( playerList[i].status != "standup"){ 
                    card.ShowCardNormal();
                }
            }
        }
    },

    changeUserState:function(data){
        var self = this;
        var uid = parseInt(data.uid)
        var localIndex = cc.vv.gameNetMgr.getSeatIndexByID(uid)
        var seat = self._seats[localIndex];
        if(data.state =="qiangzhuang"){
            if(data.value > 0){
                var str = data.value + "bei"
                seat.onShowState("qiangzhuang",data.value);
				var voiceName = "effect/qiangzhuang.mp3";
            	cc.vv.audioMgr.playSFX(voiceName);
            }else{
                seat.onShowState("nograb_icon");
				var voiceName = "effect/buqiang.mp3";
            	cc.vv.audioMgr.playSFX(voiceName);
            }
        }else if(data.state =="beishu"){
            seat.onShowStateBNum(data.value,"rate");
			var voiceName = "effect/beishu"+data.value+".mp3";
            cc.vv.audioMgr.playSFX(voiceName);
        }else if(data.state =="ready"){
            seat.onShowState("ready");
        }else if(data.state =="dealpoker"){
            var card = self._cards[localIndex];
            if(uid == Grobal.uid){
                card.ShowSelfCardFinish();
            }else{
                card.ShowCardFinish();
            }
        }
    },

    showZhuanAni:function(target,data){
        var self = this;
        var uid = parseInt(data.uid);
        var localIndex = cc.vv.gameNetMgr.getSeatIndexByID(data.uid);
        var seat = self._seats[localIndex];
        if(seat==undefined){
            return;
        }
        if(data.iszhuan == true){
            seat.showFrameAction();
            if(Grobal.status == "standup" ||Grobal.status == "ready"){return}
            if(data.uid == Grobal.uid){   
                Grobal.isGrab = true
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message',"等待闲家下注");
            }else{
                Grobal.isGrab = false;
                cc.vv.gameNetMgr.dispatchEvent('show_tips_message',"请下注");
            }
            cc.vv.gameNetMgr.dispatchEvent('shezhi_beishu');
        }else{
            seat.setUserFrame(true);
        }
    },

    showDealZhuanAni:function(data){
        var self = this;
        for(var i=0;i<self._seats.length;i++){
            var seat = self._seats[i];
            seat.setUserFrame(false);
        }

        if(data.user.length == 1){
            var localIndex = cc.vv.gameNetMgr.getSeatIndexByID(data.user[0]);
            var seat = self._seats[localIndex];
            seat.showFrameAction();
            seat.showZhuan(true);
            cc.vv.gameNetMgr.dispatchEvent('shezhi_beishu');
        }else{
            var len = data.user.length;
            var num = len * 3;
            if(num >= 9){num = 9};
            var last = -1;
            var actArr = new Array();
            for(var k=0;k<num;k++){
                var index = Math.floor(Math.random()*len) 
                while(index == last){
                    index = Math.floor(Math.random()*len) ;
                }
                last = index; 
                var info = {}
                info.uid = data.user[index];
                info.iszhuan = false
                var call = cc.callFunc(self.showZhuanAni,self,info);
                actArr.push(call);
                var delay = cc.delayTime(0.4);
                actArr.push(delay);
            }
            var delay2 = cc.delayTime(0.2);
            actArr.push(delay2);
            var info2 = {}
            info2.uid = data.zhuang;
            info2.iszhuan = true;
            var call = cc.callFunc(self.showZhuanAni,self,info2);
            actArr.push(call);
            var showZhuang = cc.callFunc(function(){
                 for(var i=0;i<self._seats.length;i++){
                    var seat = self._seats[i];
                    if(seat.getSeatUid() == data.zhuang){
                        seat.showZhuan(true);
                    }else{
                        seat.showZhuan(false);
                        seat.setUserFrame(false);
                    }
					seat.updateQiangStatus();
                }
            });
             actArr.push(showZhuang);
            var seq = cc.sequence(actArr);
            this.node.runAction(seq);
        }
    },

    ShowUserCards:function(target,data){
        var self = this;
        var uid = parseInt(data.uid);
        var localIndex = cc.vv.gameNetMgr.getSeatIndexByID(uid)
        var card = self._cards[localIndex];
        if(uid == Grobal.uid){
            card.ShowSeflCardResult(data.cards,data.value,target);
        }else{
            card.ShowCardResult(data.cards,data.value,target);
        }
    },

    ShowScore:function(target,data){
        var self = this;
        for(var i=0;i<data.uids.length;i++){
            var uid = parseInt(data.uids[i]);
            var localIndex = cc.vv.gameNetMgr.getSeatIndexByID(uid)
            var seat = self._seats[localIndex];
            seat.onShowStateBNum(data.score[uid].score,"score");
            seat.updateScore(data.score[uid].totalScore);
            if(data.uids[i] == Grobal.uid){
                if(data.score[uid].score > 0){
                    cc.vv.audioMgr.playSFX('effect/win.mp3');
                }
            }
        }
    },

    // 显示分数，金币动画没有加
    ShowCoinAnimation:function(target,data){
        var self = this;
        var zhuanUid = -1;
        var sourcePos = cc.p(320,640);
        for(var i=0;i<self._seats.length;i++){
            if(self._seats[i].getIsZhuan() == true){
                zhuanUid = self._seats[i].getSeatUid();
                var localIndex = cc.vv.gameNetMgr.getSeatNodeByUid(parseInt(zhuanUid));
                sourcePos = self.node.convertToWorldSpaceAR(self.seats[localIndex].getPosition())
            }
        }
        var outArr = new Array();
        var inArr = new Array();
        for(var i=0;i<data.uids.length;i++){
            var uid = parseInt(data.uids[i]);
            if(data.uids[i] !== zhuanUid ){
                var localIndex = cc.vv.gameNetMgr.getSeatNodeByUid(uid);
                var pos = self.node.convertToWorldSpaceAR(self.seats[localIndex].getPosition())
                if(data.score[uid].score > 0 ){
                    inArr.push(pos);
                }else{
                    outArr.push(pos);
                }
            }
        }
        var data = {}
        data.sourcePos = sourcePos;
        data.outArr = outArr;
        data.inArr = inArr;
        cc.vv.uitools.ShowScoreAni(data);
        if(data.inArr.length == 0 && data.outArr.length >= 2){
            cc.vv.uitools.ShowAnimation("tongsha",cc.director.getScene(),{action:"animation",isloop:false,posx:320,posy:640});
        }
    },

    resetSeat:function(){
        var self = this;
        var playerList = cc.vv.gameNetMgr.playerList;
        for(var i=0;i<playerList.length;i++){
            var card = self._cards[i];
            card.hideCard();
            var seat = self._seats[i];
            seat.onShowState("wu");
        }
        for(var i=0;i<self._seats.length;i++){
            var seat = self._seats[i];
            seat.setUserFrame(false);
            seat.hideStatus();
			if(cc.args["ext_json"].zhuangType=="turn"){
            	seat.showZhuan(false);
			}
        }
    },

    resetSelf:function(){
        var self = this;
        var playerList = cc.vv.gameNetMgr.playerList;
        for(let i=0;i<playerList.length;i++){
            var index = cc.vv.gameNetMgr.getLocalIndex(i)
            var set = self.seats[index].getComponent("Seat");
            set.updateUser(playerList[i]);
        };
    },
    

    //显示比牌结果动画流程控制
    ShowResult:function(msg){
        var self = this
        var uids = msg.uids
        var cards = msg.cards
        var score = {}
        for(var i=0;i<uids.length;i++){
            score[uids[i]] = msg[uids[i]]
        }
        var actArr = new Array();
 	
        var data1 = {}
        data1.uids = uids;
        data1.score = score;
		var delay0 = cc.delayTime(2);
		actArr.push(delay0);
        var call2 = cc.callFunc(self.ShowCoinAnimation, self,data1);
        actArr.push(call2);
		var delay2 = cc.delayTime(1.5);
		actArr.push(delay2);
        var hideCard = cc.callFunc(function(){
            var playerList = cc.vv.gameNetMgr.playerList;
            for(var i=0;i<playerList.length;i++){
                var card = self._cards[i];
                card.hideCard();
            }
        });
        actArr.push(hideCard);
        var delay3 = cc.delayTime(0.5);
		actArr.push(delay3);
		var call1 = cc.callFunc(self.ShowScore, self,data1);
        actArr.push(call1);
        var delay1 = cc.delayTime(2.5);
        actArr.push(delay1);

        var showRestart = cc.callFunc(function(){
            self.resetSeat();
            cc.vv.gameNetMgr.dispatchEvent('game_restart');
        });
        actArr.push(showRestart);

        var seq = cc.sequence(actArr);
        this.node.runAction(seq);
    },
    updateQiangStatus:function(){
        var self = this;
        for(var i=0;i<self._seats.length;i++){
            var seat = self._seats[i];
            seat.updateQiangStatus();
        }
    },
    initEventHandlers:function(){
        var self = this;
        cc.vv.netRoot.on('new_user_comes_push',function(data){
            self.initView();
        },this);
        cc.vv.netRoot.on('user_state_changed',function(data){
            self.initView();
        },this);
        cc.vv.netRoot.on('user_state_dealingCards',function(msgBean){
            self.initSeatCard(null);
        },this);
        cc.vv.netRoot.on('card_start_play',function(msgBean){
            self.ShowResult(msgBean.detail);
        },this);
        cc.vv.netRoot.on('play_state_change',function(msgBean){
            self.changeUserState(msgBean.detail);
        },this);
        cc.vv.netRoot.on('deal_zhuang',function(msgBean){
            self.showDealZhuanAni(msgBean.detail);
        },this);
        cc.vv.netRoot.on('user_deal_poker_done',function(msgBean){
            self.ShowUserCards("1",msgBean.detail);
            var voiceName = "effect/man" + msgBean.detail.value + ".mp3";
            cc.vv.audioMgr.playSFX(voiceName);
        },this);
        cc.vv.netRoot.on('game_play_init_over',function(msgBean){
            this.node.active = msgBean.detail;
        },this);
        cc.vv.netRoot.on('shezhi_beishu',function(msgBean){
            self.updateQiangStatus();
        },this);
        cc.vv.netRoot.on('update_qiang_status',function(msgBean){
            //self.updateQiangStatus();
        },this);
        cc.vv.netRoot.on('checkPlayerStatus_success',function(msgBean){
            self.resetSelf();
        },this);


    },
});
