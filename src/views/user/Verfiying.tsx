//
import React from 'react';
import queryString from 'query-string';

import G from '../../utils/global';
import {getSingleton} from '../../utils/singleton';
import * as server_x from '../../utils/ServerRequest';
import mx from '../../utils';
import config from '../../config';
import {ImageCaptcha} from '../../components/captcha';
import {ShowToast} from '../../components/MessageBox';
import {XWaitingPlane} from '../../components/WaitingPlane';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

//
//http://x/verifying?active=true
interface IVerifyingState {
    status: number;
    active: boolean;
    verifying: boolean;
    token_id?: string;
    token_hash?: string;

    //
    completed_value: number;
    open_waiting_progress: boolean;

    //
    value_captcha: string;
    value_captcha_check_error: boolean;
    value_captcha_helper_text: string;
}
export class ViewVerifying extends React.Component<any, IVerifyingState> {

    //
    private _form:any;
    private _captcha_url:string;

    private _completed_labels = ["Submit", "Completed"];

    //
    public constructor(props) {
        super(props);
        let params = queryString.parse(this.props.location.search, 
            { 
                parseBooleans: true,
                parseNumbers: false,
            });

        let param_data = {
            active: (params.active || false) as boolean,
            verifying: false,
            token_id: (params.token_id || "") as string,
            token_hash: (params.token_hash || "") as string,
        };

        if(this.props.location.state) {
            param_data.active = this.props.location.state.active || false;
            param_data.verifying = this.props.location.state.verifying || false;
            param_data.token_id = "";
            param_data.token_hash = "";
        }

        param_data.token_id = param_data.token_id.trim();
        param_data.token_hash = param_data.token_hash.trim().toUpperCase();

        let status = G.data.auth_data && G.data.auth_data.auth_time_expired > 0 ? 1 : 0;
        this.state = {
            status: status,
            active: param_data.active,
            verifying: param_data.verifying,
            token_id: param_data.token_id,
            token_hash: param_data.token_hash,

            //
            completed_value: 0,
            open_waiting_progress: false,

            //
            value_captcha: "",
            value_captcha_check_error: false,
            value_captcha_helper_text: "Please enter the text shown in the image.",
        };
        
        this._captcha_url = `${config.server}${config.server.endsWith("\/")?"":"\/"}auth/code`;

        //
        this._form = {};
    }

    componentDidMount() {
    }
    
    componentWillUnmount() {
    }
    handleClosedWaitingProgress(timeout) {
        if(timeout) {
            this.setState({open_waiting_progress:false});
        }
    }
    handleChangedCaptcha(event) {
        let value = event.target.value;
        if(value.length >= mx.defs.CAPTCHA_AUTH_MAXLEN) {
            this.setState({
                value_captcha_check_error: true,
                value_captcha_helper_text: "Captcha too length"
            });
            return ;
        }
        this.setState({
            value_captcha: value
        });

        value = value.trim();
        this.setState({
            value_captcha_check_error: false,
            value_captcha_helper_text: "Captcha is ok"
        });

        this._form.captcha = value;
    }

    handleClickedSubmit(event) {
        this._form.resend = false;
        this._form.active = false;

        //
        if(this.state.verifying && this.state.status > 0) {
            this._form.resend = true;
        } else if(this.state.token_id && this.state.token_id.length > 0 &&
            this.state.token_hash && this.state.token_hash.length > 0) {
            
            if(/^[1-9][0-9]{4,16}$/g.test(this.state.token_id) === false ||
            /^[0-9a-zA-Z]{16,64}$/g.test(this.state.token_hash) === false) {
                ShowToast("error", "Authentication information is unavailable");
                return ;
            }
            this._form.active = this.state.active;
        } else {
            ShowToast("error", "Authentication information is unavailable");
            return ;
        }

        if(!this._form.captcha || this._form.captcha.length == 0) {
            ShowToast("error", "You must type in the required items: captcha");
            return ;
        }

        //
        setTimeout(() => {
            this.processVerifying();
        }, 500);
    }

    async processVerifying() {
        console.info("Verifying");
        this.setState({open_waiting_progress:true});


        let data = {
            type: this._form.active ? 1 : (this._form.resend ? 2 : 0),
            token_id: this.state.token_id,
            token_hash: this.state.token_hash,
            auth_code: this._form.captcha
        }

        let verifying_data;
        let result = await getSingleton(server_x.ServerRequest).Verifying(null, data);
        if(result && result.code > 0) {
            verifying_data = result.data;
        }
        console.info(result);
        setTimeout(() => {
            this.setState({open_waiting_progress:false});

            if(verifying_data) {
                
                if(data.type == 2) {
                    ShowToast("success", `Verification information has been resend, please check (${result.data.auth_name}) within 24 hours.`);
                } else if(data.type == 1) {
                    ShowToast("success", `Verification (${result.data.auth_name}) completed.`);
                    this.setState({completed_value:1});
                } else {
                    ShowToast("success", `Verification completed.`);
                    this.setState({completed_value:1});
                }
            }
        }, 1000);
    }

