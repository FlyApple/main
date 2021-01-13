import React from 'react';
import G from './utils/global';

import mx from './utils';
import { ListItemSecondaryAction } from '@material-ui/core';


//
export default class XData {
    //
    public settings_data:any| undefined = undefined;
    public auth_data:any| undefined = undefined;
    public login_data:any| undefined = undefined;

    //
    public notes_data:any = {
      items: new Array<any>(),
      pages: new Array<any>(),
      views: new Array<any>(),
    };

    constructor() {
    }

    //----------------------------------------------------------------
    // LOAD and FREE
    public init() {
      this.load();
    }
  
    private load() {
      let data;
      let value = G.storageL.getItem(`login_data`);
      if(value) {
        let json = mx.crypto.base64DecodeString(value, true);
        data = JSON.parse(json);
        this.login_data = data;
      }
      return data;
    }

    private save() {
        let data = this.login_data;
        let value = JSON.stringify(data);
        if(value) {
            let json = mx.crypto.base64EncodeString(value);
            G.storageL.setItem(`login_data`, json);
        }
    }
    
    //----------------------------------------------------------------
    // SETTINGS
    public settings_set(data) {
      if(!data) {
        return false;
      }
      
      this.settings_data = data;
      return true;
    }

    //----------------------------------------------------------------
    // LOGIN
    public login_status(enter:boolean, result?:any, forward?:any, callback?:Function) {
      console.info(result, this.login_data && this.login_data.code, forward);
  
      //
      if (enter) {
        if(!result) { 
          this.login_data = {
            code:0,
            data:undefined, 
          };
        } else {
          this.login_data = {
            code:result.code,
            data:result.data 
          };
        }
        this.save();

        setTimeout(() => {
          callback && callback(this.login_data.code| -1, this.login_data.data);

          if (this.login_data && this.login_data.code > 0 && forward) {
            // 无论是登入或登出都要刷新页面
            //browserHistory.push(forward);
            window.location.href = forward;
          }
        }, 1000);
      } else {
        if(!this.login_data || this.login_data.code <= 0) {
          return ;
        }

        //
        this.login_data.code = 0;
        this.login_data.data = undefined;
        this.save();
        
        callback && callback(this.login_data.code| -1, this.login_data.data);

        //
        if(forward) {
          setTimeout(() => {
            // 无论是登入或登出都要刷新页面
            //browserHistory.push(forward);
            window.location.href = forward;
          }, 1000);
        }
      }
    }

    //----------------------------------------------------------------
    // NOTES
    public notes_data_load(data) {
      data = data || {};
      let items = data.items || [];
      for(let i = 0; i < items.length; i ++) {
        let v = items[i];
        this.notes_data.items[v.nid] = v;
      };
    }

    // page : 第0页开始
    public notes_page_data(page = 0, data?:any) {
      if(page < 0) {
        return false;
      }

      data = data || {};
      let items = data.items || [];
      let temp = new Array<any>();
      for(let i = 0; i < items.length; i ++) {
        let v = items[i];
        this.notes_data.items[v.nid] = v;

        temp.push({
          nid: v.nid, uid: v.uid,
        });
      };

      if(page < this.notes_data.pages.length) {
        this.notes_data.pages[page] = {
          count: data.count || 0,
          last: data.last || undefined,
          next: data.next || undefined,
          items: temp,
          time: data.time || 0,
        }
      } else {
        this.notes_data.pages.push({
          count: data.count || 0,
          last: data.last || undefined,
          next: data.next || undefined,
          items: temp,
          time: data.time || 0,
        });
      }
      return true;
    }

    public notes_page_total() {
      return this.notes_data.pages.length;
    }

    public notes_page_view(page) {
      if(page < 0 || page >= this.notes_data.pages.length) {
        return null;
      }

      let temp = { ...G.data.notes_data.pages[page] };
      if(!temp) {
        return null;
      }

      let items = new Array<any>();
      for(let i = 0; i < temp.items.length; i ++) { 
        let v = temp.items[i];
        items.push(this.notes_data.items[v.nid]);
      }

      temp.items = items;
      return temp;
    }

    // 
    // 获取NOTES
    public notes_item_get(nid) { 
      return this.notes_data.items[nid];
    }

    // 查看NOTE
    private notes_item_view_impl(nid) {
      let item = this.notes_data.items[nid];
      if(item) {
        item.view_total = (item.view_total || 0) + 1;
      }
      return item || null;
    }
    public notes_item_view(nid) {
      if(!nid || nid.length == 0) { return null; }
      return this.notes_item_view_impl(nid);
    }

