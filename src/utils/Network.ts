
import axios, { AxiosRequestConfig } from 'axios';
import * as iconv from 'iconv-lite';

//
export type NetworkX_METHOD = "get"| "post"| "options";
export type NetworkX_DataType = "text"| "json"| "html" | "xml";
export type NetworkX_Encoding = "utf8"| "gbk"| "gb2312";

export class NetworkX {
    protected _base_url: string = "";
    protected _method: NetworkX_METHOD = "get";
    protected _status: number = 200;
    protected _length: number = 0;
    protected _body:string = "";
    protected _encoding:NetworkX_Encoding = "utf8";
    protected _dataType:NetworkX_DataType = "json";
    protected _dataEncryptLevel:number = 0;
    protected _data:any = undefined;
    public get status() { return this._status; }
    public get body() { return this._body; }
    public get data() { return this._data; }

    // error
    protected _error_code: number = 0;
    protected _error_text: string = "";
    public get error_code() { return this._error_code; }
    public get error_text() { return this._error_text; }

    // float second
    protected _tick:number = 0;
    protected _time:number = 0.0;
    public get time() { return this._time; }

    constructor(method:NetworkX_METHOD, baseurl:string = "", type:NetworkX_DataType = "json") {
        this._method = method;
        this._dataType = type;
        this._base_url = baseurl.trim();
        if(!this._base_url.endsWith("\/")) {
            this._base_url = this._base_url + '\/';
        }
    }

    protected current_tick() {
        return new Date().getTime();
    }

    protected async pre_request() {
        this._status = 200;
        this._length = 0;

        this._error_code = 0;
        this._error_text = "";

        this._encoding = "utf8";
        this._body = "";
        this._data = undefined;
        this._tick = this.current_tick();
    }

    protected async finish_request(status:number = 0, error?:any) {
        this._time = (new Date().getTime() - this._tick) / 1000;
        this._status = status > 0 ? status : this._status;

        if(error) {
            // 连接出错或其它，默认按500处理
            if(this._status == 200) {
                this._status = 500; 
            }

            this._error_code = -1;
            if(typeof(error) == "string") { this._error_text = error; }
            else if(error instanceof String) { this._error_text = error.toString(); }
            else if(error instanceof Error) {
                this._error_text = error.message;
            } else {
                this._error_text = "Unknow Error";
            }
        }
    }

    protected parse_params(values:any) : string {
        if(values instanceof String) {
            return `T=${encodeURI(values.toString())}`;
        } else if (typeof values == "string") {
            return `T=${encodeURI(values.toString())}`;
        } else if(values instanceof Array) {
            let text = "";
            values.forEach((v, i) => {
                if(typeof v == "string" || values instanceof String) {
                    v = encodeURI(v);
                }
                text = `${text}${text.length > 0 ? "&" : ""}A${i}=${v}`;
            });
            return text;
        } else if(values instanceof Object) {
            let text = "";
            for(let i in values)
            {
                let v = values[i];
                if(typeof v == "string" || values instanceof String) {
                    v = encodeURI(v);
                }
                text = `${text}${text.length > 0 ? "&" : ""}${i}=${v}`;
            }
            return text;
        }
        return "";
    }

