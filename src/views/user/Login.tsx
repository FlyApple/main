//
import React from 'react';

import G from '../../utils/global';
import {getSingleton} from '../../utils/singleton';
import * as server_x from '../../utils/ServerRequest';
import mx from '../../utils';
import config from '../../config';
import {ShowToast} from '../../components/MessageBox';
import {ImageCaptcha} from '../../components/captcha';
import {XWaitingPlane} from '../../components/WaitingPlane';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';

import {routeItems, browserHistory} from '../../routes/index';
import { IViewState, ViewBase } from '../Base';
import './User.css';


//
interface ILoginState extends IViewState {
    show_password: boolean;
    open_waiting_progress: boolean;

    //
    value_account: string;
    value_account_check_error: boolean;
    value_account_helper_text: string;

    //
    value_password: string;
    value_password_check_error: boolean;
    value_password_helper_text: string;

    //
    value_captcha: string;
    value_captcha_check_error: boolean;
    value_captcha_helper_text: string;
};

//
export class ViewLogin extends ViewBase<ILoginState> {
    //
    private _form:any;
    private _captcha_url:string;

    //
    public constructor(props) {
        super(props);

        
        this.state = {
            data: undefined,
            
            //
            show_password: false,
            open_waiting_progress: false,
            //
            value_account: "",
            value_account_check_error: false,
            value_account_helper_text: "Tne account is MID, Account Name, Email Address, Phone Number.",

            //
            value_password: "",
            value_password_check_error: false,
            value_password_helper_text: "Password 6-15 characters",

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

    handleClickedShowPassword(event) {
        this.setState({
            show_password:!this.state.show_password
          });
    }

    handleChangedAccount(event) {
        let value = event.target.value;
        this.setState({
            value_account: value
        });

        
        let account = {
            number:"",
            name:"",
            email:"",
            phone:"",
            current:"",
            type_index:-1,
            type_name: ""
        };

        value = value.trim();
        let rv:any|string|boolean = mx.checkEmail(value);
        if(rv) {
            account.type_index = mx.defs.ACCOUNT_TYPE_EMAIL;
            account.type_name = mx.defs.ACCOUNT_TYPENAME_EMAIL;
            account.email = (rv as string).trim(); 
            account.current = account.email;
        } else if((rv = mx.checkPhone(value))) {
            account.type_index = mx.defs.ACCOUNT_TYPE_PHONE;
            account.type_name = mx.defs.ACCOUNT_TYPENAME_PHONE;
            account.phone = rv.number; 
            account.current = account.phone;
        } else if((rv = mx.checkAccountNumber(value, 5, mx.defs.ACCOUNT_NUMBER_MAXLEN))) {
            account.type_index = mx.defs.ACCOUNT_TYPE_MID;
            account.type_name = mx.defs.ACCOUNT_TYPENAME_MID;
            account.number = (rv as string).trim(); 
            account.current = account.number;
        } else if((rv = mx.checkAccountName(value, 6, mx.defs.ACCOUNT_NAME_MAXLEN))) {
            account.type_index = mx.defs.ACCOUNT_TYPE_NAME;
            account.type_name = mx.defs.ACCOUNT_TYPENAME_NAME;
            account.name = (rv as string).trim(); 
            account.current = account.name;
        } else {
            this.setState({
                value_account_check_error: true,
                value_account_helper_text: "Account invalid"
            });
            return;
        }

        this.setState({
            value_account_check_error: false,
            value_account_helper_text: `Account (${account.type_name}) valid`
        });

        this._form.account = account;
    }

    handleChangedPassword(event) {
        let value = event.target.value;
        if(value.length >= mx.defs.PASSWORD_MAXLEN) {
            this.setState({
                value_password_check_error: true,
                value_password_helper_text: "Password too length"
            });
            return ;
        }
        this.setState({
            value_password: value
        });

        value = value.trim();
        if(value.length < 6) { 
            this.setState({
                value_password_check_error: true,
                value_password_helper_text: "Password too short"
            });
            return ;
        }

        this.setState({
            value_password_check_error: false,
            value_password_helper_text: "Password is ok"
        });

        this._form.password = value;
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
    handleClosedWaitingProgress(timeout) {
        this.setState({open_waiting_progress:false});
    }
    handleClickedSubmit(event) {

        if(!this._form.account || this._form.account.current == 0 || this._form.account.type_index < 0) {
            ShowToast("error", "You must type in the required items: account");
            this.setState({
                value_account_check_error: true,
                value_account_helper_text: "Please type an account"
            });
            return ;
        }
        
        if(!this.state.value_password || this.state.value_password.length == 0 ||
            !this._form.password || this._form.password.length == 0) {
            ShowToast("error", "You must type in the required items: password");
            this.setState({
                value_password_check_error: true,
                value_password_helper_text: "Please type in your password"
            });
            return ;
        }

        this.setState({
            value_password_check_error: false,
            value_password_helper_text: "Password is ok",
        });

        if(!this._form.captcha || this._form.captcha.length == 0) {
            ShowToast("error", "You must type in the required items: captcha");
            return ;
        }

        //
        setTimeout(() => {
            this.processSignIn();
        }, 500);
    }

    async processSignIn() {
        console.info("Login");
        this.setState({open_waiting_progress:true});

        // 0: 用户名注册(不支持), 1: 邮箱注册(支持), 2:手机注册(不支持)
        let data = {
            type_index: this._form.account.type_index,
            type_name: this._form.account.type_name,
            account: this._form.account.current || "",
            hash_password: mx.crypto.md5HashString(this._form.password),
            auth_code: this._form.captcha
        }

        let result = await getSingleton(server_x.ServerRequest).Login(null, data);

        G.data.login_status(true, result, "/home", (code) => {
            this.setState({open_waiting_progress:false});
        });
    }


    render() {
        return (
        <React.Fragment>
            <Container>
                <form className="Login-Plane" autoComplete="off">
                    <div className="Login-Title">
                        <div>
                            <Typography variant="h4" align="center">
                            Login Account
                            </Typography>
                        </div>
                        <div className="Login-Title Light">
                            <Typography variant="body2">
                            
                            </Typography>
                        </div>
                    </div>
                    <Divider variant="fullWidth" />
                    <Grid container justify="flex-start" direction="column" 
                            alignItems="center" spacing={1} style={{marginTop:"1rem"}}>
                        <Grid item xs={12}>
                            <FormControl required size="small" color="secondary" variant="standard"
                                style={{
                                    width:350
                                }}
                                error={this.state.value_account_check_error}
                            >
                                <InputLabel htmlFor="id-account">Account</InputLabel>
                                <Input id="id-account"
                                    placeholder=""
                                    value={this.state.value_account}
                                    onChange={(e)=>this.handleChangedAccount(e)}
                                    startAdornment= {
                                        <InputAdornment position="start">
                                          <AccountCircleIcon />
                                        </InputAdornment>
                                    }
                                />
                                <FormHelperText id="id-account-helper-text">{this.state.value_account_helper_text}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl required size="small" color="secondary" variant="standard"
                                style={{
                                    width:350
                                }}
                                error={this.state.value_password_check_error}
                            >
                                <InputLabel htmlFor="id-password">Password</InputLabel>
                                <Input id="id-password"
                                    type={this.state.show_password ? 'text' : 'password'}
                                    placeholder=""
                                    value={this.state.value_password}
                                    onChange={(e)=>this.handleChangedPassword(e)}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton aria-label="toggle password visibility" edge="end"
                                            onClick={ (event) =>{ this.handleClickedShowPassword(event); } }
                                            >
                                            {this.state.show_password ? <VisibilityIcon fontSize="small"/> : <VisibilityOffIcon fontSize="small"/>}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                            />
                                {!this.state.show_password ?
                                (<FormHelperText id="id-password-helper-text">{this.state.value_password_helper_text}</FormHelperText>) :
                                (<FormHelperText id="id-password-helper-text">Your password is on display</FormHelperText>)
                                }
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                    </Grid>
                    <Divider variant="fullWidth" />
                    <Grid container justify="flex-start" direction="column" 
                            alignItems="center" spacing={1} style={{marginTop:"1rem"}}>
                        <Grid item xs={12}>
                            <Button variant="contained" color="secondary" 
                                onClick={(e) => { this.handleClickedSubmit(e) }}
                                style={{
                                        width:240,
                                        marginTop: 5,
                                        marginBottom: 10
                                    }}>
                                SUBMIT
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" style={{
                                width: 320,
                                color: "#a8a8a8"
                            }}>
                            Quick login method
                            </Typography>
                            <Divider variant="middle" />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" disabled
                                startIcon={<FacebookIcon />}
                                style={{
                                    marginLeft: 10,
                                    marginBottom: 10
                                }}
                            >
                            Facebook Login
                            </Button>
                            <Button variant="contained" color="primary" disabled
                                startIcon={<TwitterIcon />}
                                style={{
                                    marginLeft: 10,
                                    marginBottom: 10
                                }}
                            >
                            Twitter Login
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                <XWaitingPlane open={this.state.open_waiting_progress} showTime={10*1000} onclosed={(timeout)=>{this.handleClosedWaitingProgress(timeout)}}/>
            </Container>
        </React.Fragment>
        );
    }
};