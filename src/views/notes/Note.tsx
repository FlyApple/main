//
import React from 'react';
import queryString from 'query-string';
import G from '../../utils/global';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Pagination from '@material-ui/lab/Pagination';

import TurnedInIcon from '@material-ui/icons/TurnedIn';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ChatIcon from '@material-ui/icons/Chat';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

import { IViewState, ViewBase } from '../Base';
import {IconVisibility} from '../../icons';

import mx from '../../utils'
import {getSingleton} from '../../utils/singleton';
import * as server_x from '../../utils/ServerRequest';
import {routeItems, browserHistory} from '../../routes/index';

import {NoteCommit} from '../../components/NoteCommit';
import {NoteCommitItem} from '../../components/NoteCommitItem';
import {ShowToast} from '../../components/MessageBox';


// NOTE 评论每页
const PAGE_NOTE_COMMIT_MAXNUM = 20;
const PAGE_NOTE_REPLY_MAXNUM = 5;

//
interface IViewNoteState extends IViewState {
    data: any;

    name: string | undefined;
    time: string;
    content: string;

    sending_commit: boolean;
    reply_commit: boolean;
    commit_count: number;

    page_current: number;
    page_next: number;
    page_count: number;
    page_lend: boolean;
}


//
export class ViewNote extends ViewBase<IViewNoteState> {
    private _data: any;
    private _last: any;

    //
    public constructor(props) {
        super(props);

        let params = queryString.parse(this.props.location.search, 
            { 
                parseBooleans: true,
                parseNumbers: false,
            });

        this._data = {
            uid: parseInt((params.note_uid || "0") as string),
            nid: params.note_nid || null,
        };
        this._last = null;

        this.state = {
            data: undefined,

            name: undefined,
            time: "",
            content: "",

            sending_commit: false,
            reply_commit: false,
            commit_count: 0,

            //
            page_current: 1,
            page_next: 1,
            page_count: 1,
            page_lend: false,
        }
    }
    
    componentDidMount() {
        this.processNoteLoad();
    }
    
    componentWillUnmount() {
    }

    async processNoteLoad() {
        //
        if(!await this.processNoteLoading()) {
            return ;
        }

        if(!await this.updatePageItems(1)) {
            return ;
        }

        let content = this._data.content || "";
        if(this._data.crypto_level == 1) {
            if(content.length > 0) {
                content = mx.crypto.base64DecodeString(content, true);
            }
        }

        // 将可能会被冒充使用html的标签全部替换为空格
        // 避免标签滥用
        content = mx.txt.text2InnerHtml(content);

        let datetime = mx.datetime2DiffString(mx.timestampS(), new Date(this._data.create_time));
        this.setState({
            data: this._data,
            //
            name: this._data.user_nick || this._data.user_nm || this._data.user_nid,
            time: datetime,
            content: content,

            //
            commit_count: this._data.commit_count,
        });
    }

    async processNoteLoading() {
        //
        let args = {
            note_uid: this._data.uid || 0,
            note_nid: this._data.nid || "",
        }

        let result = await getSingleton(server_x.ServerRequest).ViewNote(args);
        if(!result || result.code < 0) { 
            return false;
        }

        let note = result.data || {};
        G.data.note_data_load(note);

        //
        this._data = { ...note };
        return true;
    }

    async processNoteCommitsListLoading(page: number, last:any = {}) {
        //
        let note = G.data.note_view(this._data.nid);
        if(!note) {
            return false;
        }
        
        if(note.commits && note.commits.length == 0 || page < 0) { page = 0; }

        let args = {
            page: page,
            last_uid: last?.next?.uid || 0,
            last_nid: last?.next?.nid || "",

            note_uid: note.uid || 0,
            note_nid: note.nid || "",
        }

        let result = await getSingleton(server_x.ServerRequest).InitNoteCommitList(args);
        if(!result || result.code < 0) { 
            return false;
        }
 
        let commit_list = result.data || {};
        G.data.note_commits_load(note.nid, commit_list);
        return true;
    }

