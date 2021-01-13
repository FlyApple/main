//
import React from 'react';
import G from '../utils/global';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import CircularProgress from '@material-ui/core/CircularProgress';

//
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ChatIcon from '@material-ui/icons/Chat';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TurnedInIcon from '@material-ui/icons/TurnedIn';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import ArrowRightOutlinedIcon from '@material-ui/icons/ArrowRightOutlined';
import ArrowDropUpOutlinedIcon from '@material-ui/icons/ArrowDropUpOutlined';
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined';

import mx from '../utils';
import {getSingleton} from '../utils/singleton';
import * as server_x from '../utils/ServerRequest';
import {routeItems, browserHistory} from '../routes/index';

import {IconVisibility} from '../icons';

import {NoteCommit} from './NoteCommit';
import {NoteCommitItem} from './NoteCommitItem';
import {ShowToast} from '../components/MessageBox';

import './CardItem.css';

//
const PAGE_COMMIT_ITEMS_MAXNUM = 5;
const PAGE_REPLY_ITEMS_MAXNUM = 2;

//
interface INoteItemProps {
    data: any;
    onclickedheader?: Function;
    onclickedcontent?: Function;
    onclickedviewcommits?: Function;
    onclickedviewreplies?: Function;
};
interface INoteItemState {
    flag: string | undefined;
    name: string | undefined;
    data: any;
    content: string;
    time: string;
    expand: boolean;
    sending_commit: boolean;
    reply_commit: boolean;
};

//
export class NoteItem extends React.Component<INoteItemProps, INoteItemState> {

    //
    public constructor(props) {
        super(props);

        this.state = {
            flag: undefined,
            name: undefined,
            data: this.props.data,
            content: "",
            time: "",
            expand: false,
            sending_commit: false,
            reply_commit: false,
        }
    }
    
    componentDidMount() {
        this.processInit();
    }
    
    componentWillUnmount() {
    }

    async processInit() {
        let datetime = mx.datetime2DiffString(mx.timestampS(), new Date(this.state.data.create_time));

        let content = this.state.data.content || "";
        if(this.state.data.crypto_level == 1) {
            if(content.length > 0) {
                content = mx.crypto.base64DecodeString(content, true);
            }
        }

        // 将可能会被冒充使用html的标签全部替换为空格
        // 避免标签滥用
        content = mx.txt.text2InnerHtml(content);

        this.setState({
            name: this.state.data.user_nick || this.state.data.user_nm || this.state.data.user_nid,
            content: content,
            time: datetime,
        })
    }


    handleClickedHeader(event) {
        if(this.props.onclickedheader) {
            this.props.onclickedheader();
        }
    }

    handleClickedContent(event) {
        if(this.props.onclickedcontent) {
            this.props.onclickedcontent();
        }
    }

    handleClickedCommit(event) {
        let expand = !this.state.expand;
        this.setState({
            expand: expand,
        });

        // 只有第一次点开记录一次查看，如果连续点开将不记录
        if(expand) {
            let item = G.data.notes_item_view(this.state.data.nid);
            if(item && item.view_total == 1) {
                this.processViewNote(item);
            }
        }
    }
    
    handleClickedViewAllCommits(event) {
        if(this.props.onclickedviewcommits) {
            this.props.onclickedviewcommits();
        }
    }

    handleClickedViewAllReplies(event, item) {
        if(this.props.onclickedviewreplies) {
            this.props.onclickedviewreplies(item);
        }
    }

