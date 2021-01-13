import React from 'react';

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
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Modal from '@material-ui/core/Modal';

//
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import CloseIcon from '@material-ui/icons/Close';
import FaceIcon from '@material-ui/icons/Face';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import InsertLinkIcon from '@material-ui/icons/InsertLink';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import PublishIcon from '@material-ui/icons/Publish';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';

import mx from '../utils';
import {ShowToast} from './MessageBox';
import {IconMagnet} from '../icons';



//
interface XNoteReplyCommitProps {
    open: boolean;
    commit?: any;
    onclosed?: Function;
    ondone?: Function;
}

interface XNoteReplyCommitState {
    show: boolean;

    //
    content: string;
    commit_name?: string;
    commit_content?: string;
    commit_time?: string;

    //
    link_show: boolean;
    link_anchor: HTMLElement| undefined;
    link_value: string;

    //
    magnet_show: boolean;
    magnet_anchor: HTMLElement| undefined;
    magnet_value: string;
}

//
export class XNoteReplyCommit extends React.Component<XNoteReplyCommitProps, XNoteReplyCommitState> {

    private _ref_count = 0;

    private _ref_textarea: React.RefObject<HTMLTextAreaElement>| undefined;
    private _textarea_maxlen = 120;

    constructor(props) {
        super(props);

        this.state = {
            show: false,

            //
            content: "",
            commit_name: undefined,
            commit_content: undefined,
            commit_time: undefined,

            //
            link_show: false,
            link_anchor: undefined,
            link_value: "",
            //
            magnet_show: false,
            magnet_anchor: undefined,
            magnet_value: "",
        }

        this._ref_textarea = React.createRef<HTMLTextAreaElement>();
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    // Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps 
    // to suppress this warning in non-strict mode. In React 17.x, 
    // only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, 
    // you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.
    // componentWillReceiveProps(nextProps:Readonly<XNoteReplyCommitProps>) {
    UNSAFE_componentWillReceiveProps(nextProps:Readonly<XNoteReplyCommitProps>) {
        if(nextProps.commit) {
            let datetime = mx.datetime2DiffString(mx.timestampS(), new Date(nextProps.commit.create_time));

            let content = nextProps.commit.content || "";
            if(nextProps.commit.crypto_level == 1) {
                if(content.length > 0) {
                    content = mx.crypto.base64DecodeString(content, true);
                }
            }

            // 将可能会被冒充使用html的标签全部替换为空格
            // 避免标签滥用
            content = mx.txt.text2InnerHtml(content);
    
            this.setState({
                commit_name: nextProps.commit.user_nick || nextProps.commit.user_nm || nextProps.commit.user_nid,
                commit_content: content,
                commit_time: datetime,
            })
        }

        //
        if(nextProps.open) {
            this.shown();
        } else {
            this.hidden();
        }
    }
    shown() {
        if(this.state.show) {
            return ;
        }
        console.info("show modal reply commit");

        this.setState({
            show: true,
            content: "",
            link_value: "",
            magnet_value: "",
        });
        this._ref_count = 1;
    }

    hidden(flag = 0) {
        this._ref_count --;
        if(!this.state.show || this._ref_count < 0) {
            return ;
        }

        this.setState({
            show: false,
        });

        //
        console.info(`close modal reply commit (${flag})`);
        if(flag > 0) {
            if(this.props.ondone) {
                this.props.ondone({
                    content: this.state.content,
                });
            }
        }
        if(this.props.onclosed) {
            this.props.onclosed();
        }
    }

    handleClosing(flag = 0) {
        this.hidden(flag);
    }

    handleInputTextArea(event) {
        let elem = this._ref_textarea?.current || undefined;
        if(elem) {
            this.inputTextArea(elem.value);
        }
    }


    // Link
    handleClickedLink(event) {
        this.setState({
            link_show: !this.state.link_show,
            link_anchor: event.target as HTMLElement,
        });
    }
    handleChangedLink(event) {
        let value = event.target.value;
        this.setState({
            link_value: value,
        });
    }
    handleClosedLink(event) {
        this.setState({
            link_show: !this.state.link_show,
            link_anchor: undefined,
        });
    }
    handleSubmitLink(event) {
        this.setState({
            link_show: !this.state.link_show,
            link_anchor: undefined,
        });

        //
        let link = this.state.link_value || "#";
        this.appendTextArea(`[URL:${link}]`);
    }

    // Magnet Link
    handleClickedMagnet(event) {
        this.setState({
            magnet_show: !this.state.magnet_show,
            magnet_anchor: event.target as HTMLElement,
        });
    }
    handleChangedMagnet(event) {
        let value = event.target.value;
        this.setState({
            magnet_value: value,
        });
    }
    handleClosedMagnet(event) {
        this.setState({
            magnet_show: !this.state.magnet_show,
            magnet_anchor: undefined,
        });
    }
    handleSubmitMagnet(event) {
        this.setState({
            magnet_show: !this.state.magnet_show,
            magnet_anchor: undefined,
        });

        //
        let link = this.state.magnet_value || "";
        if(link.length > 0) {
            this.appendTextArea(`[MNL:${link}]`);
        }
    }


    //
    inputTextArea(value:string) {
        this.setState({content:value || ""});
    }

    appendTextArea(text:string) {
        let elem = this._ref_textarea?.current || undefined;
        if(!elem) { return -1; }

        if(text && text.length > 0) {
            elem.value = `${elem.value}${text}`;
            // 手动调用输入
            this.inputTextArea(elem.value);
            return text.length;
        }
        return 0;
    }

    render() {
        return (
            <Modal open={this.state.show} disableAutoFocus disableEnforceFocus
                style={{ display:"flex", alignItems: "center", justifyContent: "center"}}
                onClose={(e) => { this.handleClosing(-1) }} >
                <Paper elevation={2} style={{ backgroundColor: "white", maxWidth: 500, position: "relative" }}>
                    <Grid container direction="column" justify="center" alignItems="stretch" spacing={0}>
                        {(this.state.commit_name && this.state.commit_content) &&
                        <Grid item xs={12}>
                            <Box component="div" style={{
                                marginTop:10, marginLeft: 10, marginRight: 10, marginBottom: 10,
                                backgroundColor: "lightgray",
                                borderBottom: "1px solid gray",
                                }}>
                                <Typography variant="subtitle2" component="span" style={{
                                    fontWeight: "bold",
                                }}>ReplyTo {this.state.commit_name} :</Typography>
                                <Typography variant="body2" component="span" dangerouslySetInnerHTML={ {__html:this.state.commit_content} }>
                                </Typography>
                            </Box>
                        </Grid>
                        }
                        <Grid item xs={12}>
                            <textarea ref={this._ref_textarea} 
                            placeholder="What you want to say ..."
                            onInput={ (e) =>{ this.handleInputTextArea(e)} }
                            maxLength={this._textarea_maxlen + 100}
                            style={{
                                border:"solid 1px #cdcdcd",
                                minWidth: 450, maxWidth: 450,
                                minHeight: 64, maxHeight: 100,
                                marginTop: 5,
                                marginLeft: 10, marginRight: 10,
                                outline: "none",
                            }}>

                            </textarea>
                        </Grid>
                        <Grid item xs={12}>
                            <Box component="div" style={{
                                height: 20,
                                marginRight: 10,
                                textAlign: "right"
                            }}>
                                {this._textarea_maxlen >= this.state.content.length ? (
                                    <Typography variant="caption" display="block">
                                    {`${this.state.content.length} / ${this._textarea_maxlen}`}
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" display="block" color="error">
                                    {`${this.state.content.length} / ${this._textarea_maxlen}`}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box component="span">
                                <IconButton aria-label="emoticon" disabled><InsertEmoticonIcon fontSize="small"/></IconButton>
                                <Tooltip title="Add an link" placement="top">
                                <IconButton aria-label="link"
                                    onClick={(e) => {this.handleClickedLink(e)}}
                                ><InsertLinkIcon fontSize="small"/></IconButton>
                                </Tooltip>
                                <Tooltip title="Add an magnet link" placement="top">
                                <IconButton aria-label="magnet"
                                    onClick={(e) => {this.handleClickedMagnet(e)}}
                                ><IconMagnet fontSize="small"/></IconButton>
                                </Tooltip>
                            </Box>
                            <Box component="span">
                                <Button variant="contained" color="secondary" size="small"
                                    endIcon={<PublishIcon />}
                                    style={{
                                        position: "absolute",
                                        right:10, bottom: 10
                                    }}
                                    onClick={(e) => {this.handleClosing(1)}}
                                    disabled={this.state.content.length == 0}
                                >
                                    Done
                                </Button>
                            </Box>
                            <Popover open={this.state.link_show} anchorEl={this.state.link_anchor}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                            >
                                <Paper elevation={2} style={{ margin:0, backgroundColor:"white" }}>
                                    <Box style={{
                                        margin:0,
                                        marginLeft: 5,
                                        marginRight: 5,
                                        height:64
                                    }}>
                                    <Typography variant="caption" display="block">
                                        Please type an http or https link:
                                    </Typography>
                                    <TextField variant="outlined" size="small"
                                        placeholder="http://"
                                        style={{
                                            width: 300,
                                            minWidth: 300,
                                        }}
                                        value={this.state.link_value}
                                        onChange={(e) => { this.handleChangedLink(e); }}
                                    />
                                    <IconButton aria-label="link-check"
                                        onClick={(e) => { this.handleSubmitLink(e)  }}
                                    >
                                        <CheckIcon color="secondary" fontSize="small"/>
                                    </IconButton >
                                    <IconButton aria-label="link-close"
                                        onClick={(e) => { this.handleClosedLink(e) }}
                                    >
                                        <CloseIcon color="secondary" fontSize="small"/>
                                    </IconButton >
                                    </Box>
                                </Paper>
                            </Popover>
                            <Popover open={this.state.magnet_show} anchorEl={this.state.magnet_anchor}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <Paper elevation={2} style={{ margin:0, backgroundColor:"white" }}>
                                    <Box style={{
                                        margin:0,
                                        marginLeft: 5,
                                        marginRight: 5,
                                    }}>
                                    <Typography variant="caption" display="block">
                                        Please type an magnet link:
                                    </Typography>
                                    <TextField variant="outlined" size="small" multiline 
                                        placeholder="magnet:?xt=urn:btih:x"
                                        rows= {3}
                                        style={{
                                            width: 300,
                                            minWidth: 300,
                                        }}
                                        value={this.state.magnet_value}
                                        onChange={(e) => { this.handleChangedMagnet(e); }}
                                    />
                                    </Box>
                                    <Box style={{
                                        margin:0,
                                        marginLeft: 5,
                                        marginRight: 5,
                                        textAlign:"right"
                                    }}>
                                    <IconButton aria-label="magnet-check"
                                        onClick={(e) => { this.handleSubmitMagnet(e)  }}
                                    >
                                        <CheckIcon color="secondary" fontSize="small"/>
                                    </IconButton >
                                    <IconButton aria-label="magnet-close"
                                        onClick={(e) => { this.handleClosedMagnet(e) }}
                                    >
                                        <CloseIcon color="secondary" fontSize="small"/>
                                    </IconButton >
                                    </Box>
                                </Paper>
                            </Popover>
                        </Grid>
                    </Grid>
                </Paper>
            </Modal>
        );
    }
}