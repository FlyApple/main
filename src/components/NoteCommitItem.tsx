import React from 'react';
import G from '../utils/global';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';


//
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import CloseIcon from '@material-ui/icons/Close';
import FaceIcon from '@material-ui/icons/Face';
import PublishIcon from '@material-ui/icons/Publish';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ArrowRightOutlinedIcon from '@material-ui/icons/ArrowRightOutlined';

import mx from '../utils';
import {ShowToast} from './MessageBox';
import {XNoteReplyCommit} from './NoteReplyCommit'
import {NoteCommitReplyItem} from './NoteCommitReplyItem'
import {routeItems, browserHistory} from '../routes/index';

//
interface INoteCommitItemProps extends React.ComponentProps<any> {
    replyingcount?: number;
    replying?: boolean;
    onreplydone?: Function;
    onclickedviewreplies?: Function;
}

interface INoteCommitItemState {
    name: string | undefined;
    data: any;

    //
    content: string;
    time: string;
    //
    reply_show: boolean;
    reply_doing?: boolean;
    reply_tolist?: Array<any>;
}

//
export class NoteCommitItem extends React.Component<INoteCommitItemProps, INoteCommitItemState> {

    //
    constructor(props) {
        super(props);
        
        //
        this.state = {
            name: undefined,
            //
            data: this.props.data,
            
            //
            content: "",
            time: "",
            //
            reply_show: false,
            reply_doing: this.props.replying,
            reply_tolist: undefined,
        }
    }

    componentDidMount() {
        
        this.processInit();
    }

    componentWillUnmount() {
    }

    handleInputTextArea(event) {
    }

    //
    inputTextArea(value:string) {
        this.setState({content:value || ""});
    }

    handleClickedReply(event) {
        this.setState({
            reply_show: !this.state.reply_show,
        });
    }

    handleClosedReply(event) {
        //
        this.setState({
          reply_show: false,
        });
    }

    handleClickedViewAllReplies(event) {
        if(this.props.onclickedviewreplies) {
            this.props.onclickedviewreplies();
        }
    }

    // 回复时间函数
    // value   ： 内容
    // replyto ： 目标
    handleDoneReply = (value, replyto = null) => {
        if(this.props.onreplydone) {
            this.props.onreplydone(value, replyto);
        }
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

        //
        if (this.state.data.replies) {
            let reply_tolist = new Array<any>();
            this.state.data.replies.forEach((v) => {
                if (v.replyto_uid > 0) {
                    let reply = G.data.notes_replycommit_item_get(this.state.data.note_nid, this.state.data.nid, v.replyto_nid);
                    reply_tolist.push(reply || null);
                } else {
                    reply_tolist.push(null);
                }
            });

            // 限制显示数量
            if(this.props.replyingcount && this.props.replyingcount > 0) {
                if(reply_tolist.length > this.props.replyingcount) {
                    reply_tolist = reply_tolist.slice(0, this.props.replyingcount);
                }
                this.setState({reply_tolist: reply_tolist})
            }
        }

        //
        this.setState({
            name: this.state.data.user_nick || this.state.data.user_nm || this.state.data.user_nid,
            content: content,
            time: datetime,
        })
    }



    render() {
        return (<React.Fragment>
            <Container style={{...this.props.style}}>
            <Paper elevation={0} style={{
                backgroundColor: "#f0f0f0",
                marginTop: 3,
                marginBottom: 3,
                minHeight: 64,
                borderBottom: "1px solid #c5c5c5",
            }}>
                <Container component="div" style={{
                    position: "relative", top:10, left: 0
                }}>
                    <Box component="div" style={{
                        position: "absolute", top:3, left:10
                    }}>
                        <Avatar style={{
                            color: "#f5f5f5",
                            textAlign: "center",
                            backgroundColor: "gray",
                        }}>{this.state.name && this.state.name.length > 0 && this.state.name[0]}</Avatar>
                    </Box>
                    <Box component="div" style={{
                        marginLeft: 48, marginBottom: 24,
                    }}>
                        <Typography variant="subtitle2" component="span" style={{
                            fontWeight: "bold",
                        }}>{this.state.name} :</Typography>
                        <Typography variant="body2" component="span" dangerouslySetInnerHTML={ {__html:this.state.content} }>
                        </Typography>
                    </Box>
                </Container>
                <Container component="div" style={{
                    position: "relative", bottom: 5, left: 0, minHeight:24,
                }}>
                    <Box component="div" style={{ 
                        position: "absolute", top:5, left:72
                    }}>
                        <Typography variant="caption" display="block" style={{ color:"gray" }}>
                        {this.state.time}
                        </Typography>
                    </Box>
                    <Box component="div" style={{
                        position: "absolute", top:0, right: 10
                    }}>
                        <Button size="small" startIcon={<ThumbUpIcon />}>
                        {this.state.data.like_count > 0 && mx.number2String(this.state.data.like_count)}
                        </Button>
                        <Button color="secondary" size="small"
                            onClick={(e) => { this.handleClickedReply(e); }}
                        >
                        Reply
                        </Button>
                    </Box>
                </Container>
                <Container component="div">
                    <Divider variant="fullWidth"/>
                    { this.state.data.replies && this.state.data.replies.length > 0 &&
                    <Box component="div">
                        { this.state.data.replies.map((v, i) =>{
                            return (
                                <Container key={v.nid}>
                                    <NoteCommitReplyItem data={v} 
                                     reply={ !this.state.reply_tolist || !this.state.reply_tolist[i] ? this.state.data : this.state.reply_tolist[i]}
                                     onreplydone={(t) => { this.handleDoneReply(t, v); }}/>
                                </Container>
                            )
                        })}
                    </Box>}
                    { (this.state.data.reply_count > 0 && this.state.data.replies && this.state.data.reply_count > this.state.data.replies.length) &&
                    <Box component="div" style={{
                            textAlign: "left", 
                        }}> 
                        <Button color="secondary" size="small" endIcon={ <ArrowRightOutlinedIcon /> }
                            onClick={(e) => { this.handleClickedViewAllReplies(e) }}
                        >
                            View all replies{this.state.data.reply_count > 0 && `(${this.state.data.reply_count})`}
                        </Button>
                    </Box>}
                </Container>
            </Paper>
            <XNoteReplyCommit open={this.state.reply_show}
                commit= { this.state.data }
                ondone={(t) => { this.handleDoneReply(t, null) }}
                onclosed={(e) => { this.handleClosedReply(e) }}
            />
            </Container>
        </React.Fragment>);
    }
}