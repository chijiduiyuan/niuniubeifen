var crypto = require('../utils/crypto');
var express = require('express');

var http = require("../utils/http");
const fs = require("fs");
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit:'2mb', extended:true}));
var hallAddr = "";



function send(res,ret){
	var str = JSON.stringify(ret);
	res.send(str)
}

var config = null;
var serverMap = {};
var roomMap = {};



exports.start = function(cfg){
	config = cfg;
	hallAddr = config.HALL_IP  + ":" + config.HALL_PORT;
	app.listen(config.CLIENT_PORT);
	console.log("account server is listening on " + config.CLIENT_PORT);
}

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


app.get('/get_serverinfo',function(req,res){
	var ret = {
		version:config.VERSION,
		hall:hallAddr,
		appweb:config.APP_WEB,
	}
	send(res,ret);
});

app.get('/guest',function(req,res){
	var account = "sdk_" + req.query.account;
	var sign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
	var ret = {
		errcode:0,
		errmsg:"ok",
		account:account,
		halladdr:hallAddr,
		sign:sign
	}
	send(res,ret);
});

app.get('/platform_login',function(req,res){
	console.log("platform_login");
	var account = "sdk_" + req.query.account;
	var str = "currency="+req.query.currency+"&ext="+decodeURIComponent(req.query.ext)+"&gameId=" + req.query.gameId +"&inningsNum="+ req.query.inningsNum +"&payType="+req.query.payType+"&roomNum="+req.query.roomId+"&time=" + req.query.time + "&uid=" + req.query.account + "&userName=" + decodeURIComponent(req.query.userName)+"&appkey="+config.SDK_PRI_KEY;
	var sign2 = crypto.md5(str);

	if(sign2 !== req.query.sign){
	 	var ret = {
	 		errcode:1,
	 		errmsg:"sign error",
	 		account:account,
	 		halladdr:hallAddr,
	 		sign:sign2
	 	}
	 	send(res,ret);
	}else{
		var ret = {
			errcode:0,
			errmsg:"ok",
			account:account,
			halladdr:hallAddr,
		}
		send(res,ret);
	}
});

app.get('/login',function(req,res){
	var ip = req.ip;
	if(ip.indexOf("::ffff:") != -1){
		ip = ip.substr(7);
	}
	
	var account = req.query.account;
	var gameId = req.query.gameId;
	var roomNum = req.query.roomNum;
	var ret = {
		errcode:0,
		ip:ip,
	};
	var serverinfo=chooseServer(gameId,roomNum);
	if(serverinfo !== null){
		ret.clientip = serverinfo.clientip;
		ret.clientport = serverinfo.clientport;
		http.send(res,0,"ok",ret);
	}else{
		ret.errcode=1;
		ret.clientip = "0";
		ret.clientport = "0";
		http.send(res,0,"error",ret);
	}
});


app.get('/register_gs',function(req,res){
	var ip = req.ip;
	var clientip = req.query.clientip;
	var clientport = req.query.clientport;
	var gameId = req.query.gameId;
	var load = req.query.load;
	var id = clientip + ":" + clientport;
	
	var reqSign = req.query.sign
	var sign = crypto.md5(clientip+config.ROOM_PRI_KEY);
	if(sign !== reqSign){
		return;
	}

	var dtime=Date.parse(new Date())/1000;
	if(Object.keys(serverMap).length>0){
		for(var key in serverMap){
			if(key!=id){
				var server = serverMap[key];
				if(server.time + 60 < dtime){
					console.log("TimeOut_delServer:",key);
					delete serverMap[key];
				}
			}
		}
	}
	if(serverMap[id]){
		var info = serverMap[id];
		if(info.clientport != clientport || info.ip != ip){
			console.log("duplicate gsid:" + id + ",addr:" + ip );
			http.send(res,1,"duplicate gsid:" + id);
			return;
		}
		info.load = load;
		info.time = dtime;
		http.send(res,0,"ok",{ip:ip});
		return;
	}
	serverMap[id] = {
		ip:ip,
		id:id,
		gameId:gameId,
		clientip:clientip,
		clientport:clientport,
		load:load,
		state:"normal",
		time:dtime
	};
	http.send(res,0,"ok",{ip:ip});
	console.log("game registered.\tid:" + id + "\tsocket:" + clientport);
});

app.get('/register_room',function(req,res){
	var roomNum = req.query.roomNum;
	var action = req.query.action;
	var clientip = req.query.clientip;
	var clientport = req.query.clientport;
	var tag = clientip + ":" + clientport;
	if(serverMap[tag]){
		if(action == "add"){
			roomMap[roomNum] = tag
		}else{
			if(roomMap[roomNum] !== undefined){
				delete roomMap[roomNum]
			}
		}
		var info = JSON.stringify(roomMap)
	}
});


function chooseServer(gameId,roomNum){
	var serverinfo = null;
	for(var s in serverMap){
		if(serverMap[s].gameId == gameId){
			var info = serverMap[s];
			var tag = info.clientip + ":" + info.clientport;
			if(roomMap[roomNum] !== undefined){
				serverinfo = serverMap[roomMap[roomNum]];
			}else{
				if(info.state == "normal"){
					if(serverinfo == null){
						serverinfo = info;			
					}else{
						if(serverinfo.load > info.load){
							serverinfo = info;
						}
					}
				}
			}
		}
	}
	return serverinfo;
}

