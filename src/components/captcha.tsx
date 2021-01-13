import React from 'react';
import ReactDOM from 'react-dom';

import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Grid from '@material-ui/core/Grid';

import mx from '../utils/index'
import * as network_x from '../utils/Network';
import {ShowToast} from '../components/MessageBox';

//
type ImageCaptchaType = "image-svg"|"image";

interface ImageCaptchaProps {
    type?:ImageCaptchaType;
    source:string;
}

interface ImageCaptchaState {
    id:string;
    type:ImageCaptchaType;
    source:string;
}

//
export class ImageCaptcha extends React.Component<ImageCaptchaProps, ImageCaptchaState> {
    constructor(props) {
        super(props);

        this.state = {
            id: `id-captcha-${mx.timestampMS()}`,
            type: this.props.type || "image",
            source: this.props.source,
        };
    }

    componentDidMount() {
        this.loadImage();
        this.setState({source: mx.joinURLArgs(this.props.source, `t=${mx.timestampMS()}`)});
    }

    async loadImage() {
        
        //
        let image_root = document.getElementById(this.state.id);
        if(!image_root) {
            return ;
        }

        let image:HTMLElement| undefined = undefined;
        image_root.childNodes.forEach((v) => {
            if(v.nodeType == v.ELEMENT_NODE) {
                let elem = v as HTMLElement;
                if(elem.id.indexOf(`${this.state.id}`) >= 0) {
                    image = elem;
                }
            }
        });

        if(this.props.type == "image") {
            if(!image) {
                image = document.createElement('img');
                image_root.appendChild(image);
            }
            image.id = `${this.state.id}-image`;
            image.setAttribute("src", this.state.source);
            return ;
        } else if(this.props.type == "image-svg") {
            if(!image) {
                image = document.createElement('div');
                image_root.appendChild(image);
            }
            image.id = `${this.state.id}-image`;

            let nx = new network_x.NetworkA("get", this.state.source, "text");
            let result = await nx.request(``);
            if(!result) {
                ShowToast("error", "Request auth code unknow error!", "Error");
                return ;
            }

            try {
                let result_data = JSON.parse(nx.data);
                if(result_data  && result_data.code < 0) {
                    ShowToast("error", `Request auth code : ${result_data.message}`, "Error");
                    return ;
                }
            }catch{
                // nothing
            }
            
            ReactDOM.render(<div dangerouslySetInnerHTML={{__html:nx.data}} />, image);
        }
    }

    handleClickedRefreshAuthCode(event) {
        this.loadImage();
        this.setState({source: mx.joinURLArgs(this.props.source, `t=${mx.timestampMS()}`)});
    }

    render() {
        return (
        <Container>
            <Grid container direction="row" 
                    justify="flex-start" alignItems="center" spacing={1}>
                <Grid item id={this.state.id} xs={12} sm={6}>
                </Grid> 
                <Grid item xs={12} sm={3}>
                    <IconButton 
                        onClick={ (event) =>{ this.handleClickedRefreshAuthCode(event); } }
                    >
                        <AutorenewIcon fontSize="small"/>
                    </IconButton>
                </Grid>    
            </Grid>
        </Container>);
    }
}