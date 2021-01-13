
import React from 'react';


import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';

import { ThemeDark } from '../theme/ThemeDark';
import mx from '../utils';


interface XLoadingPlaneState {
    show: boolean;
    progress: number;
    text: string;
}

interface XLoadingPlaneProps {
    open: boolean;
    time?: number;
    text?: string;
    onclosed?: Function;
}

export class XLoadingPlane extends React.Component<XLoadingPlaneProps, XLoadingPlaneState> {
    private _timeID:any| null;
    private _timeTick:number;

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            progress: 0,
            text: this.props.text || "",
        }

        this._timeID = null;
        this._timeTick = 0;
    }

    componentDidMount() {
        this.setState({
            progress: 0,
        });
    }

    componentWillUnmount() {
        if(this._timeID) {
            clearInterval(this._timeID);
            this._timeID = null;
        }
    }

    // Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps 
    // to suppress this warning in non-strict mode. In React 17.x, 
    // only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, 
    // you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.
    // componentWillReceiveProps(nextProps:Readonly<XLoadingPlaneProps>) {
    UNSAFE_componentWillReceiveProps(nextProps:Readonly<XLoadingPlaneProps>) {
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
        console.info("show loading plane");

        this._timeTick = mx.timestampMS();
        if(this.props.time && this.props.time > 0) {
            let time = this.props.time;
            let remain = this.props.time;
            this._timeID = setInterval(() => {
                let vt = mx.timestampMS() - this._timeTick;
                this._timeTick = mx.timestampMS();
                remain -= vt;
                if(remain < 0) {
                    remain = 0;
                }
    
                if(remain > 0) {
                    this.setState({
                        progress: (1- (remain / time)) * 100
                    });
                }
    
                if(remain == 0) {
                    this.hidden(true);
                }
            }, 100);
        }

        this.setState({
            show: true
        });
    }

    hidden(timeout?:boolean) {
        if(this._timeID) {
            clearInterval(this._timeID);
            this._timeID = null;
        }
        this._timeTick = 0;

        if(!this.state.show) {
            return ;
        }

        
        this.setState({
            show: false,
            progress: 100,
        });

        //
        console.info(`close loading plane ${timeout ? "(timeout)" : ""}`);
        if(this.props.onclosed) {
            this.props.onclosed(timeout ? true : false);
        }
    }
    render() {
        return (
            <React.Fragment>
            <Modal open={this.state.show} disableAutoFocus disableEnforceFocus
                style={{ display:"flex", alignItems: "center", justifyContent: "center"}}
                onClose={(e) => { }}>
                <Box style={{ textAlign: "center", }}>
                    <Typography variant="subtitle1" style={{ color: "white" }}>
                        {this.state.text}
                    </Typography>
                    <Box style={{ width: 180, minWidth: 100 }}>
                        <LinearProgress variant="buffer" color="secondary" 
                            value= {this.state.progress}
                            valueBuffer={this.state.progress + Math.random() * 10}/>
                    </Box>
                </Box>
            </Modal>
            </React.Fragment>
        );
    }
}