    // PAGE 下标从1开始
    async updatePageItems(page) {
        page = page - 1;
        if(page < 0) { page = 0; }

        //
        let commits_list = G.data.note_commits_page_view(this._data.nid, page);
        if(!commits_list) {
            if(!await this.processNoteCommitsListLoading(page, this._last)) {
                return false;
            }
            commits_list = G.data.note_commits_page_view(this._data.nid, page);
        }

        let count = G.data.note_commits_page_total(this._data.nid);

        // 20条评论计算一页
        if(count == 0) { count = 0; }
        else { count = page + 1; }

        //
        let lend = false;
        if(page + 1 >= count && !commits_list.next) {
            count = page; lend = true;
        }

        //
        this._last = commits_list;
        this._data.commits = commits_list.commits;

        //
        this.setState({
            page_current: page,
            page_count: count + 1,
            page_lend: lend,
        })
        return true;
    }

    handleDoneSendingCommit = (value) => {
        //
        this.setState({
            sending_commit: true,
        });

        if(G.data.auth_data) {
            //
            let item = G.data.note_view(this._data.nid);
            if(item) {
                this.processSendingCommit(item, value);
            }
        }

        //
        setTimeout(() => {
            this.setState({
                sending_commit: false,
                data: this.state.data,
            })

            // 如果未登录验证,发表评论需要登录
            if(!G.data.auth_data) {
                browserHistory.push("/login");
            }
        }, 1000);
    }

    // 参数：
    //      commit : 评论
    //      value  ：回复内容
    //      replyto: 回复目标
    handleDoneReplyCommit = (commit, value, replyto) => {
        //
        this.setState({
            reply_commit: true,
        });

        if(G.data.auth_data) {
            //
            let note = G.data.note_view(this.state.data.nid);
            if(note) {
                this.processReplyCommit(note, commit, value, replyto);
            }
        }

        //
        setTimeout(() => {
            this.setState({
                reply_commit: false,
                data: this.state.data,
            })

            // 如果未登录验证,发表评论需要登录
            if(!G.data.auth_data) {
                browserHistory.push("/login");
            }
        }, 1000);
    }

    handleChangedPage(event, value) {
        if(value < 0) { value = 1; }

        this.setState({ page_next: value, });

        setTimeout(async () => {
            // 向前翻页
            if(value <= this.state.page_current) {
                if(value - 1 < 0) { return ; }
            } else {
                if(this._last && !this._last.next) {
                    ShowToast("warning", "There is no more content, it can't continue to the next page.");
                    return ;
                }
            }

            await this.updatePageItems(value);

            this.setState({ data: this._data, page_current: value, });
        }, 500);
    }

    // 扩充回复
    handleExpandReplyCommits(event, item) {
        
        let last = item.replies.length <= 0 ? null : item.replies[item.replies.length - 1];
        this.processExpandReplyCommits(item, last);
    }

    // 发送评论
    processSendingCommit = async (note, value) => {
        let content = value.content;
        if(!content || content.length == 0) {
          ShowToast("warning", "You not sending null content");
          return false;
        }
        if(mx.txt.checkInvalidHTMLCharacters(content)) {
          ShowToast("warning", "Invalid characters");
          return false;
        }

        // 将内容进行一次BASE64编码
        let crypto_content = mx.crypto.base64EncodeString(content, true);
        // 客户端发送uuid, 内容，发送时间
        let data = {
            note_uid: note.uid,
            note_nid: note.nid,
            note_uuid: note.uuid,
            uuid: mx.generateUUID({ type: 2, code: 2, value: 1}),
            content: crypto_content,
            source_length: content.length,
            crypto_level: 1,
            crypto_length: crypto_content.length,
            time: mx.timestampS(),
        }
        let result = await getSingleton(server_x.ServerRequest).SendingCommit(null, data);
        if(!result || result.code <= 0) {
            return false;
        }

        let commit_data = { ...(result.data || {})};
        if(await this.processAppendCommit(commit_data)) {
            this.setState({
                commit_count: this.state.commit_count + 1,
            });
        }
        return true;
    }

