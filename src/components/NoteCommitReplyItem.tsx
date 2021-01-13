import React from 'react';

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

import mx from '../utils';
import {ShowToast} from '../components/MessageBox';
import {XNoteReplyCommit} from './NoteReplyCommit'


//
interface INoteCommitReplyItemProps extends React.ComponentProps<any> {
    reply?:any;                 //评论
    onreplydone?: Function;
}

interface INoteCommitReplyItemState {
    name: string | undefined;
    data: any;

    //
    content: string;
    time: string;
    //
    reply_show: boolean;
    reply_name: string | undefined;
}

//
export class NoteCommitReplyItem extends React.Component<INoteCommitReplyItemProps, INoteCommitReplyItemState> {

    constructor(props) {
        super(props);

        this.state = {
            name: undefined,
            data: this.props.data,
            
            //
            content: "",
            time: "",
            //
            reply_show: false,
            reply_name: undefined,
        }
    }

    componentDidMount() {

        this.processInit();
    }

    componentWillUnmount() {
    }

    handleClickedReply(event, item) {
        this.setState({
            reply_show: !this.state.reply_show,
        });
    }

    handleClosedReply = (event) => {
        //
        this.setState({
          reply_show: false,
        });
    }

    handleDoneReply = (value) => {
        if(this.props.onreplydone) {
            this.props.onreplydone(value);
        }
    }

    handleInputTextArea(event) {
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
            reply_name: this.props.reply.user_nick || this.props.reply.user_nm || this.props.reply.user_nid,
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
                borderLeft: "3px solid #c5c5c5",
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
                        }}>
                            {this.state.name && this.state.name.length > 0 && this.state.name[0]}
                        </Avatar>
                    </Box>
                    <Box component="div" style={{
                        marginLeft: 48, marginBottom: 24,
                    }}>
                        <Typography variant="subtitle2" component="span" style={{
                            fontWeight: "bold",
                        }}>{this.state.reply_name ? `${this.state.name} ReplyTo ${this.state.reply_name} :` : `${this.state.name} :`}</Typography>
                        <Typography variant="body2" component="span" dangerouslySetInnerHTML={ {__html:this.state.content} }>
                        </Typography>
                    </Box>
                </Container>
                <Container component="div" style={{
                    position: "relative", bottom: 5, left: 0, minHeight:24
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
                            onClick={(e) => { this.handleClickedReply(e, null); }}
                        >
                        Reply
                        </Button>
                    </Box>
                </Container>
            </Paper>
            <XNoteReplyCommit open={this.state.reply_show}
                commit= { this.state.data }
                ondone={(t) => { this.handleDoneReply(t) }}
                onclosed={(e) => { this.handleClosedReply(e) }}
            />
            </Container>
        </React.Fragment>);
    }
}