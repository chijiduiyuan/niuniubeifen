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
Room.prototype.isExistPlayer = function(uid){
    for(var k in this.playerList) {
        var p = this.playerList[k]
        if(p.uid == uid){
            return true
        }
    }
    return false
};
Room.prototype.getPlayerList=function(){
    return this.playerList;
};
Room.prototype.getRoomConf=function(){
    return this.conf;
};
Room.prototype.getPlayer = function(uid){
    for(var k = 0; k < this.playerList.length; k++){
        var p = this.playerList[k];
        if(p.uid == uid){
            return p
        }
    }
    return null;
};
Room.prototype.join = function(player){
    this.playerList.push(player);
};



