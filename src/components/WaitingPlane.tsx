
import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { Theme, createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import { ThemeDark } from '../theme/ThemeDark';
import mx from '../utils';


interface XWaitingPlaneState {
    show: boolean;
    show_progress: boolean| undefined;
    show_text: boolean| undefined;
    show_time: boolean;
    progress: number;
    time: number;
    remain: number;
    text: string;
}

interface XWaitingPlaneProps {
    open: boolean;
    showProgress?: boolean;
    showText?: string;
    showTime?: number;
    onclosed?: Function;
}

export class XWaitingPlane extends React.Component<XWaitingPlaneProps, XWaitingPlaneState> {
    private _timeID:any| null;
    private _timeTick:number;

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            show_progress: this.props.showProgress,
            show_text: this.props.showText == undefined ? false : this.props.showText.length > 0,
            show_time: this.props.showTime == undefined ? false : this.props.showTime > 0,
            time: this.props.showTime == undefined ? -1 : this.props.showTime,
            remain: 0,
            progress: 0,
            text: this.props.showText || "",
        }

        this._timeID = null;
        this._timeTick = 0;
    }

    componentDidMount() {
        this.setState({
            progress: 100,
            remain: this.state.time > 0 ? this.state.time : 0,
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
    // componentWillReceiveProps(nextProps:Readonly<XWaitingPlaneProps>) {
    UNSAFE_componentWillReceiveProps(nextProps:Readonly<XWaitingPlaneProps>) {
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
        console.info("show waiting plane");

        if(this.state.show_time) {
            this._timeTick = mx.timestampMS();
            this._timeID = setInterval(() => {
                let vt = mx.timestampMS() - this._timeTick;
                this._timeTick = mx.timestampMS();
                let vtm = this.state.remain - vt;
                if(vtm < 0) {
                    vtm = 0;
                }
    
                if(this.state.remain > 0) {
                    this.setState({
                        remain: vtm,
                        progress: vtm / this.state.time * 100
                     });
                }
    
                if(vtm == 0) {
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

        if(!this.state.show) {
            return ;
        }
        
        this.setState({
            show: false,
            progress: 100,
            remain: this.state.time > 0 ? this.state.time : 0,
        });

        //
        console.info(`close waiting plane ${timeout ? "(timeout)" : ""}`);
        if(this.props.onclosed) {
            this.props.onclosed(timeout ? true : false);
        }
    }
    render() {
        return (
            <div> 
                <Backdrop open={this.state.show} style={{
                    color: '#FFFFFF',
                    zIndex:ThemeDark.zIndex.drawer + 1
                }}>
                    <Grid container direction="column"
                        justify="center" alignItems="center" spacing={2}
                    >
                        <Grid item>
                            {(this.state.show_progress == undefined || this.state.show_progress) && <CircularProgress color="inherit" />}
                        </Grid>
                        <Grid item>
                            {this.state.show_text &&  
                            <Typography variant="body2" align="center">
                            {this.state.text}
                            </Typography>}
                        </Grid>
                        <Grid item style={{
                            width:"10rem"
                        }}>
                            {this.state.show_progress && <LinearProgress variant="determinate" value= {this.state.progress}/>}
                        </Grid>
                        <Grid item>
                            {this.state.time > 0 &&  
                            <Typography variant="body2" color="primary">
                            Times {mx.numberFormat(this.state.remain / 1000, -1, 2)} second.
                            </Typography>}
                        </Grid>
                    </Grid>
                </Backdrop>
            </div>
        );
    }
}
