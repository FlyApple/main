import React from 'react';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
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
interface XNoteWritingProps {
    open: boolean;
    title: string;
    onclosed?: Function;
    ondone?: Function;
}

interface XNoteWritingState {
    show: boolean;

    //
    content: string;
    tags: Array<string>;

    //
    tag_show: boolean;
    tag_anchor: HTMLElement| undefined;
    tag_value: string;

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
export class XNoteWriting extends React.Component<XNoteWritingProps, XNoteWritingState> {

    private _ref_count = 0;

    private _ref_textarea: React.RefObject<HTMLTextAreaElement>| undefined;
    private _textarea_maxlen = 500;

    private _tags_maxnum = mx.defs.TAGS_MAXNUM;

    constructor(props) {
        super(props);

        this.state = {
            show: false,

            //
            content: "",
            tags: new Array<string>(),
            //
            tag_show: false,
            tag_anchor: undefined,
            tag_value: "",
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
        if(this.state.tags.length > this._tags_maxnum) {
            this.state.tags.length = this._tags_maxnum;
            this.setState({
                tags: this.state.tags
            })
        }
    }

    componentWillUnmount() {
    }

    // Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps 
    // to suppress this warning in non-strict mode. In React 17.x, 
    // only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, 
    // you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.
    // componentWillReceiveProps(nextProps:Readonly<XNoteWritingProps>) {
    UNSAFE_componentWillReceiveProps(nextProps:Readonly<XNoteWritingProps>) {
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
        console.info("show modal dialog");

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
        console.info(`close modal dialog (${flag})`);
        if(flag > 0) {
            if(this.props.ondone) {
                this.props.ondone({
                    content: this.state.content,
                    tags: this.state.tags.length == 0 ? undefined : this.state.tags.join(";"),
                });
            }
        }
        if(this.props.onclosed) {
            this.props.onclosed();
        }
    }

    handleClosing(flag = 0) {
        // 点击空白区域不关闭窗口
        if(flag < 0) {
            return;
        }
        this.hidden(flag);
    }

    handleInputTextArea(event) {
        let elem = this._ref_textarea?.current || undefined;
        if(elem) {
            this.inputTextArea(elem.value);
        }
    }

    // TAGS
    addTag(value) {
        let tags = this.state.tags;
        if(tags.length >= this._tags_maxnum) {
            return false;
        }
        if(tags.includes(value)) {
            return false;
        }

        tags.push(value);
        this.setState({tags: tags});
        return true;
    }
    deleteTag(index, value) {
        let tags = this.state.tags;
        if(index < 0 || index >= tags.length) {
            return false;
        }

        tags.splice(index, 1);
        this.setState({tags: tags});
        return true;
    }
    handleDeleteTag(event, index, value) {
        
        this.deleteTag(index, value);
    }
    handleClickedAddTag(event) {
        this.setState({
            tag_show: !this.state.tag_show,
            tag_anchor: event.target as HTMLElement,
        });
    }
    handleClosedAddTag(event) {
        this.setState({
            tag_show: !this.state.tag_show,
            tag_anchor: undefined,
        });
    }
    handleSubmitAddTag(event) {
        this.setState({
            tag_show: !this.state.tag_show,
            tag_anchor: undefined,
        });

        //
        let value = (this.state.tag_value || "").trim();
        if(value.length >= mx.defs.TAGS_MAXLEN) {
            ShowToast("error", "Character too long")
            return ;
        }

        if(mx.checkSafetyCharacters(value, 20)) {
            ShowToast("error", "You not use unsafety characters")
            return ;
        }

        if(/[\d]{1,12}/g.test(value)) {
            ShowToast("error", "You not use too number")
            return ;
        }
        this.addTag(value);
    }
    handleChangedTag(event) {
        let value = (event.target.value || "");
        this.setState({
            tag_value: value,
        });
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
            <Dialog open={this.state.show} onClose={(e) => { this.handleClosing(-1) }}>
                <DialogTitle disableTypography 
                    style={{ margin: 0, backgroundColor:"white" }}
                >
                    <Grid container direction="row" justify="flex-start" alignItems="stretch" spacing={0} style={{
                        height:28
                    }}>
                        <Grid item xs={10}>
                            <Typography variant="h6">{this.props.title}</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <IconButton aria-label="close" style={{
                                position: "absolute",
                                right:3, top:3,
                                }}
                                onClick={(e) => { this.handleClosing(0) }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent style={{ backgroundColor:"white", maxWidth:500 }} dividers>
                    <Grid container direction="column" justify="center" alignItems="stretch" spacing={0}>
                        <Grid item xs={12}>
                            <textarea ref={this._ref_textarea} 
                            placeholder="What you want to say ..."
                            onInput={ (e) =>{ this.handleInputTextArea(e)} }
                            maxLength={this._textarea_maxlen + 100}
                            style={{
                                border:"solid 1px #cdcdcd",
                                minWidth: 480,
                                maxWidth: 480,
                                minHeight: 100,
                                outline: "none",
                            }}>

                            </textarea>
                        </Grid>
                        <Grid item xs={12}>
                            <Box component="div" style={{
                                height: 20,
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
                            <Box component="div" style={{
                                textAlign: "left"
                            }}>
                                <LocalOfferIcon fontSize="small" style={{marginRight:2}}/>
                                {this.state.tags.length > 0 && this.state.tags.map((v, i) => {
                                    return (
                                        <span key={i}>
                                            <Chip label={v} variant="outlined" size="small" color="primary"
                                                style={{ marginLeft: 2 }}
                                                onDelete={(e) =>{ this.handleDeleteTag(e, i, v); }}/>
                                        </span>);
                                })}
                                {this.state.tags.length < 5 && (
                                <Tooltip title={`Add an tag, max characters : ${this._tags_maxnum}`} placement="top">
                                <IconButton aria-label="add-tags"
                                    style={{
                                        margin: 0
                                    }}
                                    onClick={(e) => { this.handleClickedAddTag(e)  }}
                                >
                                    <AddCircleOutlineOutlinedIcon color="secondary" fontSize="small"/>
                                </IconButton >
                                </Tooltip>)}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                            <Box component="span">
                                <Tooltip title="Add an emoji" placement="top">
                                <IconButton aria-label="emoticon"><InsertEmoticonIcon color="secondary" fontSize="small"/></IconButton>
                                </Tooltip>
                                <IconButton aria-label="photo" disabled><InsertPhotoIcon fontSize="small"/></IconButton>
                                <Tooltip title="Add an link" placement="top">
                                <IconButton aria-label="link"
                                    onClick={(e) => {this.handleClickedLink(e)}}
                                ><InsertLinkIcon color="secondary" fontSize="small"/></IconButton>
                                </Tooltip>
                                <Tooltip title="Add an magnet link" placement="top">
                                <IconButton aria-label="magnet"
                                    onClick={(e) => {this.handleClickedMagnet(e)}}
                                ><IconMagnet color="secondary" fontSize="small"/></IconButton>
                                </Tooltip>
                            </Box>
                            <Box component="span">
                                <Button variant="contained" color="secondary"
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
                            <Popover open={this.state.tag_show} anchorEl={this.state.tag_anchor}
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
                                    <Box component="span" style={{
                                        margin:0,
                                        marginLeft: 5,
                                        marginRight: 5,
                                        height:48
                                    }}>
                                    <TextField size="small"
                                        placeholder="TAG"
                                        style={{
                                            width: 200,
                                            minWidth: 200,
                                        }}
                                        value={this.state.tag_value}
                                        onChange={(e) => { this.handleChangedTag(e); }}
                                    />
                                    <IconButton aria-label="tag-check"
                                        onClick={(e) => { this.handleSubmitAddTag(e)  }}
                                    >
                                        <CheckIcon color="secondary" fontSize="small"/>
                                    </IconButton >
                                    <IconButton aria-label="tag-close"
                                        onClick={(e) => { this.handleClosedAddTag(e) }}
                                    >
                                        <CloseIcon color="secondary" fontSize="small"/>
                                    </IconButton >
                                    </Box>
                                </Paper>
                            </Popover>
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
                </DialogContent>
            </Dialog>
        );
    }
}