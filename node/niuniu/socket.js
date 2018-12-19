var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var http = require('../utils/http');
var crypto = require("../utils/crypto");

var NiuManager = require('./manager');
var pm = new NiuManager(); 
var Player = require('../FunUtils/player');
var Room = require('../FunUtils/room');
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
		console.log("game_ping")
		socket.emit('game_pong');
	});

	//加入房间
	socket.on('joinRoom', function(msg){
		console.log("joinRoom:msg"+msg)
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
					var player = room.getPlayer(currentName)
					player.setIsOnline(true);
					//断线重连 修改用户状态
					var info = GetRoomWithoutCard(room);
					socket.emit(roomNum+'joinRoom', JSON.stringify(info));
					io.sockets.in(roomNum).emit(roomNum+'state_changed', JSON.stringify(info));
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
				if(room.getRoomConf().zhuangType !== "turn"){
					//player.setIsGrab(true);
					//room.setZhuangUser(currentName);
				}
				var info = JSON.stringify(room);
				socket.emit(roomNum+'joinRoom', JSON.stringify(room));

			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//准备
	socket.on('ready', function(msg){
		console.log("ready:msg"+msg)
		try{
			var data = JSON.parse(msg);
			var room = roomMap[currentRoom];
			if(room == undefined){
				var data ={};
				data['info']="获取数据出错，请重试";
				socket.emit(currentRoom+'show_tips', JSON.stringify(data));
				return;
			}
			if(room!=undefined && room!=null){
				var player = room.getPlayer(currentName);
				if(player==undefined||player==null){
					socket.emit('joinRoom_error', JSON.stringify("未知错误,请重新进入游戏！"));
					return;
				}
				if(room.getRoomStage()=="room_finish"&&room.getNumOfGame()==room.getMaxOfGame()){
					var data = {}
					data.playerList = room.getPlayerList();
					data.playerList.sort(compare("score")).reverse();
					io.sockets.in(currentRoom).emit(currentRoom+'gameFinish', JSON.stringify(data));
					return;
				}
				if(room.getNumOfGame()==room.getMaxOfGame()){
					return;
				}
				if(player.getStatus() !== "standup"&&player.getStatus() !== "ready"){
					return;
				}
				player.setStatus("ready");
				socket.emit(currentRoom+'ready_done');
				io.sockets.in(currentRoom).emit(currentRoom+'room_player_changed', JSON.stringify(room.getPlayerList()));
				
				var data = {}
				data.uid = currentName;
				data.state = "ready";
				io.sockets.in(currentRoom).emit(currentRoom+'play_state_change',JSON.stringify(data));

				//通知客户端用户准备
				if(player.joinin!=true){
					var post_data ={};
					var dtime=Date.parse(new Date())/1000;
					post_data['roomNum']=currentRoom;
					post_data['inningsNum']=room.getNumOfGame()+1;
					post_data['time']=dtime;
					post_data['uid']=player.getUid();
					//postHall(post_data,'/api.php?ac=room');
				}
				var dealyTime = RoomStageTime["room_ready"];
				if(room.getNumOfGame() == 0){
					dealyTime = RoomStageTime["room_first_ready"];
				}
				if(room.getRoomConf().zhuangType == "fix"||room.getRoomConf().zhuangType == "nnsz"){
					var player = room.getPlayer(room.getZhuangUser());
					if(room.getNumOfGame()>0){
						if(player.getStatus()!="ready"){
							
						}else{
							if(room.getPlayerStatusCount("ready") >= 2 && room.getOnlineCount() > 2 && room.getRoomStage() == "room_wait"){
								room.setRoomStage("room_ready")
								room.setStageTime(Date.parse(new Date())/1000)
								var timeID = setTimeout(function(){
									beginGame(currentRoom);
								},dealyTime * 1000 );
								UpdateRoomTime(room,timeID);
							}
						}
					}else{
						if(room.getPlayerStatusCount("ready") >= 2 && room.getOnlineCount() > 2 && room.getRoomStage() == "room_wait"){
							room.setRoomStage("room_ready")
							room.setStageTime(Date.parse(new Date())/1000)
							var timeID = setTimeout(function(){
								beginGame(currentRoom);
							},dealyTime * 1000 );
							UpdateRoomTime(room,timeID);
						}
					}
				}else{
					if(room.getPlayerStatusCount("ready") >= 2 && room.getOnlineCount() > 2 && room.getRoomStage() == "room_wait"){
						room.setRoomStage("room_ready")
						room.setStageTime(Date.parse(new Date())/1000)
						var timeID = setTimeout(function(){
							beginGame(currentRoom);
						},dealyTime * 1000 );
						UpdateRoomTime(room,timeID);
					}
				}
				if(room.getPlayerStatusCount("ready") >=2 && room.getPlayerStatusCount("ready") == room.getOnlineCount()){
					beginGame(currentRoom);
				}
			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//抢庄
	socket.on('qiangzhuang', function(msg){
		console.log("qiangzhuang:msg"+msg)
		try{
			var msgBean = JSON.parse(msg)
			var qiangzhuang = msgBean.qiangzhuang;
			var room = roomMap[currentRoom];
			if(room == undefined){
				var data ={};
				data['info']="获取数据出错，请重试";
				socket.emit('show_tips', JSON.stringify(data));
				return;
			}
			var player = room.getPlayer(currentName)
			// if(player.getIsGrab() !== null){
			// 	return
			// }
			if(player.getStatus() !== "qiang"){
				var data ={};
				data['info']="已抢庄";
				socket.emit('show_tips', JSON.stringify(data));
				return;
			}
			if(room.getRoomStage() !== "room_qiang"){
				var data ={};
				data['info']="抢庄时间已过";
				socket.emit('show_tips', JSON.stringify(data));
				return
			}

			player.setQiangNum(qiangzhuang);
			player.setStatus("qianged");
			var data = {}
			data.uid = currentName;
			data.state = "qiangzhuang";
			data.value = msgBean.qiangzhuang;
			io.sockets.in(currentRoom).emit(currentRoom+'play_state_change',JSON.stringify(data))
			socket.emit('qiangzhuang_done');
			if(room.getPlayCount() == room.getPlayerStatusCount("qianged")){
				clearTimeout(room.getTimeId());
				StartQiang(currentRoom);
			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//设置倍数。
	socket.on('dealbaserate', function(msg){
		console.log("dealbaserate:msg"+msg)
		try{
			var msgBean = JSON.parse(msg)
			var room = roomMap[currentRoom];
			if(room == undefined){
				var data ={};
				data['info']="获取数据出错，请重试";
				socket.emit(currentRoom+'show_tips', JSON.stringify(data));
				return;
			}
			var player = room.getPlayer(currentName);

			if(player.getStatus() !== "beishu"){
				var data ={};
				data['info']="已设置倍数";
				socket.emit('show_tips', JSON.stringify(data));
				return;
			}
			if(room.getRoomStage() !== "room_beishu"){
				var data ={};
				data['info']="设置倍数时间已过";
				socket.emit('show_tips', JSON.stringify(data));
				return;
			}

			player.setBaseRate(msgBean.rate);
			var playList = room.getPlayerList();
			var data = {}
			data.uid = currentName;
			data.state = "beishu";
			data.value = msgBean.rate;
			player.setStatus("beishued");
			io.sockets.in(currentRoom).emit(currentRoom+'play_state_change',JSON.stringify(data));
			socket.emit('dealbaserate_success');

			//看点完抢的人数，是不是总人数少1，，是的话，都确定了，开始发牌
			if(room.getPlayCount() == room.getPlayerStatusCount("beishued") + 1 ) {
				var playerList = room.getPlayerList();
				for(var i = 0; i < playerList.length; i++){
					var player = playerList[i];
					if(player.isGrab==true){
						player.setStatus("beishued");
					}
				}
				if(room.getRoomConf().playType == "see"){	//看牌局 先发四张
					var data = {}
					data.state = "kanpai";
					io.sockets.in(currentRoom).emit(currentRoom+'kanpai_state_change',JSON.stringify(data));
				}else{
					dealingCard5(room)
					var data = {}
					data.state = "kanpai";
					io.sockets.in(currentRoom).emit(currentRoom+'kanpai_state_change',JSON.stringify(data));
				}
				/*
				room.setRoomStage("room_arrang");
				clearTimeout(room.getTimeId());
				room.setStageTime(Date.parse(new Date())/1000)
				var	timeID = setTimeout(function(){
					AutoDeal(room.getRoomNum());
				},RoomStageTime["room_arrang"] * 1000 );
				setTimeout(function(){
					AutoShowAllPokers(room.getRoomNum());
				},RoomStageTime["room_fanpai"] * 1000 );
				*/
				room.setRoomStage("room_fanpai");
				clearTimeout(room.getTimeId());
				room.setStageTime(Date.parse(new Date())/1000);
				var	timeID = setTimeout(function(){
					AutoShowAllPokers(room.getRoomNum());
				},RoomStageTime["room_fanpai"] * 1000 );
				UpdateRoomTime(room,timeID);
			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//展示4张牌
	socket.on('showFourPokers', function(msg){
		console.log("showFourPokers:msg"+msg)
		try{
			var room = roomMap[currentRoom];
			if(room == undefined){
				var data ={};
				data['info']="获取数据出错，请重试";
				socket.emit(currentRoom+'show_tips', JSON.stringify(data));
				return;
			}
			var player = room.getPlayer(currentName);
			if(player.getStatus()=="beishued" && (room.getPlayerStatusCount("beishued")+room.getPlayerStatusCount("arranging")+room.getPlayerStatusCount("arranged"))==room.getPlayCount()) {
				dealingUserCardFour(room,currentName)
			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//展示所有牌
	socket.on('showAllPokers', function(msg){
		console.log("showAllPokers:msg"+msg)
		try{
			var room = roomMap[currentRoom];
			if(room == undefined){
				var data ={};
				data['info']="获取数据出错，请重试";
				socket.emit(currentRoom+'show_tips', JSON.stringify(data));
				return;
			}
			if(room!=undefined){
				if(room.getRoomStage() !== "room_fanpai"){
					return;
				}
				var player = room.getPlayer(currentName);
				if(player.getStatus()=="beishued" && (room.getPlayerStatusCount("beishued")+room.getPlayerStatusCount("arranging")+room.getPlayerStatusCount("arranged"))==room.getPlayCount()) {
					dealingUserCardAll(room,currentName)
				}
				if((room.getPlayerStatusCount("arranging")+room.getPlayerStatusCount("arranged"))==room.getPlayCount()) {
					room.setRoomStage("room_arrang");
					clearTimeout(room.getTimeId());
					room.setStageTime(Date.parse(new Date())/1000);
					var	timeID = setTimeout(function(){
						AutoDeal(room.getRoomNum());
					},RoomStageTime["room_arrang"] * 1000 );
					UpdateRoomTime(room,timeID);
				}
			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//tan牌
	socket.on('dealpoker', function(msg){
		console.log("dealpoker:msg"+msg)
		try{
			var room = roomMap[currentRoom];
			if(room == undefined){
				var data ={};
				data['info']="获取数据出错，请重试";
				socket.emit(currentRoom+'show_tips', JSON.stringify(data));
				return;
			}
			var player = room.getPlayer(currentName);
			if(player.getStatus() !== "arranging"){
				return;
			}
			if(room.getRoomStage() !== "room_arrang"&&room.getRoomStage() !== "room_fanpai"){
				return;
			}
			player.setStatus("arranged");
			socket.emit('dealpoker_done');
			var data = {};
			data.uid = player.getUid();
			data.cards = player.getPokerList();
			data.value = pm.cal(data.cards,room.conf);
			io.sockets.in(currentRoom).emit(currentRoom+'user_deal_poker_done',JSON.stringify(data));
			if(room.getPlayCount() == room.getPlayerStatusCount("arranged") ) {
				ComparePoker(room)
			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//离开
	socket.on('disconnect', function(msg){
		console.log("disconnect:msg"+msg)
		try{
			var room = roomMap[currentRoom];	
			if(room==undefined){ return }
			console.log('disconnect：' + currentName +"_roomNum:"+room.getRoomNum());
			var player = room.getPlayer(currentName)	
			if(player!=undefined)
			{
				player.setIsOnline(false);
				if(room!=undefined)
				{
					var roomNum = room.getRoomNum();
					if(player.IsJoinin() == true){
						var info = GetRoomWithoutCard(room);
						socket.broadcast.to(roomNum).emit(roomNum+'state_changed', JSON.stringify(info));	
					}else{
						//没有加入游戏的，从房间删除
						room.leave(player);
						var info = GetRoomWithoutCard(room);
						socket.broadcast.to(roomNum).emit(roomNum+'state_changed', JSON.stringify(info));
						//通知大厅服务端 用户退出
						var dtime=Date.parse(new Date())/1000;
						var post_data={};
						post_data['roomNum']=room.getRoomNum();
						post_data['time']=dtime;
						post_data['uid']=player.getUid();
						//(post_data,'/api.php?ac=exitroom');
					}
				}
				io.sockets.in(room.getRoomNum()).emit(currentName+"disconnect_server");
				socket.leave(currentRoom);
			}
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

	//刚进入房间检查用户状态
	socket.on('checkPlayerStatus', function(msg){
		console.log("checkPlayerStatus:msg"+msg)
		try{
			var data = JSON.parse(msg);
			var room = roomMap[data.roomNum];
			if(room == undefined){
				console.log(data.roomNum+"_checkPlayerStatus_room_undefined");
				var dataInfo ={};
				dataInfo['info']="获取数据出错，请重试";
				socket.emit(data.roomNum+'show_tips', JSON.stringify(dataInfo));
				return;
			}
			var player = room.getPlayer(currentName)
			if(room.getRoomStage() == "room_finish"&&room.getNumOfGame()==room.getMaxOfGame()){
				var data = {}
				data.playerList = room.getPlayerList();
				data.playerList.sort(compare("score")).reverse();
				socket.emit(currentRoom+'gameFinish', JSON.stringify(data));
				return
			}

			if(room.getIsPlaying() && player){
				if(player.getStatus()=="standup"||player.getStatus()=="ready"){
					if(room.getRoomStage()!="room_ready"&&room.getRoomStage()!="room_wait"){
						var msgBean = {};
						msgBean.pokerList = new Array();
						var info = GetRoomWithoutCard(room);
						msgBean.playerList = info.playerList;
						socket.emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
					}
				}else if(player.getStatus()=="qiang"){
					//整理牌中
					if(room.getRoomConf().playType=="see"){
						var msgBean = {};
						msgBean.pokerList = new Array();
						for(var j=0;j<4;j++){
							msgBean.pokerList.push(player.getPokerList()[j])
						}
						if(msgBean.pokerList.length <= 0){
							
						}
						var info = GetRoomWithoutCard(room);
						msgBean.playerList = info.playerList;
						socket.emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
					}
					socket.emit(currentRoom+'startGrab');
				}else if(player.getStatus()=="qianged"){
					//整理牌中
					if(room.getRoomConf().playType=="see"){
						var msgBean = {};
						msgBean.pokerList = new Array();
						for(var j=0;j<4;j++){
							msgBean.pokerList.push(player.getPokerList()[j])
						}
						if(msgBean.pokerList.length <= 0){
						}
						var info = GetRoomWithoutCard(room);
						msgBean.playerList = info.playerList;
						socket.emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
					}
					socket.emit(currentRoom+'startGrab');
					var data = {}
					data.uid = currentName;
					data.state = "qiangzhuang";
					data.value = player.getIsQiang();
					socket.emit(currentRoom+'play_state_change',JSON.stringify(data));
					socket.emit('qiangzhuang_done');
				}else if(player.getStatus()=="beishu"){
					//整理牌中
					if(room.getRoomConf().playType=="see"){
						var msgBean = {};
						msgBean.pokerList = new Array();
						for(var j=0;j<4;j++){
							msgBean.pokerList.push(player.getPokerList()[j])
						}
						if(msgBean.pokerList.length <= 0){
						}
						msgBean.playerList = room.getPlayerList();
						socket.emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
					}
					socket.emit(currentRoom+'selectrate');
				}else if(player.getStatus()=="beishued"){
					//整理牌中
					if(room.getRoomConf().playType=="see"){
						var msgBean = {};
						msgBean.pokerList = new Array();
						for(var j=0;j<4;j++){
							msgBean.pokerList.push(player.getPokerList()[j])
						}
						if(msgBean.pokerList.length <= 0){
						}
						var info = GetRoomWithoutCard(room);
						msgBean.playerList = info.playerList;
						socket.emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
					}
					socket.emit(currentRoom+'selectrate');
					var data = {}
					data.uid = currentName;
					data.state = "beishu";
					data.value = player.getBaseRate();
					socket.emit(currentRoom+'play_state_change',JSON.stringify(data));
					socket.emit('dealbaserate_success');
				}else if(player.getStatus()=="arranging"){
					//整理牌中
					var msgBean = {};
					msgBean.pokerList = player.getPokerList();
					if(msgBean.pokerList.length <= 0){
					}
					player.setPokerPlayList(null);
					socket.emit(player.getUid() + 'dealingTheFiveCards', JSON.stringify(msgBean));
				}else if(player.getStatus()=="arranged"){
					//整理好牌
					var data = {}
					data.uid = currentName;
					data.state = "dealpoker";
					data.value = true;
					socket.emit(currentRoom+ 'play_state_change', JSON.stringify(data));
				}else if(player.getStatus()=="ready"){
							
				}
			}else{
				
			}
			var info = GetRoomWithoutCard(room);
			socket.emit('checkPlayerStatus_success',JSON.stringify(info));
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});
//*---------------------------------------------
	socket.on('voice_msg',function(data){
		console.log("voice_msg:msg"+msg)
		try{
			if(currentName == null){return;}
			var selfdata=data;
			socket.broadcast.to(currentRoom).emit('voice_msg_push', {sender:currentName,content:selfdata});
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});
	socket.on('voice_msg_owner',function(data){
		console.log("voice_msg_owner:msg"+msg)
		try{
			if(currentName == null){return;}
			socket.emit('voice_msg_owner_push',{sender:currentName,content:data});
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});
	socket.on('quick_chat',function(data){
		console.log("quick_chat:msg"+msg)
		try{
			if(currentName == null){return;}
			var chatId = data;
			io.sockets.in(currentRoom).emit('quick_chat_push',{sender:currentName,content:chatId});
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});
	socket.on('emoji',function(data){
		console.log("emoji:msg"+msg)
		try{
			if(currentName == null){return;}
			var phizId = data;
			io.sockets.in(currentRoom).emit('emoji_push',{sender:currentName,content:phizId});
		}catch(err){
			console.log("ErrorInfo: "+err);
			console.log("ErrorInfo: "+err.stack);
		}
	});

});


//算分. 还有所有牌局结束
function UpdateScore(room){
	var TotalScore = {}
	return TotalScore
}

function UpdateRoomTime(room,timeID){
	try{
		var data = {};
		data.roomNum = room.getRoomNum();
		data.roomStage = room.getRoomStage();
		data.stagetime = room.getStageTime();
		data.lasttime = RoomStageTime[data.roomStage];
		if(room.getNumOfGame() == 0 && data.roomStage == "room_ready"){
			data.lasttime = RoomStageTime["room_first_ready"];
		}
		data.servertime = Date.parse(new Date())/1000;
		room.setTimeId(timeID); //先不保存
		io.sockets.in(data.roomNum).emit(data.roomNum+'room_time_update', JSON.stringify(data));
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

function beginGame(roomNum){
	try{
		var room = roomMap[roomNum];
		console.log("beginGame:"+roomNum+"_Num:"+room.getNumOfGame()+"_stage_"+room.getRoomStage());
		if(room.getPlayerStatusCount("ready") > 1){
			room.setRoomStage("room_qiang");
			clearTimeout(room.getTimeId());
			if( room.getNumOfGame() < room.getMaxOfGame() ){
				room.setNumOfGame(room.getNumOfGame()+1);
				io.sockets.in(roomNum).emit(roomNum+'startGame', JSON.stringify(room.getNumOfGame()));
				room.setIsPlaying(true);
				for(var i = 0; i < room.getPlayerList().length; i++){
					var player =  room.getPlayerList()[i];
					if(player.getStatus() == "ready"){
						player.setStatus("qiang");	//只有这边设置过这个状态，保证唯一，qiang的这个状态。。除非断线的神奇bug
						player.Joinin();
					}
				}
				if(room.getRoomConf().playType == "see"){	//看牌局 先发四张
					dealingCard4(room)
				}
				if(room.getRoomConf().zhuangType == "turn"){	//抢庄局，通知抢庄
					for(var i = 0; i < room.getPlayerList().length; i++){
						var player =  room.getPlayerList()[i];
						player.setQiangNum(0);
					}
					room.setStageTime(Date.parse(new Date())/1000)
					var	timeID = setTimeout(function(){
						AutoQiang(roomNum);
					},RoomStageTime["room_qiang"] * 1000 );
					UpdateRoomTime(room,timeID);
				}else if(room.getRoomConf().zhuangType == "fix"){
					if(room.getNumOfGame()==1){
						for(var i = 0; i < room.getPlayerList().length; i++){
							var player =  room.getPlayerList()[i];
							player.setQiangNum(0);
						}
						room.setStageTime(Date.parse(new Date())/1000)
						var	timeID = setTimeout(function(){
							AutoQiang(roomNum);
						},RoomStageTime["room_qiang"] * 1000 );
						UpdateRoomTime(room,timeID);
					}else{
						for(var i = 0; i < room.getPlayerList().length; i++){
							var player =  room.getPlayerList()[i];
							if(player.getStatus() == "qiang"){
								player.setStatus("beishu");
								player.Joinin();
							}
						}
						room.setStageTime(Date.parse(new Date())/1000)
						var	timeID = setTimeout(function(){
							AutoBaserate(roomNum);
						},RoomStageTime["room_beishu"] * 1000 );
						UpdateRoomTime(room,timeID);
						var data = {}
						data.user = new Array();
						data.user.push(room.getZhuangUser());
						data.zhuang = room.getZhuanUid()
						io.sockets.in(roomNum).emit(roomNum+'deal_zhuang',JSON.stringify(data));
					}
				}else if(room.getRoomConf().zhuangType == "nnsz"){
					if(room.getNumOfGame()==1){
						for(var i = 0; i < room.getPlayerList().length; i++){
							var player =  room.getPlayerList()[i];
							player.setQiangNum(0);
						}
						room.setStageTime(Date.parse(new Date())/1000)
						var	timeID = setTimeout(function(){
							AutoQiang(roomNum);
						},RoomStageTime["room_qiang"] * 1000 );
						UpdateRoomTime(room,timeID);
					}else{
						for(var i = 0; i < room.getPlayerList().length; i++){
							var player =  room.getPlayerList()[i];
							if(player.getStatus() == "qiang"){
								player.setStatus("beishu");
								player.Joinin();
							}
						}
						room.setStageTime(Date.parse(new Date())/1000)
						var	timeID = setTimeout(function(){
							AutoBaserate(roomNum);
						},RoomStageTime["room_beishu"] * 1000 );
						UpdateRoomTime(room,timeID);
						var data = {}
						data.user = new Array();
						data.user.push(room.getZhuangUser());
						data.zhuang = room.getZhuanUid()
						io.sockets.in(roomNum).emit(roomNum+'deal_zhuang',JSON.stringify(data));
					}
				}
				var data = {}
				data.playerList = room.getPlayerList();
				if(room.getRoomConf().zhuangType == "turn"){
					io.sockets.in(roomNum).emit(roomNum+'startGrab', JSON.stringify(data));
				}else{
					if(room.getNumOfGame()==1&&(room.getRoomConf().zhuangType == "fix"||room.getRoomConf().zhuangType == "nnsz")){
						io.sockets.in(roomNum).emit(roomNum+'startGrab', JSON.stringify(data));
					}else{
						io.sockets.in(roomNum).emit(roomNum+'selectrate',JSON.stringify(data));
					}
				}
				var info = GetRoomWithoutCard(room);
				io.sockets.in(room.getRoomNum()).emit(room.getRoomNum()+'state_changed', JSON.stringify(info));
			}else{
				room.setRoomStage("room_finish");
				var data = {}
				data.playerList = room.getPlayerList();
				data.playerList.sort(compare("score")).reverse();
				io.sockets.in(roomNum).emit(roomNum+'gameFinish', JSON.stringify(data));
			}
		}else{
			room.setRoomStage("room_wait")
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//抢庄
function StartQiang(roomNum){
	try{
		var room = roomMap[roomNum];
		var playerList = room.getPlayerList();
	//if(room.getPlayCount() == room.getPlayerStatusCount("qianged")){//设置了抢转状态的人数，和准备的人数一样
		var qiangNum4 = 0;
		var qiangNum2 = 0;
		var qiangNum1 = 0;
		var lastQiangNum = 0;
		var turnBeishu = 0;
		for(var i=0;i<playerList.length;i++){
			var p = playerList[i];
			if(p.getIsQiang() == 4){
				qiangNum4  = qiangNum4 + 1;
			}else if(p.getIsQiang() == 2){
				qiangNum2 = qiangNum2 + 1;
			}else if(p.getIsQiang() == 1){
				qiangNum1 = qiangNum1 + 1;
			}
		}
		if(qiangNum4 == 0 && qiangNum2 == 0 && qiangNum1 == 0){
			lastQiangNum = room.getPlayerStatusCount("qianged")
			turnBeishu = 0;
		};
		if(qiangNum4 !== 0 ){
			lastQiangNum = qiangNum4;
			turnBeishu = 4
		}
		if(qiangNum4 == 0 && qiangNum2 !== 0){
			lastQiangNum = qiangNum2;
			turnBeishu = 2
		}
		if(qiangNum4 == 0 && qiangNum2 == 0 && qiangNum1 !== 0){
			lastQiangNum = qiangNum1;
			turnBeishu = 1;
		}
		var zhuanIdx = Math.floor(Math.random()*lastQiangNum)
		var local = 0;
		var data = {};
		data.user = new Array();
		for(var i=0;i<playerList.length;i++){
			var p = playerList[i];
			if(p.getStatus() == "qianged"){
				if(p.getIsQiang() == turnBeishu  ){
					if(local == zhuanIdx){
						room.setZhuangUser(p.getUid());
						p.setIsGrab(true);
						if(room.getRoomConf().zhuangType=="fix"){
							p.updateScore(room.getRoomConf().shangZhuang*1);
						}
						clearTimeout(room.getTimeId());
						data.zhuang = p.getUid();
						if(p.getIsQiang() == 0){
							p.setQiangNum(1);
						}
					}
					data.user.push(p.getUid());
					local = local + 1;
				}
				p.setStatus("beishu");
			}
		}
		var msgBean = {};
		var info = GetRoomWithoutCard(room);
		msgBean.playerList = info.playerList;
		msgBean.isdeal_zhuan = true;
		io.sockets.in(roomNum).emit(roomNum+'selectrate',JSON.stringify(msgBean));
		io.sockets.in(roomNum).emit(roomNum+'deal_zhuang',JSON.stringify(data));
		room.setRoomStage("room_beishu");
		clearTimeout(room.getTimeId());
		room.setStageTime(Date.parse(new Date())/1000)
		var	timeID = setTimeout(function(){
			AutoBaserate(roomNum);
		},RoomStageTime["room_beishu"] * 1000 );
		UpdateRoomTime(room,timeID);
	//}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//时间到了，自动设置不抢庄
function AutoQiang(roomNum){
	try{	
		var room = roomMap[roomNum];
		//console.log("AutoQiang_"+roomNum +"_GameNum_:"+room.getNumOfGame() + "_"+room.getRoomStage());
		if(room.getRoomStage() !== "room_qiang"){
			//console.log("AutoQiang:return"+room.getRoomStage());
			return
		}
		clearTimeout(room.getTimeId());
		var playerList = room.getPlayerList();
		var num = 0;
		for(var i = 0; i < playerList.length; i++){
			var player = playerList[i];
			if(player.getStatus() == "qiang"){		
				player.QiangNum = 0;
				player.setStatus("qianged");
				var data = {}
				data.uid = player.getUid();
				data.state = "qiangzhuang";
				data.value = 0;
				io.sockets.in(roomNum).emit(roomNum+'play_state_change',JSON.stringify(data));
				num = num + 1;
			}
		}
		for(var m=0;m<playerList.length;m++){
			var player = playerList[m];
			if(player.getStatus() !== "qianged" && player.getStatus() !== "ready" && player.getStatus() !== "standup"){
				player.QiangNum = 0;
				console.log("error:qinag"+ roomNum + "_强制修改状态_"+player.getUid()+player.getStatus());
				player.setStatus("qianged");
			}
		}
		//@ 玩家状态错误的时候，比如说，某个玩家卡在qianged状态，或者一直不在qiang状态，那么自动修改的人数num，一直都小于0
		//  游戏就卡在这边，所以改成 用房间状态，room_qiang  判断是这个状态，就自动运行下去，下一阶段，房间状态就不一样了，不会运行两次
		//if(num > 0){
		if(room.getRoomStage() == "room_qiang"){
			io.sockets.in(roomNum).emit('qiangzhuang_done');
			StartQiang(roomNum);
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//自动下注
function AutoBaserate(roomNum){
	try{
		var room = roomMap[roomNum];
		//console.log("AutoBaserate_"+roomNum +"_GameNum_:"+room.getNumOfGame() + "_"+room.getRoomStage());
		if(room.getRoomStage() !== "room_beishu"){
			//console.log("AutoQiang:return"+room.getRoomStage());
			return
		}
		clearTimeout(room.getTimeId());
		var playerList = room.getPlayerList();
		var num = 0;
		for(var i = 0; i < playerList.length; i++){
			var player = playerList[i];
			if(player.isGrab==true){
				player.setStatus("beishued");
				continue
			}
			if(player.getStatus() == "beishu"){		
				player.setBaseRate(1);
				player.setStatus("beishued");
				var data = {}
				data.uid = player.getUid();
				data.state = "beishu";
				data.value = 1;
				io.sockets.in(roomNum).emit(roomNum+'play_state_change',JSON.stringify(data));
				num = num + 1;
			}
		}
		for(var m=0;m<playerList.length;m++){
			var player = playerList[m];
			if(player.getStatus() !== "beishued" && player.getStatus() !== "ready" && player.getStatus() !== "standup"){
				player.setBaseRate(1);
				console.log("error:rate"+ roomNum + "_强制修改状态_"+player.getUid()+player.getStatus());
				player.setStatus("beishued");
			}
		}

		if(room.getRoomStage() == "room_beishu"){
			io.sockets.in(roomNum).emit('dealbaserate_success');
			if(room.getRoomConf().playType == "see"){
				var data = {}
				data.state = "kanpai";
				io.sockets.in(roomNum).emit(roomNum+'kanpai_state_change',JSON.stringify(data));
			}else{
				dealingCard5(room)
				var data = {}
				data.state = "kanpai";
				io.sockets.in(roomNum).emit(roomNum+'kanpai_state_change',JSON.stringify(data));
			}
			room.setRoomStage("room_fanpai");
			clearTimeout(room.getTimeId());
			room.setStageTime(Date.parse(new Date())/1000)
			var	timeID = setTimeout(function(){
					AutoShowAllPokers(room.getRoomNum());
				},RoomStageTime["room_fanpai"] * 1000 );
			UpdateRoomTime(room,timeID);
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//自动展示牌
function AutoShowAllPokers(roomNum){
	try{
		var room = roomMap[roomNum];
		if(room.getRoomStage() !== "room_fanpai"){
			return;
		}
		room.setRoomStage("room_arrang");
		for(var i=0;i<room.getPlayerList().length;i++){
			var player = room.getPlayerList()[i];
			if(player.getStatus()=="beishued" && (room.getPlayerStatusCount("beishued")+room.getPlayerStatusCount("arranging")+room.getPlayerStatusCount("arranged"))==room.getPlayCount()) {
				if(room.getRoomConf().playType =="nor"){
					dealingUserCardFour(room,player.getUid());
				}
				dealingUserCardAll(room,player.getUid());
			}
		}
		clearTimeout(room.getTimeId());
		room.setStageTime(Date.parse(new Date())/1000)
		var	timeID = setTimeout(function(){
			AutoDeal(room.getRoomNum());
		},RoomStageTime["room_arrang"] * 1000 );
		UpdateRoomTime(room,timeID);
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}
function AutoDeal(roomNum){
	try{
		var room = roomMap[roomNum];
		clearTimeout(room.getTimeId());
		console.log("AutoDeal"+roomNum +"_GameNum_:"+room.getNumOfGame() + "_"+room.getRoomStage());
		if(room.getRoomStage() == "room_arrang"){
			io.sockets.in(roomNum).emit('dealpoker_done');
			for(var i=0;i<room.getPlayerList().length;i++){
				var p = room.getPlayerList()[i];
				if(p.status=="arranging"){
					var data = {};
					data.uid = p.getUid();
					data.cards = p.getPokerList();
					data.value = pm.cal(data.cards,room.conf);
					io.sockets.in(roomNum).emit(roomNum+'user_deal_poker_done',JSON.stringify(data));
				}
			}
			ComparePoker(room);
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}
		

//开始发牌。
function dealingCard4(room){
	try{
		if(room.getRoomConf().playerNum == 12){
			var pokerMap = pm.genAllPokers12();
		}else{
			var pokerMap = pm.genAllPokers();
		}
		// console.log("[socket/dealingCard4]list:" + pokerMap)
		var playerList = room.getPlayerList();
		for(var i = 0; i < playerList.length; i++){
			var player = playerList[i];
			if(player.getIsPlayCurrent()){
				var msgBean = {};
				msgBean.pokerList = new Array();
				var pokerList = pokerMap[i];
				player.setPokerList(pokerList.slice());
				for(var j=0;j<4;j++){
					msgBean.pokerList.push(pokerList[j])
				}
				if(msgBean.pokerList.length <= 0){
				}
				msgBean.playerList = room.getPlayerList();
				io.sockets.in(room.getRoomNum()).emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
			}else{
				var msgBean = {};
				msgBean.pokerList = new Array();
				msgBean.playerList = room.getPlayerList();
				io.sockets.in(room.getRoomNum()).emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
			}
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

function dealingUserCardFour(room,uid){
	try{
		var player = room.getPlayer(uid)
		if(player.getIsPlayCurrent()){
			var msgBean = {};
			msgBean.pokerList = new Array();
			for(var j=0;j<4;j++){
				msgBean.pokerList.push(player.getPokerList()[j])
			}
			player.setPokerPlayList(null);
			io.sockets.in(room.getRoomNum()).emit(player.getUid() + 'dealingTheFourCards', JSON.stringify(msgBean));
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

function dealingUserCardAll(room,uid){
	try{
		var player = room.getPlayer(uid)
		if(player.getIsPlayCurrent()){
			var msgBean = {};
			msgBean.pokerList = player.getPokerList();
			player.setStatus("arranging");
			player.setPokerPlayList(null);
			io.sockets.in(room.getRoomNum()).emit(player.getUid() + 'dealingTheFiveCards', JSON.stringify(msgBean));
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

//开始发牌。
function dealingCard5(room){
	try{
		if(room.getRoomConf().playerNum == 12){
			var pokerMap = pm.genAllPokers12();
		}else{
			var pokerMap = pm.genAllPokers();
		}
		var playerList = room.getPlayerList();
		for(var i = 0; i < playerList.length; i++){
			var player = playerList[i];
			if(player.getIsPlayCurrent()){
				var msgBean = {};
				msgBean.pokerList = new Array();
				var pokerList = pokerMap[i];
				// 保存牌到玩家对象中
				player.setPokerList(pokerList.slice());
				for(var j=0;j<3;j++){
					msgBean.pokerList.push(pokerList[j])
				}
				//清空上一局的临时存储的牌，用户排好的牌
				player.setPokerPlayList(null);
				//修改用户当前状态
				if(msgBean.pokerList.length <= 0){
				}
				msgBean.playerList = room.getPlayerList();
				io.sockets.in(room.getRoomNum()).emit(player.getUid() + 'dealingCards', JSON.stringify(msgBean));
			}
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
	//@ddsh  这边是不是重复了，AutoBaseRate的时候，设置了，dealbaseRate人数达到的时候，也设置了。
	/*
	room.setRoomStage("room_arrang");
	clearTimeout(room.getTimeId());
	room.setStageTime(Date.parse(new Date())/1000)
	var	timeID = setTimeout(function(){
		AutoDeal(room.getRoomNum());
	},RoomStageTime["room_arrang"] * 1000 );
	UpdateRoomTime(room,timeID);
	*/

}

//比较扑克
function ComparePoker(room){
	try{
		if(room.getRoomStage() == "room_wait"){
			return
		}
		room.setRoomStage("room_wait");
		var playerList = room.getPlayerList();
		var conf = {
			niu7:room.getRoomConf().niu7,
			teshu:room.getRoomConf().teshu,
			difen:room.getRoomConf().difen,
		}
		var result = pm.ComparePoker(room,room.getRoomConf());
		room.setScoreInfo(result);

		//每局分数 通知 大厅服务器	
		var post_data = {};
		var gameResult = new Array();
		var porkList = {}
		var zhuang = room.getPlayer(room.getZhuangUser());
		var isxiazhuang = false;
		var zhuangScore = 0;
		if(room.getRoomConf().zhuangType=="fix" && room.getRoomConf().shangZhuang>0 && (result[zhuang.getUid()].score+zhuang.getScore())<=0){
			isxiazhuang = true;
			zhuangScore = zhuang.getScore();
		}
		var scoreTooLow = false;
		var resultinfo = new Array();
		var resultinfo2 = new Array();
		//下庄
		for(var k=0;k<playerList.length;k++){
			var player = playerList[k];
			if(player.getIsPlayCurrent()){
				var rs = {};
				rs.score = result[player.uid].score;
				rs.uid=player.uid;
				if(result[player.uid].score<=0){
					resultinfo.push(rs);
				}else{
					resultinfo2.push(rs);
				}
			}
		}
		if(isxiazhuang==true){
			resultinfo.sort(compare("score"));
			for (var i=0;i<resultinfo.length;i++) {
				var rs = resultinfo[i];
				if(rs.uid==zhuang.getUid()){
					result[rs.uid].score = -zhuang.getScore();
					continue;
				}
				zhuangScore = zhuangScore - rs.score;
			}
			resultinfo2.sort(compare("score")).reverse();
			for (var i=0;i<resultinfo2.length;i++) {
				var rs = resultinfo2[i];
				if(rs.uid==zhuang.getUid()){
					result[rs.uid].score = -zhuang.getScore();
					continue;
				}
				zhuangScore = zhuangScore - rs.score;
				if(scoreTooLow == false){
					if(zhuangScore<=0){
						result[rs.uid].score = zhuangScore+rs.score;
						scoreTooLow = true
					}
				}else{
					result[rs.uid].score = 0;
				}
			}
		}
		for(var k=0;k<playerList.length;k++){
			var player = playerList[k];
			if(player.getIsPlayCurrent()){
				//更新玩家积分
				player.updateScore(result[player.getUid()].score);
				if(result[player.getUid()].value==10){
					player.setLastnn(true)
				}
				result[player.getUid()].totalScore =player.getScore();
				var oneResult={};
				oneResult['uid']=player.getUid();
				oneResult['score']=result[player.getUid()].score;
				oneResult["cards"]=result[player.getUid()].cards
				gameResult.push(oneResult);
				var pokers ={};
				for(var n=0;n<player.pokerList.length;n++){
					pokers[n]={}
					pokers[n]['name']=player.pokerList[n]['name'];
				}
				porkList[player.uid]={};
				porkList[player.uid]['porkList']= pokers
				if(player.isGrab==false||player.isGrab==null){
					porkList[player.uid]['rate']= player.baserate;
				}else{
					porkList[player.uid]['rate']= player.QiangNum==0?1:player.QiangNum;
				}
				porkList[player.uid]['niu']=result[player.getUid()].value;
				porkList[player.uid]['isbanker']= player.isGrab;
			}
		}
		io.sockets.in(room.getRoomNum()).emit(room.getRoomNum()+'game_score', JSON.stringify(result));
		clearTimeout(room.getTimeId());
		var fn1=function(){
			for(var k=0;k<playerList.length;k++){
				var player = playerList[k];
				if(player.getIsPlayCurrent()){
					player.setStatus("standup");
				}else{
					if(player.getStatus() !== "ready"){
						player.setStatus("standup");
					}
				}
			}
			var info_temp = GetRoomWithoutCard(room);
			var info= JSON.stringify(info_temp)
			io.sockets.in(room.getRoomNum()).emit(room.getRoomNum()+'state_changed', info);
			room.restartGame();
		}
		setTimeout(fn1,3500);
		if(room.getNumOfGame()==room.getMaxOfGame()){
			room.setRoomStage("room_finish");
		}

		var dtime=Date.parse(new Date())/1000;
		post_data['roomNum'] = room.getRoomNum();
		post_data['inningsNum'] = room.getNumOfGame();
		post_data['result'] = JSON.stringify(gameResult);
		post_data['time'] = dtime;
		post_data['extInfo'] = JSON.stringify(porkList);
		postHall(post_data,'/room/round');

		var info_temp = GetRoomWithoutCard(room);
		var info= JSON.stringify(info_temp)
		if(isxiazhuang==true){
			room.setRoomStage("room_finish");
			var fn=function(){
				var data = {}
				data.playerList = room.getPlayerList();
				data.playerList.sort(compare("score")).reverse();
				io.sockets.in(room.getRoomNum()).emit(room.getRoomNum()+'gameFinish', JSON.stringify(data));
			}
			setTimeout(fn,3000);
		}
		if(room.getRoomConf().zhuangType=="nnsz"){
			deal_shangZhuang(room);
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

function compare(propertyName) {
	try{
		return function(object1, object2) {
		var value1 = object1[propertyName];
		var value2 = object2[propertyName];
		if (value2 < value1) {
			return 1;
		} else if (value2 > value1) {
			return -1;
		} else {
			return 0;
		}
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}

function checkPork(porkList){
	// for (var i=0;i<(porkList.length-1);i++) {
	// 	var pk1 = porkList[i];
	// 	for(var k=i+1;k<(porkList.length-1);k++){
	// 		var pk2 = porkList[k];
	// 		for(var n=k+1;n<porkList.length;n++){
	// 			var pk3 = porkList[n];
	// 			if((pk1.value+pk2.value+pk3.value)%10==0){
	// 				pk1.sortValue=-1;
	// 				pk2.sortValue=-1;
	// 				pk3.sortValue=-1;
	// 				break;
	// 			}
	// 		}
	// 		if(pk2.sortValue==-1){
	// 			break;
	// 		}
	// 	}
	// 	if(pk1.sortValue==-1){
	// 		break;
	// 	}
	// }
}

//将数据发送到web平台
function postHall(post_data,path,callback){
	var hosts = config.SDK_HOST.split(':');
	if (hosts[1] == undefined || hosts[1] == '') {
		hosts[1] = '80';
	}
	var keys = [];
	for (var key in post_data) {
		keys.push(key);
	}
	keys.sort();
	var str = '';
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		str += key + post_data[key];
	}
	post_data.str = str;
	post_data.sign = crypto.md5(crypto.md5(str) + config.SDK_PRI_KEY);
	console.log("[socket/postHall]11111path:"+path)
	http.post2(hosts[0], hosts[1], path, post_data, function(data){
		if(callback!=null&&callback!=undefined){
			console.log("[socket/postHall]测试数据:"+data)
			callback(data);
		}			
	});
}

function deal_shangZhuang(room){
	try{
		var lastnnNum=room.getLastnnCount();
		var playerList = room.getPlayerList();
		var lastzhuang =0;
		if(lastnnNum>0){
			var zhuanIdx = Math.floor(Math.random()*lastnnNum)
			var local = 0;
			var data = {};
			data.user = new Array();
			for(var i=0;i<playerList.length;i++){
				var p = playerList[i];
				if(p.isGrab == true){
					lastzhuang = p;
					p.setIsGrab(false);
				}
				if(p.getLastnn() == true){
					if(local == zhuanIdx){
						room.setZhuangUser(p.getUid());
						p.setIsGrab(true);
						data.zhuang = p.getUid();
						p.setQiangNum(lastzhuang.QiangNum);
						lastzhuang.setQiangNum(0);
					}
					data.user.push(p.getUid());
					local = local + 1;
				}
			}
		}
	}catch(err){
		console.log("ErrorInfo: "+err);
		console.log("ErrorInfo: "+err.stack);
	}
}
var oneSecond = 1000 * 60 * 30 ; 
setInterval(function() {
	for (var k in roomMap) {
		var room = roomMap[k]
		if(room.isPass()){
			console.log("TimePass_delRoom",room.getRoomNum());
			updateRoom(room.getRoomNum(),"remove");
			delete roomMap[k];
		}
  	}
}, oneSecond);
var oneSecond2 = 1000 * 60 * 10 ; 
setInterval(function() {
	for (var k in roomMap) {
		var room = roomMap[k]
		if(room.isFinish()){
			console.log("RoomFinish_delRoom",room.getRoomNum());
			updateRoom(room.getRoomNum(),"remove");
			delete roomMap[k];
		}
  	}
}, oneSecond2);


//等待的时间，
var RoomStageTime = {
	"room_first_ready":30,
	"room_ready":10,
	"room_qiang":10,
	"room_beishu":10,
	"room_fanpai":5,
	"room_arrang":10,
 }