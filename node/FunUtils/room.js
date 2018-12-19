var Player = require('./player');
module.exports = Room;

/**
 * Player constructor.
 *
 * @param
 */

	
function Room(roomNum,info){
	this.roomNum = roomNum;//房号
	this.playerList = new Array();//玩家列表
	this.isPlaying = false;
	this.numOfGame = 0;
	this.maxOfGame = info.inningsNum;
	this.zhuangUser = null;
	this.scoreInfo = {};//每局比牌结束后的分数信息
	this.conf = info;
	this.roomStage = "room_wait";
	this.stagetime = Date.parse(new Date())/1000;
	this.startTime = Date.now();
	this.timeID = null;
}

Room.prototype.getRoomStage=function(){
	return this.roomStage;
};
Room.prototype.getStageTime=function(){
	return this.stagetime;
};
Room.prototype.setStageTime=function(time){
	this.stagetime = time;
};
Room.prototype.getRoomNum=function(){
	return this.roomNum;
};

Room.prototype.getScoreInfo=function(){
	return this.scoreInfo;
};

Room.prototype.getStartTime=function(){
	return this.startTime;
};

Room.prototype.getRoomConf=function(){
	return this.conf;
};

Room.prototype.getPlayCount=function(){
	var num = 0
	for(var k = 0; k < this.playerList.length; k++){
		var p = this.playerList[k]
		if(p.getStatus() != "standup" && p.getStatus() != "ready"){
			num = num + 1;
		}
	}
	return num;
};
Room.prototype.getLastnnCount=function(){
	var num = 0
	for(var k = 0; k < this.playerList.length; k++){
		var p = this.playerList[k]
		if(p.getLastnn()==true){
			num = num + 1;
		}
	}
	return num;
};
Room.prototype.getOnlineCount=function(){
	var num = 0
	for(var k = 0; k < this.playerList.length; k++){
		var p = this.playerList[k]
		if(p.getIsOnline()){
			num = num + 1;
		}
	}
	return num;
};

Room.prototype.getPlayerStatusCount = function(status){
	var num = 0
	for(var k = 0; k < this.playerList.length; k++){
		var p = this.playerList[k]
		if(p.getStatus() == status){
			num = num + 1;
		}
	}
	return num;
};

Room.prototype.getPlayerList=function(){
	return this.playerList;
};

Room.prototype.getPlayerNumber=function(){
	return this.playerList.length;
};


Room.prototype.getZhuangUser=function(){
	return this.zhuangUser;
};

Room.prototype.setZhuangUser=function(uid){
	return this.zhuangUser = uid;
};

Room.prototype.getIsPlaying=function(){
	return this.isPlaying;
};

Room.prototype.getNumOfGame=function(){
	return this.numOfGame;
};

Room.prototype.getMaxOfGame=function(){
	return this.maxOfGame;
};


Room.prototype.setRoomNum=function(roomNum){
	this.roomNum = roomNum;
};

Room.prototype.setPlayerList=function(playerList){
	this.playerList = playerList;
};
Room.prototype.setRoomStage=function(stage){
	this.roomStage = stage;
};

Room.prototype.setIsPlaying=function(isPlaying){
	this.isPlaying = isPlaying;
};

Room.prototype.setNumOfGame=function(numOfGame){
	this.numOfGame = numOfGame;
};

Room.prototype.setMaxOfGame=function(maxOfGame){
	this.maxOfGame = maxOfGame;
};

Room.prototype.setScoreInfo=function(scoreInfo){
	this.scoreInfo = scoreInfo;
};

Room.prototype.setTimeId=function(timeid){
	this.timeID = timeid;
};
Room.prototype.getTimeId=function(){
	return this.timeID;
};

Room.prototype.getExistPlayer = function(uid){
	for(var k in this.playerList) {
		var p = this.playerList[k]
		if(p.uid == uid){
			return p
		}
	}
	return null;
};

Room.prototype.isExistPlayer = function(uid){
	for(var k in this.playerList) {
		var p = this.playerList[k]
		if(p.uid == uid){
			return true
		}
	}
	return false
};

Room.prototype.getPlayer = function(uid){
	for(var k = 0; k < this.playerList.length; k++){
		var p = this.playerList[k]
		if(p.uid == uid){
			return p
		}
	}
	return null;
};




Room.prototype.join = function(player){
	this.playerList.push(player);
};

Room.prototype.leave = function(player){
	var index = 0;
	for(var i = 0; i < this.playerList.length; i++){
		if(this.playerList[i].getUid() == player.getUid()){
			index = i
		}
	}
	this.playerList.splice(index, 1);
};

Room.prototype.restartGame = function(){
	for(var k in this.playerList) {
		var p = this.playerList[k];
		p.pokerList = new Array();
		p.pokerPlayList = new Array();
		if(this.conf.zhuangType=="turn"){
			p.isGrab = null;
		}
		p.baserate = 0;
	}
};

Room.prototype.isPass = function(){
	if(this.isPlaying){
		return false
	}else{
		if(Date.now() - this.startTime > 1000 * 60 * 90){
			return true
		}
	}
	return false
};
Room.prototype.isFinish = function(){
	if(this.roomStage == "room_finish"){
		return true;
	}
	return false
};





Room.prototype.getZhuanUid = function(){
	for(var i = 0; i < this.playerList.length; i++){
		if(this.playerList[i].getIsGrab()){
			return this.playerList[i].getUid()
		}
	}
	return 0
};


Room.prototype.Recovery = function(info){
	this.roomNum = info.roomNum;
	this.isPlaying = info.isPlaying;
	this.numOfGame = info.numOfGame;
	this.maxOfGame = info.maxOfGame;
	this.zhuangUser = info.zhuangUser;
	this.scoreInfo = info.scoreInfo;
	this.conf = info.conf;
	this.roomStage = "room_wait";
	this.stagetime = info.stagetime;
	this.startTime = info.startTime;
	this.timeID = null;
	this.playerList = new Array();
	for(var i=0;i<info.playerList.length;i++){
		var player = new Player(info.playerList[i].uid,info.playerList[i].userName,info.playerList[i].avatar);
		player.Recovery(info.playerList[i]);
		this.join(player);
	}
};