    renderCaptcha() {
        return (
        <Grid container justify="center" direction="row" 
            alignItems="center" spacing={1}>
            <Grid item xs={12} sm={4}>
                <FormControl required size="small" color="secondary" variant="standard"
                    style={{
                     width:140
                    }}
                    error={this.state.value_captcha_check_error}
                >
                    <InputLabel htmlFor="id-CAPTCHA">CAPTCHA</InputLabel>
                    <Input id="id-CAPTCHA"
                        placeholder=""
                        value={this.state.value_captcha}
                        onChange={(e)=>this.handleChangedCaptcha(e)}
                    />
                    <FormHelperText id="id-CAPTCHA-helper-text">{this.state.value_captcha_helper_text}</FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
                <ImageCaptcha type="image-svg" source={this._captcha_url}/>
            </Grid>
        </Grid>
        );
    }

    renderSubmit() {
        return (
            <Box>
                {this.renderCaptcha()}
                <Divider variant="fullWidth" />
                <Grid container justify="flex-start" direction="row" 
                    alignItems="center" spacing={1} style={{marginTop:"1rem"}}>
                    <Grid item xs={12}>
                        <Button variant="contained" color="secondary" 
                            onClick={(e) => { this.handleClickedSubmit(e) }}
                            style={{
                                width:180,
                                marginTop: 5,
                                marginBottom: 10
                            }}>
                            SUBMIT
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        ) 
    }
    renderStep0() { 
        if(this.state.status > 0 && this.state.verifying) {
            return (
                <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                    <Grid item xs>
                        <Typography variant="body1" color="secondary">
                        Please check the mail within 24 hours
                        </Typography> 
                    </Grid>
                    <Grid item xs>
                    {this.renderSubmit()}
                    </Grid>
                </Grid>
            );
        } else if(this.state.active) {
            return (
                <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                    <Grid item xs>
                        <Typography variant="body1">
                        You must authenticate email address and activate account.
                        </Typography>
                    </Grid>
                    <Grid item xs>
                    { (this.state.token_id && this.state.token_id.length > 0 &&
                      this.state.token_hash && this.state.token_hash.length > 0) ? 
                        (
                            this.renderSubmit()
                        ) : (
                        <Typography variant="body1" color="error">
                        Authentication information is unavailable
                        </Typography>
                    )}
                    </Grid>
                </Grid>
            );
        }
        return (
            <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                <Grid item xs>
                    <Typography variant="body1">
                    You must authenticate email address.
                    </Typography>
                </Grid>
                <Grid item xs>
                    { (this.state.token_id && this.state.token_id.length > 0 &&
                      this.state.token_hash && this.state.token_hash.length > 0) ? 
                        (
                            this.renderSubmit()
                        ) : (
                        <Typography variant="body1" color="error">
                        Authentication information is unavailable
                        </Typography>
                    )}
                </Grid>
            </Grid>
        );
    }
    renderCompleted() {
        return (
            <Grid container direction="column" justify="center" alignItems="center" spacing={2}>
                <Grid item xs>
                    <Typography variant="body1" style={{
                        color:"green"
                    }}>
                    The certification was successfully completed
                    </Typography>
                </Grid>
            </Grid>
        );
    }
    render() {
        return (
        <React.Fragment>
            <Container>
                <Grid container direction="column" justify="center" alignItems="center" spacing={2} 
                    style={{
                        backgroundColor:"#f8f8f8",
                    }}> 
                    <Grid item xs>
                        <Typography variant="h5" align="center">
                            { this.state.status > 0 && this.state.verifying ? "Send new verifying to email address" :
                              (this.state.active ? "Verifying email and activate account" :
                              ("Verifying your email address"))
                            }
                        </Typography>
                    </Grid>
                    <Grid item xs>
                        <Stepper activeStep={this.state.completed_value} alternativeLabel style={{
                            backgroundColor:"#f8f8f8",
                            height:48
                        }}>
                        {this._completed_labels.map((L) => (
                            <Step key={L}>
                                <StepLabel>{L}</StepLabel>
                            </Step>
                        ))}                  
                        </Stepper>
                        {this.state.completed_value == 0 && this.renderStep0() }
                        {this.state.completed_value == 1 && this.renderCompleted() }
                    </Grid>
                </Grid>
                <XWaitingPlane open={this.state.open_waiting_progress} showTime={5*1000} onclosed={(timeout)=>{this.handleClosedWaitingProgress(timeout)}}/>
            </Container>
        </React.Fragment>);
    }
}