
function _Browsers() {};
_Browsers.Edge = /edge/i;
_Browsers.Firefox = /firefox/i;
_Browsers.IE = /msie|trident/i;
_Browsers.Chrome = /chrome/i;
_Browsers.Chromium = /chromium|crios/i;
_Browsers.Safari = /safari/i;
_Browsers.Opera = /opera|OPR/i;

_Browsers.EdgeVersion = /Edge\/([\d\w\.\-]+)/i;
_Browsers.FirefoxVersion = /firefox\/([\d\w\.\-]+)/i;
_Browsers.IEVersion = /msie\s([\d\.]+[\d])|trident\/\d+\.\d+;.*[rv:]+(\d+\.\d)/i;
_Browsers.ChromeVersion = /chrome\/([\d\w\.\-]+)/i;
_Browsers.ChromiumVersion = /(?:chromium|crios)\/([\d\w\.\-]+)/i;
_Browsers.SafariVersion = /version\/([\d\w\.\-]+)/i;
_Browsers.OperaVersion = /version\/([\d\w\.\-]+)|OPR\/([\d\w\.\-]+)/i;


const  _BrowserUtil = function (text) {
    var vv = "0.0";
    var res = "";
    switch (true) {
        case _Browsers.Edge.test(text):
            {
            this.isEdge = true;
            res = text.match(_Browsers.EdgeVersion);
            if(res && res.length > 1 && res[1]) { vv = res[1]; }
            this.browser = {name:"Edge", version:vv};
            break;
            }
        case _Browsers.Opera.test(text):
            {
            this.isOpera = true;
            res = text.match(_Browsers.OperaVersion);
            if(res && res.length > 1 && res[1]) { vv = res[1]; }
            this.browser = {name:"Opera", version:vv};
            break;
            }
        case _Browsers.Chromium.test(text):
            {
            this.isChrome = true;
            res = text.match(_Browsers.ChromiumVersion);
            if(res && res.length > 1 && res[1]) { vv = res[1]; }
            this.browser = {name:"Chromium", version:vv};
            break;
            }
        case _Browsers.Chrome.test(text):
            {
            this.isChrome = true;
            res = text.match(_Browsers.ChromeVersion);
            if(res && res.length > 1 && res[1]) { vv = res[1]; }
            this.browser = {name:"Chrome", version:vv};
            break;
            }
        case _Browsers.Safari.test(text):
            {
            this.isSafari = true;
            res = text.match(_Browsers.SafariVersion);
            if(res && res.length > 1 && res[1]) { vv = res[1]; }
            this.browser = {name:"Safari", version:vv};
            break;
            }
        //IE11: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko"
        case _Browsers.IE.test(text):
            {
            this.isIE = true;
            res = text.match(_Browsers.IEVersion);
            if(res && res.length > 1 && res[1]) { vv = res[1]; }
            else if(res && res.length > 2 && res[2]){ vv = res[2]; }
            this.browser = {name:"IE", version:vv};
            break;
            }
        case _Browsers.Firefox.test(text):
            {
            this.isFirefox = true;
            res = text.match(_Browsers.FirefoxVersion);
            if(res && res.length > 1 && res[1]) { vv = res[1]; }
            this.browser = {name:"Firefox", version:vv};
            break;
            }
        default:
            this.browser = {name:"unknown", version:"0.0"};
            break;
    }

    var versions = this.browser.version.split(/\./g);
    this.major = versions[0];
    this.minor = versions[1];
}

function BrowserVersion() {
    var ua = navigator.userAgent;
    var bu = new _BrowserUtil(ua);
    return bu;
}
