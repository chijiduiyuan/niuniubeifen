(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/utils/HTTP.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '393007tIjxANqjaEynrBoaM', 'HTTP', __filename);
// scripts/utils/HTTP.js

"use strict";

var HTTP = cc.Class({
    extends: cc.Component,

    statics: {
        sessionId: 0,
        userid: 0,
        master_url: URL,
        url: URL,
        sendRequest: function sendRequest(path, data, handler, extUrl) {
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;
            var str = "?";
            for (var k in data) {
                if (str != "?") {
                    str += "&";
                }
                str += k + "=" + data[k];
            }
            if (extUrl == null) {
                extUrl = HTTP.url;
            }
            var requestURL = extUrl + path + encodeURI(str);
            xhr.open("GET", requestURL, true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if (handler !== null) {
                            handler(ret);
                        }
                    } catch (e) {} finally {}
                }
            };

            if (false) {}
            xhr.send();
            return xhr;
        }
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=HTTP.js.map
        