    // 发送评论
    processAppendCommit = async (commit_data) => {
        //
        let date = new Date();
        commit_data.user_nid = G.data.login_data?.data?.user_nid;
        commit_data.user_nm = G.data.login_data?.data?.user_nm;
        commit_data.user_nick = G.data.login_data?.data?.user_nick;
        commit_data.create_time = `${date.toDateString()} ${mx.numberFormat(date.getHours(), 2)}:${mx.numberFormat(date.getMinutes(), 2)}`;

        // 如果不是第一页
        if(this.state.page_current > 1) {
            return false;
        }

        let data = this.state.data;
        if(!data.commits) {
            data.commits = [];
        }

        // 
        data.commits.unshift(commit_data);
        return true;
    }

    // 发送回复评论
    // 无论是回复评论，还是回复评论中的回复，都按评论回复处理
    // replyto 为null时，没有回复目标，目标默认为评论
    processReplyCommit = async (note, commit, value, replyto) => {
        let content = value.content;
        if(!content || content.length == 0) {
          ShowToast("warning", "You not sending null content");
          return false;
        }
        if(mx.txt.checkInvalidHTMLCharacters(content)) {
          ShowToast("warning", "Invalid characters");
          return false;
        }

        // 将内容进行一次BASE64编码
        let crypto_content = mx.crypto.base64EncodeString(content, true);
        // 客户端发送uuid, 内容，发送时间
        let data = {
            note_uid: note.uid,
            note_nid: note.nid,
            note_uuid: note.uuid,
            commit_uid: commit.uid,
            commit_nid: commit.nid,
            commit_uuid: commit.uuid,
            replyto_uid: replyto?.uid || 0,
            replyto_nid: replyto?.nid || undefined,
            replyto_uuid: replyto?.uuid || undefined,
            uuid: mx.generateUUID({ type: 2, code: 2, value: 2}),
            content: crypto_content,
            source_length: content.length,
            crypto_level: 1,
            crypto_length: crypto_content.length,
            time: mx.timestampS(),
        }

        let result = await getSingleton(server_x.ServerRequest).ReplyCommit(null, data);
        if(!result || result.code <= 0) {
            return false;
        }

        let reply_commit_data = { ...(result.data || {})};
        return await this.processAppendReplyCommit(reply_commit_data);
    }

    // 发送评论回复
    processAppendReplyCommit = async (reply_commit_data) => {
        //
        let date = new Date();
        reply_commit_data.user_nid = G.data.login_data?.data?.user_nid;
        reply_commit_data.user_nm = G.data.login_data?.data?.user_nm;
        reply_commit_data.user_nick = G.data.login_data?.data?.user_nick;
        reply_commit_data.create_time = `${date.toDateString()} ${mx.numberFormat(date.getHours(), 2)}:${mx.numberFormat(date.getMinutes(), 2)}`;

        let data = this.state.data;
        for(let i = 0; data.commits && i < data.commits.length; i ++) {
            let v = data.commits[i];
            if(v.nid == reply_commit_data.commit_nid) {
                v.replies = v.replies || [];
                v.replies.unshift(reply_commit_data);
                break;
            }
        }

        //
        return true;
    }

    //
    async processExpandReplyCommits(commit, last) {
        last = last || {};
        if(!last) {
            last = {}
        } else {
            last = {
                next: {
                    uid: last.uid,
                    nid: last.nid,
                }
            }
        }

        if(! await this.processNoteReplyCommitsListLoading(0, commit, last)) {
            return false;
        }

        let item = G.data.note_commits_pageitem_view(commit.note_nid, commit.nid);
        if(!item) {
            return false;
        }

        let data = this.state.data;
        for(let i = 0; data.commits && i < data.commits.length; i ++) {
            let v = data.commits[i];
            if(v.nid == commit.nid) {
                v.replies = item;
                break;
            }
        }
        
        this.setState({data: data, });
        return true;
    }   

