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
	this.status = "standup"; 
	this.joinin = false;
	this.score = 0;//分数
	this.qipai = false;
	this.bipai = false;
	this.kanpai = false;
}

Player.prototype.setIsOnline=function(isOnline){
    this.isOnline = isOnline;
};
Player.prototype.setStatus=function(status){
    this.status = status;
};
