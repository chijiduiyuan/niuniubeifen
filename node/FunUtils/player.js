module.exports = Player;

/**
 *
 * @param
 */

function Player(uid,userName,avatar){
	this.uid = uid;		
	try{
		this.userName = decodeURIComponent(userName);
	}catch(err){
		console.log("ErrorInfo: "+userName+"  "+err);
		console.log("ErrorInfo: "+err.stack);
	}
	this.avatar = avatar; 
	this.pokerList = new Array();
	this.pokerPlayList = null;	
	this.onlineTime = Date.now();
	this.isOnline = true;
	this.isGrab = null;	
	this.status = "standup"; 
	this.joinin = false
	this.baserate = 0;
	this.score = 0;//分数
	this.lastnn = false;
	this.QiangNum = 0;	
}

Player.prototype.getUid=function(){
	return this.uid;
};

Player.prototype.getLastnn=function(){
	return this.lastnn;
};

Player.prototype.setLastnn=function(lastnn){
	this.lastnn = lastnn;
};



Player.prototype.getStatus=function(){
	return this.status;
};

Player.prototype.getPokerList=function(){
	return this.pokerList;
};

Player.prototype.getIsReady=function(){
	return this.isReady;
};

Player.prototype.getIsOnline=function(){
	return this.isOnline;
};

Player.prototype.getIsGrab=function(){
	return this.isGrab;
};

Player.prototype.getIsQiang=function(){
	return this.QiangNum
};

Player.prototype.IsJoinin=function(){
	return this.joinin;
};

Player.prototype.getScore=function(){
	return this.score;
};

Player.prototype.setUid=function(uid){
	this.uid = uid;
};



Player.prototype.Joinin=function(){
	this.joinin = true;
};

Player.prototype.setPokerList=function(pokerList){
	if(pokerList == null){
		this.pokerList = new Array()
	}else{
		this.pokerList = pokerList;
	}
};

Player.prototype.setPokerPlayList=function(pokerPlayList){
	this.pokerPlayList = pokerPlayList;
};

Player.prototype.setIsReady=function(isReady){
	this.isReady = isReady;
};

Player.prototype.setIsOnline=function(isOnline){
	this.isOnline = isOnline;
};

Player.prototype.setIsGrab=function(isGrab){
	this.isGrab = isGrab;
};

Player.prototype.setQiangNum=function(beishu){
	this.QiangNum = beishu;
};

Player.prototype.updateScore=function(score){
	this.score = this.score + score;
};

Player.prototype.setStatus=function(status){
	this.status = status;
};

Player.prototype.getIsPlayCurrent=function(status){
	if(this.status =="standup" || this.status == "ready"){
		return false;
	}
	return true;
};

Player.prototype.getBaseRate=function(){
	return this.baserate;
};

Player.prototype.setBaseRate=function(rate){
	this.baserate = rate
};


Player.prototype.Recovery = function(info){
	this.uid = info.uid;
	try{
		this.userName = decodeURIComponent(info.userName);
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
	this.avatar = info.avatar;
	this.pokerList = new Array();
	this.pokerPlayList = null;
	this.onlineTime = info.onlineTime;
	this.isOnline = true;
	this.isGrab = null;
	this.status = "standup";
	this.joinin = info.joinin;
	this.baserate = 0;
	this.score = info.score;
	this.lastnn = false;
	this.QiangNum = 0;
};