    protected parse_data(data:any) : boolean {
        if(!data) { return false; }

        let text = "";
        switch(this._dataType) {
            case "json":
            case "html":
            case "xml":
            case "text": 
            {
                if(data instanceof ArrayBuffer) {
                    let buffer = Buffer.from(data);
                    text = iconv.decode(buffer, this._encoding);
                } else if(data instanceof String) {
                    text = data.toString();
                } else if(typeof data == "string") {
                    text = data;
                } else if(data instanceof Buffer) {
                    text = iconv.decode(data, this._encoding);
                } else {
                    return false;
                }

                this._body = text;

                if(this._dataType == "json") {
                    this._data = JSON.parse(this._body);
                    if(!this._data) {
                        return false;
                    }
                } else if (this._dataType == "xml") {
                    let parser = new DOMParser();
                    this._data = parser.parseFromString(text, "text/xml");
                    if(!this._data) {
                        return false;
                    }
                } else if (this._dataType == "html") {
                    this._data = text;
                } else if (this._dataType == "text") {
                    this._data = text;
                }
                break;
            }
        }
        return true;
    }
}
/*
export class NetworkF extends NetworkX {

    private _option: RequestInit = {};

    constructor (method:NetworkX_METHOD = "get", baseurl:string="", type:NetworkX_DataType = "json") {
        super(method, baseurl, type);

        this._option.method = method.toUpperCase();
        //this._option.timeout = 5 * 1000;
        this._option.mode = "cors";
        this._option.credentials = "include";
        this._option.cache = "no-cache";
    }

    public request(url:string, params?:any, data?:any) : Promise<boolean> {

        //
        return new Promise((resolve) => {
            this.pre_request();

            if(this._base_url && this._base_url.length > 0) {
                if(url.startsWith("\/")) {
                    url = url.substring(1, url.length);
                }
                url = this._base_url + url;
            } 

            let param_values = this.parse_params(params);
            if(this._method != "post") {
                let data_values = this.parse_params(data);
                if(data_values.length > 0) {
                    param_values = `${param_values}&${data_values}`;
                }
            } else {
                // 将内容按JSON发送
                this._option.body = JSON.stringify(data);
            }
            if(param_values.length > 0) {
                if(url.indexOf("?") > 0 && !url.endsWith("?")) {
                    url = `${url}&${param_values}`;
                } else {
                    url = `${url}?${param_values}`;
                }
            }
            
            fetch(url, this._option)
                //headers
                .then((response) => {
                    this._status = response.status;
                    if(!response.ok) {
                        throw new Error(response.statusText);
                        return ;
                    }

                    response.headers.forEach((v, i, a) => {
                        if(i.toLowerCase() == "content-length") {
                            this._length = parseInt(v);
                        } else if (i.toLowerCase() == "content-type") {
                            let vals = v.match(/charset\=([\d\w]+)/i);
                            if(vals && vals[1]) {
                                let vv = vals[1].toLowerCase();
                                if(vv == "gbk") { this._encoding = "gbk"; }
                                else if(vv == "gb2312") { this._encoding = "gb2312"; }
                                else { this._encoding = "utf8"; }
                            }
                        }
                    });

                    return response.arrayBuffer();
                    //return response.text();
                })
                //body
                .then((data) => {
                    if(!this.parse_data(data)) {
                        throw new Error("JSON parse error");
                        return ;
                    }
                    this.finish_request();

                    return resolve(true);
                })
                .catch((reason) => {
                    this.finish_request(0, reason);
                    return resolve(false);
                });
                
            });
    }
}
*/

export class NetworkA extends NetworkX { 
    private _option: AxiosRequestConfig = {};

    constructor (method:NetworkX_METHOD = "get", baseurl:string="", type:NetworkX_DataType = "json") {
        super(method, baseurl, type);

        this._option.method = this._method;
        this._option.timeout = 3 * 1000;
        this._option.withCredentials = true;
        // xsrfCookieName 和 xsrfHeaderName 其实是可以不用设置的，
        // 在服务端API不需要从header中获取token的情况下我们不需要设置
        this._option.xsrfCookieName = "";
        //this._option.xsrfHeaderName = "",
        this._option.headers = {
             "Cache-Control": "max-age=0", //"no-cache",
        }
        this._option.httpsAgent = {};
    }

    public request(url:string, params?:any, data?:any) : Promise<boolean> { 
                
        return new Promise((resolve) => {
            this.pre_request();

            this._option.responseType = "arraybuffer";
            if(this._base_url && this._base_url.length > 0) {
                this._option.baseURL = this._base_url;
            }
            this._option.url = url;

            let param_values = this.parse_params(params);
            
            if(this._method != "post") {
                let data_values = this.parse_params(data);
                if(data_values.length > 0) {
                    param_values = `${param_values}&${data_values}`;
                }
            } else {
                // 将内容按JSON发送
                let raw_data = JSON.stringify(data);
                // 做一次转义
                raw_data = JSON.stringify(data);
                if(this._dataEncryptLevel == 0) {
                    // URI编码转换
                    this._option.data = encodeURIComponent(raw_data);
                }
            }
            // 已经做了URI转码,无需再重复转码
            this._option.params = param_values;
            this._option.paramsSerializer = (params) => {
                return param_values;
            };

            axios(this._option)
            .then((response) => {
                this._status = response.status;
                if(this._status < 200 || this._status >= 300) {
                    throw new Error(response.statusText);
                    return ;
                }
 
                for(let i in response.headers)
                {
                    let v = response.headers[i];
                    if(i.toLowerCase() == "content-length") {
                        this._length = parseInt(v);
                    } else if (i.toLowerCase() == "content-type") {
                        let vals = v.match(/charset\=([\d\w]+)/i);
                        if(vals && vals[1]) {
                            let vv = vals[1].toLowerCase();
                            if(vv == "gbk") { this._encoding = "gbk"; }
                            else if(vv == "gb2312") { this._encoding = "gb2312"; }
                            else { this._encoding = "utf8"; }
                        }
                    }
                };
                return response.data;
            })
            .then((data) => {
                if(!this.parse_data(data)) {
                    throw new Error("JSON parse error");
                    return ;
                }
                this.finish_request();

                return resolve(true);
            })
            .catch((reason)=> {

                this.finish_request(0, reason);
                return resolve(false);
            });
        });
    }
}