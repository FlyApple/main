
import React from 'react';
import ReactDOM from 'react-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';



//
type ToastBoxType = "info"|"warning"|"error"|"success";
interface IToastBoxProps {
    type:ToastBoxType;
    show:boolean;
    title?:string;
    message?:string;
    duration?: number;
    vertical?: "top"|"bottom";
    horizontal?: "left"|"center"|"right";
    on_closed?: Function;
    on_unmount?: Function;
};

interface IToastBoxState {
    show:boolean;
    duration: number;
    vertical: "top"|"bottom";
    horizontal: "left"|"center"|"right";
};

//
export class ToastBox extends React.Component<IToastBoxProps, IToastBoxState> {
    constructor(props) {
        super(props);

        this.state = {
            show:this.props.show,
            duration: this.props.duration || 5 * 1000,
            vertical:this.props.vertical || "top",
            horizontal:this.props.horizontal || "center",
        }
    }

    componentWillUnmount() {

        if(this.props.on_unmount) {
            this.props.on_unmount();
        }
    }

    handleClose(event) {
        this.setState({
             show: false
        });

        if(this.props.on_closed) {
            this.props.on_closed(event);
        }
    }

    renderAlert(props: AlertProps) {
        return (
            <MuiAlert elevation={6} variant="filled" {...props} />
        );
    }

    render() {
        return (
            <Snackbar open={this.state.show} autoHideDuration={this.state.duration} 
                onClose={(event)=>{ this.handleClose(event)} }  
                anchorOrigin={{ vertical:this.state.vertical, horizontal:this.state.horizontal }} >
                <this.renderAlert onClose={(event)=>{ this.handleClose(event)} }  severity={this.props.type}>
                {this.props.title && this.props.title}
                {this.props.title && <br />}
                {this.props.message && this.props.message}
                </this.renderAlert>
            </Snackbar>
        );
    }
}

//
export function ShowToast(type:ToastBoxType, text:string, title?:string, timeout:number = 5 * 1000) {
    let box_content = document.createElement('div');
    box_content.id = `id-toast-box-content`;
    let box = document.getElementById("id-toast-box");
    if(box) {
        box.appendChild(box_content);
        document.body.appendChild(box);
    } else {
        box = document.createElement('div');
        box.id = `id-toast-box`;
        box.appendChild(box_content);
        document.body.appendChild(box);
    }

    let component = React.createElement(ToastBox, 
        {
            type:type,
            show:true,
            title:title,
            message:text,
            duration:timeout,
            on_closed: (event) => {
                ReactDOM.unmountComponentAtNode(box_content);
            },
            on_unmount: (event) => {
                //console.info("unmount");
                let box = document.getElementById("id-toast-box");
                box && box.removeChild(box_content);
            }
        });
    ReactDOM.render(component, box_content);
}