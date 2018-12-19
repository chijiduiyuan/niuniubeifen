
var configs = require("./configs");
var socket = require("./niuniu/socket");

var niuniu_config = configs.niuniu_server();
socket.start(niuniu_config);