    //
    handleDoneSendingCommit = (value) => {
        //
        this.setState({
            sending_commit: true,
        });

        if(G.data.auth_data) {
            //
            let item = G.data.notes_item_view(this.state.data.nid);
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
        }, 500);
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
            let item = G.data.notes_item_view(this.state.data.nid);
            if(item) {
                this.processReplyCommit(item, commit, value, replyto);
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

    processViewNote = async (item) => {
        let args = {
            note_uid: item.uid || 0,
            note_nid: item.nid || "",
        }
        let result = await getSingleton(server_x.ServerRequest).ViewNoteItem(args);
        if(!result || result.code < 0) { 
            return false;
        }
        let data = result.data || {};
        if(data.note_nid != this.state.data.nid) {
            return false;
        }

        console.info(data);
        this.processInitCommitList(data);
        return true;
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
        return await this.processAppendCommit(commit_data);
    }

    // 发送回复评论
    // 无论是回复评论，还是回复评论中的回复，都按评论回复处理
    // replyto 为null时，没有回复目标，目标默认为评论
    processReplyCommit = async (note, commit, value, replyto) => {
        let content = value.content;
        if(!content || content.length == 0) {
          ShowToast("warning", "You not sending null content");
          return false
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


    // 初始化评论列表
    processInitCommitList = async (commit_list) => {

        let note_data = this.state.data;

        let temp_data = {
            commits: commit_list.commits,
        };

        note_data = {...note_data, ...temp_data};

        G.data.notes_item_mset(note_data.nid, temp_data);
        this.setState({ data: note_data, });
    }

    // 发送评论
    processAppendCommit = async (commit_data) => {

        let date = new Date();
        commit_data.user_nid = G.data.login_data?.data?.user_nid;
        commit_data.user_nm = G.data.login_data?.data?.user_nm;
        commit_data.user_nick = G.data.login_data?.data?.user_nick;
        commit_data.create_time = `${date.toDateString()} ${mx.numberFormat(date.getHours(), 2)}:${mx.numberFormat(date.getMinutes(), 2)}`;
        
        let data = this.state.data;
        if(!data.commits) {
            data.commits = [];
        }

        // 需要延迟更新
        data.commits.unshift(commit_data);
        return true;
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

    render() {
        return (<React.Fragment>
            <Card style ={{ backgroundColor: "#fefefe", marginTop: 10 }}>
                <CardHeader
                    style = {{
                        color: "black",
                        textAlign: "left",
                        backgroundColor: "lightgray",
                        margin: 0
                    }}
                    onDoubleClick={ (e) => { this.handleClickedHeader(e); }}
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
                                <IconVisibility />{`${mx.number2String(this.state.data.view_count)}${this.state.data.view_count > 0 ? " views" : ""}` }
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
                    subheader={
                        <Box>
                            <Typography variant="caption">
                            Post {this.state.time}
                            </Typography>
                        </Box>
                    }
                />
                <CardContent style={{
                    color: "black",
                    backgroundColor: "#fefefe",
                    textAlign: "left",
                }}>
                    <Box onDoubleClick={ (e) => { this.handleClickedContent(e); }}>
                        <Typography variant="body2" dangerouslySetInnerHTML={ {__html:this.state.content} }>
                        </Typography>
                    </Box>
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
                </CardContent>
                <Divider variant="fullWidth"/>
                <CardActions disableSpacing style={{
                    backgroundColor: "#f5f5f5"
                }}>
                    <Grid container direction="row" justify="flex-end" alignItems="center">
                    <Button aria-label="share" startIcon={<ShareIcon />} disabled>
                        {this.state.data.shared_count == 0 ? `` : (this.state.data.shared_count < 1000 ?
                         (`${this.state.data.shared_count}`) : (`+${this.state.data.shared_count}`))}
                    </Button>
                    <Button aria-label="favorites" startIcon={<FavoriteIcon />} disabled>
                        {this.state.data.favorites_count == 0 ? `` : (this.state.data.favorites_count< 1000 ?
                         (`${this.state.data.favorites_count}`) : (`+${this.state.data.favorites_count}`))}
                    </Button>
                    <Button aria-label="like" startIcon={<ThumbUpIcon />}>
                        {this.state.data.like_count == 0 ? `` : (this.state.data.like_count< 1000 ?
                         (`${this.state.data.like_count}`) : (`+${this.state.data.like_count}`))}
                    </Button>
                    <Button aria-label="commit" 
                        startIcon={ <ChatIcon color= {!this.state.expand ? "primary": "secondary"} />}
                        onClick={(e) => { this.handleClickedCommit(e) }}>
                        {mx.number2String(this.state.data.commit_count) }
                        {!this.state.expand ? <ArrowDropUpOutlinedIcon /> : 
                        <ArrowDropDownOutlinedIcon color= {!this.state.expand ? "primary": "secondary"} />}
                    </Button>
                    </Grid>
                </CardActions>
                {this.state.expand && 
                <Box component="div" display={this.state.expand ? "inline" : "none"}>
                    <Divider variant="fullWidth"/>
                    <Container style={{
                        color: "black",
                        backgroundColor: "#fefefe",
                        textAlign: "left",
                        position: "relative",
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
                        { this.state.data.commits && this.state.data.commits.length > 0 && 
                        <Box component="div">
                            { this.state.data.commits.map((v, i) =>{
                                return (
                                    <Container key={v.nid}>
                                        <NoteCommitItem data={v} 
                                         replyingcount= {PAGE_REPLY_ITEMS_MAXNUM}
                                         replying={this.state.reply_commit} 
                                         onreplydone={(t, to) => { this.handleDoneReplyCommit(v, t, to); }}
                                         onclickedviewreplies={ (e) => { this.handleClickedViewAllReplies(e, v); }}/>
                                    </Container>
                                )
                            })}
                        </Box>}
                        { this.state.data.commits && this.state.data.commits.length > 0 && this.state.data.commit_count > PAGE_COMMIT_ITEMS_MAXNUM &&
                        <Box component="div" style={{
                            textAlign: "center",
                        }}> 
                            <Button color="secondary" size="small" endIcon={ <ArrowRightOutlinedIcon /> }
                                onClick={(e) => { this.handleClickedViewAllCommits(e) }}
                            >
                                View all commits {this.state.data.commit_count > 0 && `(${this.state.data.commit_count})`}
                            </Button>
                        </Box> }
                    </Container>
                </Box>}
            </Card>
        </React.Fragment>
        );
    }
};