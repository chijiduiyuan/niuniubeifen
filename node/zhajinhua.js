
var configs = require("./configs");
var socket = require("./zjh/socket");

var zjh_config = configs.zhajinhua_server();
socket.start(zjh_config);