    async processNoteReplyCommitsListLoading(page: number, commit:any, last:any = {}) {
        //
        let args = {
            page: page, //由于未分页，PAGE没有作用
            expand: 1,  //扩展
            last_uid: last?.next?.uid || 0,
            last_nid: last?.next?.nid || "",

            note_uid: commit.note_uid || 0,
            note_nid: commit.note_nid || "",

            commit_uid: commit.uid || 0,
            commit_nid: commit.nid || "",
        }

        let result = await getSingleton(server_x.ServerRequest).InitNoteReplyCommitList(args);
        if(!result || result.code < 0) { 
            return false;
        }

        let reply_list = result.data || {};
        G.data.note_replycommits_load(commit.note_nid, commit.nid, reply_list);
        return true;
    }

    render() {
        return (
        <React.Fragment>
        <Box component="div">
            { !this.state.data ? (
            <Typography variant="body1" color="primary">
            Loading note data (NID: {this._data.nid}) ...
            </Typography> 
            ) : (
            <Container>
            <Card style ={{ backgroundColor: "#fefefe", marginTop: 10 }}>
                <CardHeader
                    style = {{
                        color: "black",
                        textAlign: "left",
                        backgroundColor: "#f8f8f8",
                        margin: 0
                    }}
                    avatar={ 
                        <Avatar style={{
                            color: "#f5f5f5",
                            textAlign: "center",
                            backgroundColor: "gray",
                        }}>
                            {this.state.name && this.state.name.length > 0 && this.state.name[0]}
                        </Avatar> 
                    }
                    action={
                        <Box component="div" style={{
                            margin: 0,
                        }}>
                            <Tooltip title={`Views ${this.state.data.view_count}`} placement="top">
                            <Typography variant="caption" component="span" style={{
                                color: "gray", marginRight: 5, alignItems: "center"
                            }}>
                                <IconVisibility />{`${this.state.data.view_count == 0 ? "" : `${mx.number2String(this.state.data.view_count)} views`}`}
                            </Typography>
                            </Tooltip>
                            {this.state.data.is_editor && (<IconButton><MoreVertIcon /></IconButton>)}
                        </Box>
                    }
                    title={
                        <Box component="div">
                            <Typography variant="subtitle2" component="span" style={{
                                fontWeight: "bold",
                            }}>
                            {this.state.name}
                            </Typography>
                            <Typography variant="caption" component="span" style={{
                                marginLeft: 5,
                            }}>
                            (MID:{this.state.data.user_nid})
                            </Typography>
                            {this.state.data.topping > 0 && (<TurnedInIcon fontSize="small" style={{ 
                                color: "darkorange",
                                marginLeft: 5
                            }}/>)}
                            {this.state.data.private_level > 0 && (
                            <Typography variant="caption" component="span" style={{
                                marginLeft: 5, color: "#1E90FF",
                            }}>
                                (Visible to yourself)
                            </Typography>)}
                        </Box>
                    }
                />
                <CardContent style={{
                    color: "black",
                    backgroundColor: "#fefefe",
                    textAlign: "left",
                }}>
                    <Box style = {{
                        color: "darkgray"
                    }}>
                        {this.state.data.tags.length > 0 && <LocalOfferIcon fontSize="small" style={{marginRight:2, marginTop: 5}}/> }
                        {this.state.data.tags.length > 0 && this.state.data.tags.map((v, i) => {
                                return (
                                    <span key={i}>
                                        <Chip label={v} size="small" color="primary"
                                            style={{ marginLeft: 2 }} />
                                    </span>);
                            })
                        }
                    </Box>
                    <Box style={{ marginTop: 10 }}>
                        <Divider variant="middle" style={{ marginBottom: 10 }} />
                        <Typography variant="body1" dangerouslySetInnerHTML={ {__html:this.state.content} }>
                        </Typography>
                    </Box>
                </CardContent>
                <CardActions disableSpacing style={{
                    backgroundColor: "#f8f8f8"
                }}>
                    <Box>
                        <Typography variant="caption">
                        Post {this.state.time}
                        </Typography>
                    </Box>
                </CardActions>
            </Card>
            <Box style={{ backgroundColor: "#fefefe", marginTop: 10 }}>
                <Paper elevation={0} style ={{ backgroundColor: "#fefefe", }}>
                    <ButtonGroup variant="contained" color="secondary">
                        <Button aria-label="share" startIcon={<ShareIcon />} disabled>
                         Shares {mx.number2String(this.state.data.shared_count) }
                        </Button>
                        <Button aria-label="favorites" startIcon={<FavoriteIcon />} disabled>
                         Favorites {mx.number2String(this.state.data.favorites_count) }
                        </Button>
                        <Button aria-label="like" startIcon={<ThumbUpIcon />}>
                         Likes {mx.number2String(this.state.data.like_count) }
                        </Button>
                    </ButtonGroup> 
                </Paper>
            </Box>
            <Box style={{ 
                backgroundColor: "#fefefe", 
                marginTop: 10,
                alignItems: "center", }}>
                <Box style={{ display:"flex", justifyContent: "center", marginTop:10 }}> 
                    <Paper elevation={1} style ={{ 
                        backgroundColor: "#f8f8f8",
                        paddingTop: 10,
                        position: "relative",
                        width: "60vw",
                    }}>
                        { !this.state.sending_commit ?
                        (<NoteCommit style={{ marginTop:10 }} ondone={(t) => { this.handleDoneSendingCommit(t) }} disabled/>
                        ) : (
                        <Box component="div" style={{
                        textAlign: "center", height: 64, marginTop: 10,
                        }}>
                            <CircularProgress color="secondary" />
                        </Box>
                        )}
                    </Paper>
                </Box>
                <Box component="div" style={{
                    textAlign: "right",
                        }}> 
                    <Typography variant="caption" component="span">
                        All commits {this.state.commit_count > 0 && `(${mx.number2String(this.state.commit_count)})`}
                    </Typography>
                    <Divider />
                </Box>
                <Box component="div" style={{
                    textAlign: "left",
                }}>
                    { this.state.data.commits && this.state.data.commits.length > 0 &&
                    <Box component="div">
                        { this.state.data.commits.map((v, i) =>{
                            return (
                                <Container key={v.nid}>
                                    <NoteCommitItem data={v} 
                                        replyingcount= {PAGE_NOTE_REPLY_MAXNUM}
                                        replying={this.state.reply_commit} 
                                        onreplydone={(t, to) => { this.handleDoneReplyCommit(v, t, to); }}
                                        onclickedviewreplies={(e) => { this.handleExpandReplyCommits(e, v); }} />
                                </Container>
                            )
                        })}
                    </Box>}
                    {this.state.page_lend && (
                    <Box component="div" style={{
                        backgroundColor: "lightgray",
                        textAlign: "center",
                        marginTop: 10,
                        borderTop: "1px solid gray"
                    }}>
                        <Typography variant="overline">
                        Not More Notes
                        </Typography>
                    </Box>)}
                    <Pagination  count={ this.state.page_count } page={ this.state.page_current } 
                    color="secondary" shape="rounded" showFirstButton
                    style={{ display:"flex", justifyContent: "center", marginTop:10 }}
                    onChange={(e, n) => { this.handleChangedPage(e, n) }}/>
                    <Divider />
                </Box>
            </Box>
            </Container>)}
        </Box>
        </React.Fragment>);
    }
}