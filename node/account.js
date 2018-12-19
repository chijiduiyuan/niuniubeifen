var configs = require('./configs');

var account_config = configs.account_server();
var account_server = require('./account/account_server');
account_server.start(account_config);