    // 合并
    public notes_item_mset(nid, value) {
      let item = this.notes_data.items[nid];
      if(item) {
        item = { ...item, ...value};
      }
      this.notes_data.items[nid] = item;
    }

    // 获取评论
    public notes_commit_item_get(nid, commit_nid) { 
      let item:any = this.notes_item_get(nid);
      if(!item) {
        return null;
      }
      if(!item.commits || item.commits.length == 0) {
        return null;
      }

      let commit:any = null;
      for(let i = 0; i < item.commits.length; i ++) {
        if(item.commits[i].nid == commit_nid) {
          commit = item.commits[i]; break;
        }
      }
      return commit;
    }

    // 获取评论回复列表
    public notes_replycommit_list_get(nid, commit_nid) { 
      let commit:any = this.notes_commit_item_get(nid, commit_nid);
      if(!commit) {
        return null;
      }
      return commit.replies || null;
    }

    // 获取评论回复
    public notes_replycommit_item_get(nid, commit_nid, reply_nid) { 
      let replies = this.notes_replycommit_list_get(nid, commit_nid);
      if(!replies || replies.length == 0) { return null; }
      let reply:any = null;
      for(let i = 0; i < replies.length; i ++) {
        if(replies[i].nid == reply_nid) {
          reply = replies[i]; break;
        }
      }
      return reply;
    }

    // NOTE 加载
    public note_data_load(note) {
      if(!note) { return false; }
      let item = this.notes_data.views[note.nid];
      if(item) {
        if(item.nid == note.nid) {
          item = { ...item, ...note };
        }
      } else {
        item = { ...note};
      }
      this.notes_data.views[note.nid] = item;
      return true;
    }

    // NOTE 查看
    public note_view(nid) {
      if(!nid || nid.length == 0) { return null; }

      // NOTE 列表项目查看
      let item = this.notes_item_view_impl(nid);
      // 如果项目不存在，ITEMS列表存在则初始化
      let temp = this.notes_data.views[nid];
      if(!temp && item) {
        temp = { ...item }; // 复制对象
        this.notes_data.views[nid] = temp;
      }
      return temp;
    }

    // NOTE 评论
    public note_commits_load(nid, data) {
      let note = this.note_view(nid);
      if(!note) { return false; }

      if(!note.commits) {
        note.commits = [];
      }
      if(!data.commits) {
        data.commits = [];
      }
      note.commits = note.commits.concat(data.commits);

      note.pages = note.pages || [];
      note.pages.push(data);
      return true;
    }

    public note_commits_page_total(nid) {
      let note = this.note_view(nid);
      if(!note) { return 0; }

      return note.pages.length;
    }

    public note_commits_page_view(nid, page = 0) {
      let note = this.note_view(nid);
      if(!note || !note.pages) { return null; }

      if(page < 0 || page >= note.pages.length) {
        return null;
      }

      return note.pages[page];
    }

    // public note_commits_view(nid, commit_nid) {
    //   let note = this.note_view(nid);
    //   if(!note) { return null; }

    //   let item = null;
    //   let count = note.commits && note.commits.length > 0 ? note.commits.length : 0;
    //   for(let i = 0; i < count; i ++) {
    //     if(note.commits[i].nid == commit_nid) {
    //       item = note.commits[i];
    //       break;
    //     }
    //   }
    //   return item;
    // }

    public note_commits_pageitem_view(nid, commit_nid) {
      let note = this.note_view(nid);
      if(!note || !note.pages ) { return null; }

      let item = null;
      for(let i = 0; i < note.pages.length; i ++) {
        let page = note.pages[i];
        if(page && page.commits) {
          for(let n = 0; n < page.commits.length; n ++) {
            if(page.commits[n].nid == commit_nid) {
              item = page.commits[n];
              break;
            }
          }
          if(item) { break; }
        }
      }
      return item;
    }

    //pages项目和commits项目为同一源??
    public note_replycommits_load(nid, commit_nid, data) {
      if(!data || !data.replies || data.replies.length == 0) { return false; }
      
      // let item:any = this.note_commits_view(nid, commit_nid);
      // if(!item) { return false; }
      // item.replies = item.replies.concat(data.replies);

      let item:any = this.note_commits_pageitem_view(nid, commit_nid);
      if(!item) { return false; }
      item.replies = item.replies.concat(data.replies);
      return true;
    }
}
