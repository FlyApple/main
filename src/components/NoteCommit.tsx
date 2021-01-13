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
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
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
import {ShowToast} from '../components/MessageBox';
import {IconMagnet} from '../icons';

//
interface INoteCommitProps extends React.ComponentProps<any> {
    ondone?: Function;
}

interface INoteCommitState {
    //
    content: string;

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
export class NoteCommit extends React.Component<INoteCommitProps, INoteCommitState> {

    //
    private _ref_textarea: React.RefObject<HTMLTextAreaElement>| undefined;
    private _textarea_maxlen = 120;

    constructor(props) {
        super(props);

        this.state = {
            //
            content: "",

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

    handleClickedDone(event) {
        if(this.props.ondone) {
            this.props.ondone({
                content: this.state.content,
            });
        }

        this.setState({
            content: "",
            link_show: false,
            link_value: "",
            magnet_value: "",
        });

        let elem = this._ref_textarea?.current || undefined;
        if(elem) { 
            elem.value = ""; 
        }
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
        return (<React.Fragment>
        <Container style={ this.props.style }>
        <Grid container direction="column" justify="center" alignItems="stretch" spacing={0}>
            <Grid item xs={11}>
                <TextareaAutosize ref={this._ref_textarea}
                    placeholder="What's the commit ..."
                    maxLength={this._textarea_maxlen + 100}
                    rowsMin = {1} rowsMax = {2}
                    onInput={ (e) =>{ this.handleInputTextArea(e)} }
                    style={{
                        border:"solid 1px #cdcdcd",
                        outline: "none",
                        width: "100%", minWidth: "100%", maxWidth: "100%", minHeight: 24,
                        overflow: "hidden"
                    }}
                />
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
                <Box component="div" style ={{
                    position: "relative", height: 32,
                }}>
                    <IconButton aria-label="emoticon" style={{
                        position: "absolute", bottom: 5, left: 10
                    }} disabled><InsertEmoticonIcon fontSize="small"/></IconButton>

                    <IconButton aria-label="link"
                        onClick={(e) => {this.handleClickedLink(e)}}
                        style={{
                            position: "absolute", bottom: 5, left: 48 + 10
                    }}><InsertLinkIcon fontSize="small"/></IconButton>
                    
                    <IconButton aria-label="magnet"
                        onClick={(e) => {this.handleClickedMagnet(e)}}
                        style={{
                            position: "absolute", bottom: 5, left: 96 + 10
                    }}><IconMagnet fontSize="small"/></IconButton>

                    <Button variant="contained" color="secondary"
                        endIcon={<PublishIcon />} size="small"
                        style={{
                            position: "absolute",
                            right:5, bottom: 5
                        }}
                        onClick={(e) => {this.handleClickedDone(e)}}
                        disabled={this.state.content.length == 0}
                    >
                        Done
                    </Button>
                </Box>
            </Grid>
        </Grid>
        <Popper open={this.state.link_show} anchorEl={this.state.link_anchor}
                placement="top-start" >
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
        </Popper>
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
        </Container>
        </React.Fragment>);
    }
}