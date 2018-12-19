var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var http = require('../utils/http');
var crypto = require("../utils/crypto");

var ZjhManager = require('./manager');
var pm = new ZjhManager();
var Player = require('../ZjhUtils/player');
var Room = require('../ZjhUtils/room');
var gameServerInfo = null;
var config = null;
var lastTickTime = 0;

var roomMap = {};//房间号对应的房间

exports.start = function(configs){
	try{
		//获取配置信息
		config = configs;
		var sign = crypto.md5(config.CLIENT_IP + config.ROOM_PRI_KEY);
		gameServerInfo = {
			id:config.SERVER_ID,
			clientip:config.CLIENT_IP,
			clientport:config.CLIENT_PORT,
			gameId:config.GAME_ID,
			sign:sign,
		};
		server.listen(config.CLIENT_PORT, function(){
			console.log('listening on *:'+config.CLIENT_PORT);
		});
		update();
		setInterval(update,10000);	//十秒钟更新一次。
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//更新房间信息
function updateRoom(roomNum,actions){
	try{
		var data = {
				roomNum:roomNum,
				action:actions,
				id:config.SERVER_ID,
				clientip:config.CLIENT_IP,
				clientport:config.CLIENT_PORT,
		};
		http.get(config.HALL_IP,config.HALL_PORT,"/register_room",data,function(ret,data){
			if(ret == true){
				if(data.errcode != 0){

				}
			}
		});
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//向大厅服定时心跳
function update(){
	try{
		if(lastTickTime + config.HTTP_TICK_TIME < Date.now()){
			lastTickTime = Date.now();
			gameServerInfo.load = Object.keys(roomMap).length; //房间数量
			http.get(config.HALL_IP,config.HALL_PORT,"/register_gs",gameServerInfo,function(ret,data){
				if(ret == true){
					if(data.errcode != 0){
					}
				}
				else{
					lastTickTime = 0;
				}
			});
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//复制一个obj
function clone(obj) {
	try{
		if (null == obj || "object" != typeof obj) return obj;
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
		if (obj instanceof Array) {
			var copy = [];
			for (var i = 0; i < obj.length; ++i) {
			copy[i] = clone(obj[i]);
			}
			return copy;
		}
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
			}
			return copy;
		}
    }catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//获取没有牌的房间数据 
function GetRoomWithoutCard(room){
	try{
		var obj = JSON.stringify(room, function(key, val){
			if(key == "timeID"){
				val = null;
			}
			return val;
		});
		var info = JSON.parse( obj )	//clone(room);
		for(var i = 0; i < info.playerList.length; i++){
			var p = info.playerList[i];
			p.pokerList = new Array();
		}
		return info;
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}


io.on('connection', function(socket){
	//当前回话的玩家名
	var currentName = '';
	var currentRoom = 0;
	//登陆返回clientId
	socket.emit('welcome', Date.parse(new Date())/1000);

	socket.on('game_ping',function(data){
		console.log("game_ping");
		socket.emit('game_pong');
	});

	//加入房间
	socket.on('joinRoom', function(msg){
		console.log("joinRoom:msg"+msg);
		try{
			var data = JSON.parse(msg);
			var uid = data.uid;
			var userName = data.userName;
			var avatar = data.avatar;
			var roomNum = data.roomNum;
			var inningsNum = data.inningsNum;
			var ext = data.conf;
			socket.join(roomNum);
			currentRoom = roomNum;
			currentName = uid;
			var room = roomMap[roomNum];
			console.log("[joinRoom:msg]:data.conf"+ data.conf)
			if(room == undefined){
				creatorRoom();
			}else{
				enterRoom();
			}

			function enterRoom(){
				if(room.getRoomStage() == "room_finish"){
					socket.emit('joinRoom');
					io.sockets.in(roomNum).emit(roomNum+'joinRoom', JSON.stringify(room));
					return
				}
				console.log("UserJoin: "+ currentName + "_roomNum:"+roomNum);
				if(room.isExistPlayer(currentName)){
					socket.emit('joinRoom');
					var player = room.getPlayer(currentName);
					player.setIsOnline(true);
					//断线重连 修改用户状态
					var info = GetRoomWithoutCard(room);
					socket.emit(roomNum+'joinRoom', JSON.stringify(info));							//没有牌给房间发送加入的消息
					io.sockets.in(roomNum).emit(roomNum+'state_changed', JSON.stringify(info));		//单独给这个房间发送消息
					//console.log("isExistPlayer  "+ JSON.stringify(info.playerList));
				}else{
					if(room.getPlayerList().length > (room.getRoomConf().playerNum-1)){
						socket.emit('joinRoom_error', JSON.stringify("房间已满！"));
						return;
					}
					socket.emit('joinRoom');
					var player = new Player(uid,userName,avatar);
					player.setIsOnline(true);
					player.setStatus("standup");
					room.join(player);
					var info = GetRoomWithoutCard(room);
					io.sockets.in(roomNum).emit(roomNum+'joinRoom', JSON.stringify(info));
				}
			}

			function creatorRoom(){
				socket.emit('joinRoom');
				var decode = decodeURIComponent(ext);
				var conf = JSON.parse(decode);
				conf.inningsNum = inningsNum;
				console.log("Create_room:"+currentRoom + "_Conf:"+JSON.stringify(conf) + "_creator:"+currentName);
				var room = new Room(roomNum,conf);
				updateRoom(roomNum,"add");
				roomMap[roomNum] = room;
				var player = new Player(uid,userName,avatar);
				player.setStatus("standup");
				room.join(player);

				var info = JSON.stringify(room);
				socket.emit(roomNum+'joinRoom', JSON.stringify(room));

			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	})

