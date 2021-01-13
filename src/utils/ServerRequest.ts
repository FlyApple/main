import {Singleton} from './singleton';
import {ShowToast} from '../components/MessageBox';

import * as network_x from './Network';

import config from '../config';

export class ServerRequest extends Singleton<ServerRequest> {
    private url_api;

    constructor() {
        super();
        this.url_api = config.server;
    }

    protected async _Result(nx, result) {
        if(!result) {
            ShowToast("error", `${nx.error_text}`, `Error (${nx.error_code})`);
            return null;
        }
        if(nx.data.code == undefined) {
            return null;
        }
        if(nx.data && nx.data.code < 0 || !nx.data.success) {
            ShowToast("error", `${nx.data.message}`, `Error (${nx.data.code})`);
            return null;
        }
        return nx.data;
    }

    public async Index() {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(``);
    }
    
    public async Settings(args?:any, data?:any) {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(`/system/settings`, args, data);
        return await this._Result(nx, result);
    }

    public async Register(args?:any, data?:any) {
        let nx = new network_x.NetworkA("post", this.url_api);
        let result = await nx.request(`/user/register`, args, data);
        return await this._Result(nx, result);
    }

    public async Login(args?:any, data?:any) {
        let nx = new network_x.NetworkA("post", this.url_api);
        let result = await nx.request(`/user/login`, args, data);
        return await this._Result(nx, result);
    }

    public async Logout(args?:any, data?:any) {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(`/user/logout`, args, data);
        return await this._Result(nx, result);
    }

    public async Verifying(args?:any, data?:any) {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(`/user/verifying`, args, data);
        return await this._Result(nx, result);
    }

    public async AuthToken(args?:any, data?:any) {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(`/auth/init`, args, data);
        return await this._Result(nx, result);
    }

    public async InitNoteList(args?:any, data?:any) {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(`/notes/list`, args, data);
        return await this._Result(nx, result);
    }

    public async SendingNotes(args?:any, data?:any) {
        let nx = new network_x.NetworkA("post", this.url_api);
        let result = await nx.request(`/notes/sending`, args, data);
        return await this._Result(nx, result);
    }

    // 
    public async ViewNote(args?:any, data?:any) {
        let nx = new network_x.NetworkA("post", this.url_api);
        let result = await nx.request(`/notes/view`, args, data);
        return await this._Result(nx, result);
    }

    public async ViewNoteItem(args?:any, data?:any) {
        let nx = new network_x.NetworkA("post", this.url_api);
        let result = await nx.request(`/notes/viewitem`, args, data);
        return await this._Result(nx, result);
    }

    public async InitNoteCommitList(args?:any, data?:any) {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(`/notes/commitlist`, args, data);
        return await this._Result(nx, result);
    }

    public async SendingCommit(args?:any, data?:any) {
        let nx = new network_x.NetworkA("post", this.url_api);
        let result = await nx.request(`/notes/commit`, args, data);
        return await this._Result(nx, result);
    }

    public async ReplyCommit(args?:any, data?:any) {
        let nx = new network_x.NetworkA("post", this.url_api);
        let result = await nx.request(`/notes/reply`, args, data);
        return await this._Result(nx, result);
    }

    public async InitNoteReplyCommitList(args?:any, data?:any) {
        let nx = new network_x.NetworkA("get", this.url_api);
        let result = await nx.request(`/notes/replylist`, args, data);
        return await this._Result(nx, result);
    }
}
