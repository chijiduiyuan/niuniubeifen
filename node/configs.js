//大厅IP
var HALL_IP = "47.100.41.255";
//大厅端口
var HALL_PORT = 10000;

//账号服务器通讯密钥
var ACCOUNT_PRI_KEY = "^&*211242%()@";
//房间服务器通讯密钥
var ROOM_PRI_KEY = "~!@#$(2344234%$&";
//与WEB服务器地址
var SDK_HOST="127.0.0.1:8072";
//与WEB服务器通讯密钥
var SDK_PRI_KEY = "bb7b25ae6aav166355566d2ec4cdc124";

var LOCAL_IP = 'localhost';

//账号服配置
exports.account_server = function(){
	return {
		CLIENT_PORT:HALL_PORT,
		HALL_IP:HALL_IP,
		HALL_PORT:HALL_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		SDK_PRI_KEY:SDK_PRI_KEY,
		VERSION:'20161227',
		APP_WEB:'/',
		//与大厅服协商好的通信加密KEY
		ROOM_PRI_KEY:ROOM_PRI_KEY,
	};
};

exports.niuniu_server = function(){
	return {
		SERVER_ID:"1",
		GAME_ID:"nn",
		//HTTP TICK的间隔时间，
		HTTP_TICK_TIME:5000,
		//大厅服IP
		HALL_IP:LOCAL_IP,
		//大厅服端口
		HALL_PORT:HALL_PORT,
		//与大厅服协商好的通信加密KEY
		ROOM_PRI_KEY:ROOM_PRI_KEY,
		//SDK平台服务器
		SDK_HOST:SDK_HOST,
		SDK_PRI_KEY:SDK_PRI_KEY,
		//暴露给客户端的接口
		CLIENT_IP:HALL_IP,
		CLIENT_PORT:10001,
	};
};

exports.zhajinhua_server = function(){
	return {
		SERVER_ID:"1",
		GAME_ID:"zjh",
		//HTTP TICK的间隔时间，
		HTTP_TICK_TIME:5000,
		//大厅服IP
		HALL_IP:LOCAL_IP,
		//大厅服端口
		HALL_PORT:HALL_PORT,
		//与大厅服协商好的通信加密KEY
		ROOM_PRI_KEY:ROOM_PRI_KEY,
		//SDK平台服务器
		SDK_HOST:SDK_HOST,
		SDK_PRI_KEY:SDK_PRI_KEY,
		//暴露给客户端的接口
		CLIENT_IP:HALL_IP,
		CLIENT_PORT:10003,
	};
};



