//
import React from 'react';

import mx from '../../utils';
import G from '../../utils/global';
import {getSingleton} from '../../utils/singleton';
import * as server_x from '../../utils/ServerRequest';

import config from '../../config';
import {ShowToast} from '../../components/MessageBox';
import {ImageCaptcha} from '../../components/captcha';
import {XWaitingPlane} from '../../components/WaitingPlane';

import Container from '@material-ui/core/Container';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import EmailIcon from '@material-ui/icons/EmailRounded';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import {routeItems, browserHistory} from '../../routes/index';

import './User.css';


//
interface IRegisterState {
    email_domain: Array<any>;
    show_password: boolean;
    agree_policy: boolean;
    open_waiting_progress: boolean;
    //
    value_account: string;
    value_account_check_error: boolean;
    value_account_helper_text: string;
    //
    value_email: string;
    value_email_domain: string;
    value_email_check_error: boolean;
    value_email_helper_text: string;
    //
    value_password: string;
    value_password_check_error: boolean;
    value_password_helper_text: string;
    value_confirm_password: string;
    value_confirm_password_check_error: boolean;
    value_confirm_password_helper_text: string;
    //
    value_captcha: string;
    value_captcha_check_error: boolean;
    value_captcha_helper_text: string;
};

//
export class ViewRegister extends React.Component<any, IRegisterState> {

    private _form:any;
    private _captcha_url:string;

    //
    public constructor(props) {
        super(props);

        this.state = {
            email_domain: [
                { value: "gmail.com" },
                { value: "yahoo.com" },
                { value: "live.com" },
                { value: "hotmail.com" },
                { value: "qq.com" },
                { value: "163.com" },
            ],
            show_password: false,
            agree_policy: false,
            open_waiting_progress: false,
            //
            value_account: "",
            value_account_check_error: false,
            value_account_helper_text: "Account Name 6-15 characters (a-z,A-Z,0-9), If you don't type, the account name will be generated automatically.",
            //
            value_email: "",
            value_email_domain: "",
            value_email_check_error: false,
            value_email_helper_text: "An email address",
            //
            value_password: "",
            value_password_check_error: false,
            value_password_helper_text: "Password 6-15 characters",
            value_confirm_password: "",
            value_confirm_password_check_error: false,
            value_confirm_password_helper_text: "Repeat password",
            //
            value_captcha: "",
            value_captcha_check_error: false,
            value_captcha_helper_text: "Please enter the text shown in the image on the right.",
        };

        this._captcha_url = `${config.server}${config.server.endsWith("\/")?"":"\/"}auth/code`;

        //
        this._form = {};
    }
    componentDidMount() {
        if(!this.state.value_email_domain || this.state.value_email_domain.length == 0) {
            this.setState({
                value_email_domain: this.state.email_domain.length == 0 ? "" : this.state.email_domain[0].value
            });
        }
    }
    
    componentWillUnmount() {
    }

    handleClickedShowPassword(event) {
        this.setState({
            show_password:!this.state.show_password
          });
    }
    handleCheckedAgreePolicy(event, checked) {
        this.setState({
            agree_policy:!this.state.agree_policy
          });
    }
    handleChangedAccount(event) {
        let value = event.target.value;
        if(!value || value.length == 0) {
            this.setState({
                value_account: "",
                value_account_check_error: false,
                value_account_helper_text: "Auto generate account name"
            });
            this._form.account_name = "";
            return ;
        } else if(value.length >= mx.defs.ACCOUNT_NAME_MAXLEN) {
            this.setState({
                value_account_check_error: true,
                value_account_helper_text: "Account name too length"
            });
            return ;
        }
        this.setState({
            value_account: value
        });

        let result = mx.checkAccountName(value.trim(), 6, mx.defs.ACCOUNT_NAME_MAXLEN);
        if(!result || typeof(result) != "string") {
            this.setState({
                value_account_check_error: true,
                value_account_helper_text: "Account name invalid"
            });
            return;
        }
        value = result;

        this.setState({
            value_account_check_error: false,
            value_account_helper_text: "Account name valid"
        });

        this._form.account_name = value;
    }
    handleChangedEmail(event) {
        let value = event.target.value;
        if(value.length >= 24) {
            this.setState({
                value_email_check_error: true,
                value_email_helper_text: "Email address too length"
            });
            return ;
        }
        this.setState({
            value_email: value
        });
        
        let email = `${value.trim()}@${this.state.value_email_domain.trim()}`;
        let result = mx.checkEmail(email);
        if(!result || typeof(result) != "string") {
            this.setState({
                value_email_check_error: true,
                value_email_helper_text: "Email address invalid"
            });
            return;
        }
        email = result;

        this.setState({
            value_email_check_error: false,
            value_email_helper_text: "Email address valid"
        });

        this._form.email = email;
    }
    handleChangedEmailDomain(event) {
        let value = event.target.value;
        this.setState({
            value_email_domain: value
        });
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
        if(this.state.show_password) {
            this._form.confirm_password = value;
        } else {
            if(this._form.confirm_password && this._form.confirm_password.length > 0) {
                if(this._form.password != this._form.confirm_password) { 
                    this.setState({
                        value_confirm_password_check_error: true,
                        value_confirm_password_helper_text: "The two password inputs are different"
                    });
                    return ;

                } 

                this.setState({
                    value_confirm_password_check_error: false,
                    value_confirm_password_helper_text: "Password is ok"
                });
                return ;
            }
        }
    }
    handleChangedConfirmPassword(event) {
        let value = event.target.value;
        if(value.length >= mx.defs.PASSWORD_MAXLEN) {
            this.setState({
                value_confirm_password_check_error: true,
                value_confirm_password_helper_text: "Password too length"
            });
            return ;
        }
        this.setState({
            value_confirm_password: value
        });

        value = value.trim();
        if(value.length < 6) { 
            this.setState({
                value_confirm_password_check_error: true,
                value_confirm_password_helper_text: "Paswsord too short"
            });
            return ;
        }

        if(this._form.password != value) { 
            this.setState({
                value_confirm_password_check_error: true,
                value_confirm_password_helper_text: "The two password inputs are different"
            });
        } else {
            this.setState({
                value_confirm_password_check_error: false,
                value_confirm_password_helper_text: "Password is ok"
            });
        }
        
        this._form.confirm_password = value;
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
        if(timeout) {
            this.setState({open_waiting_progress:false});
        }
    }
    handleClickedSubmit(event) {
        //
        if(!this.state.agree_policy) {
            ShowToast("error", "You must agree to the privacy policy and protocol ~!");
            return ;
        }

        if(!this._form.email || this._form.email.length == 0) {
            ShowToast("error", "You must type in the required items: email address");
            this.setState({
                value_email_check_error: true,
                value_email_helper_text: "Please type in email address"
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
        if(!this.state.show_password &&
            (!this.state.value_confirm_password || this.state.value_confirm_password.length == 0 ||
            !this._form.confirm_password || this._form.confirm_password.length == 0 ||
            this._form.password != this._form.confirm_password)) {
            ShowToast("error", "You must type in the required items: confirm password");
            this.setState({
                value_confirm_password_check_error: true,
                value_confirm_password_helper_text: "Please type in your confirm password"
            });
            return ;
        }

        this.setState({
            value_password_check_error: false,
            value_password_helper_text: "Password is ok",
            value_confirm_password_check_error: false,
            value_confirm_password_helper_text: "Password is ok"
        });

        if(!this._form.captcha || this._form.captcha.length == 0) {
            ShowToast("error", "You must type in the required items: captcha");
            return ;
        }

        if(!this._form.account_name || this._form.account_name.length == 0) {
            ShowToast("warning", "If you don't set a user name, we will create a randomly generated user name for you.");
        }

        setTimeout(() => {
            this.processSignUp();
        }, 500);
    }

    async processSignUp() {
        this.setState({open_waiting_progress:true});

        //
        let data = {
            type_index: mx.defs.ACCOUNT_TYPE_EMAIL,
            type_name: mx.defs.ACCOUNT_TYPENAME_EMAIL,
            account_name: this._form.account_name || "",
            email: this._form.email,
            hash_password: mx.crypto.md5HashString(this.state.show_password ? this._form.password : this._form.confirm_password),
            auth_code: this._form.captcha,
            agree_policy: true
        }
        
        let result = await getSingleton(server_x.ServerRequest).Register(null, data);
        console.info(data, result);
        
        let sigup_data;
        if(result && result.code > 0) {
            sigup_data = result.data;
            ShowToast("success", `Account create '${data.email}' successed`);
        }

        setTimeout(() => {
            this.setState({open_waiting_progress:false});

            if(sigup_data) {
                browserHistory.push("/login");
            }
        });
    }

    render() {
        
        return (
        <React.Fragment>
            <Container>
                <form className="Register-Plane" autoComplete="off">
                    <div className="Register-Title">
                        <div>
                            <Typography variant="h4" align="center">
                            Create New Account
                            </Typography>
                        </div>
                        <div className="Register-Title Light">
                            <Typography variant="body2">
                            The "*" character suffix in the following content must type content.
                            </Typography>
                        </div>
                    </div>
                    <Divider variant="fullWidth" />
                    <div className="Register-Item">
                        <TextField id="id-account-name" label="Account Name" defaultValue="" 
                            error={this.state.value_account_check_error}
                            placeholder="Auto Generate Account Name" helperText={this.state.value_account_helper_text}
                            value={this.state.value_account}
                            size="small" color="secondary" variant="standard" 
                            style={{ width:300 }}
                            InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccountCircleIcon />
                                  </InputAdornment>
                                ),
                              }}
                            onChange={(e)=>this.handleChangedAccount(e)}/>
                    </div>
                    <div className="Register-Item">
                        <TextField required id="id-email" label="Email" defaultValue="" 
                            error={this.state.value_email_check_error}
                            placeholder="" helperText={this.state.value_email_helper_text}
                            size="small" color="secondary" variant="standard" 
                            value={this.state.value_email}
                            InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon />
                                  </InputAdornment>
                                ),
                            }}
                            onChange={(e)=>this.handleChangedEmail(e)}/>
                        <TextField select id="id-email-domain" label="Email Domain" defaultValue="" 
                            placeholder="" helperText=""
                            size="small" color="secondary" variant="standard" 
                            value={this.state.value_email_domain}
                            style={{
                                marginLeft:10
                            }}
                            InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AlternateEmailIcon fontSize="small"/>
                                  </InputAdornment>
                                ),
                              }}
                            SelectProps={{
                                native: true,
                                multiple: false,
                                variant: "standard",
                                autoWidth: true,
                              }}
                            onChange={(e)=>this.handleChangedEmailDomain(e)}>
                             {this.state.email_domain.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.value}
                                </option>
                            ))}
                        </TextField>
                    </div>
                    <div className="Register-Item">
                        <FormControl required size="small" color="secondary" variant="standard"
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
                        {!this.state.show_password && 
                        <FormControl required size="small" color="secondary" variant="standard"
                            style={{
                                marginLeft:10
                            }}
                            error={this.state.value_confirm_password_check_error}
                        >
                            <InputLabel htmlFor="id-confirm-password">Confirm Password</InputLabel>
                            <Input id="id-confirm-password" type="password" 
                                placeholder=""
                                value={this.state.value_confirm_password}
                                onChange={(e)=>this.handleChangedConfirmPassword(e)}
                            />
                            <FormHelperText id="id-confirm-password-helper-text">{this.state.value_confirm_password_helper_text}</FormHelperText>
                        </FormControl>
                        }
                    </div>
                    <div className="Register-Item">
                        <Grid container justify="flex-start" direction="row" 
                            alignItems="center" spacing={1}>
                            <Grid item xs={12} sm={2}>
                                <FormControl required size="small" color="secondary" variant="standard"
                                    style={{
                                        width:180
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
                            <Grid item xs={12} sm={3}>
                                <ImageCaptcha type="image-svg" source={this._captcha_url}/>
                            </Grid>
                            <Grid item xs={12} sm={8}></Grid>
                        </Grid>
                    </div>
                    <Divider variant="fullWidth" />
                    <div className="Register-Item Center">
                        <Grid container justify="center"  direction="column" spacing={2}>
                            <Grid item xs>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={this.state.agree_policy}
                                            onChange={(event, checked) => { this.handleCheckedAgreePolicy(event, checked); }}
                                            inputProps={{ 'aria-label': 'primary checkbox' }} />
                                        }
                                    label={
                                        <Typography variant="body2">
                                            By clicking checkbox, you agree to our&nbsp;
                                            <Link href="#" color="secondary">Terms</Link>
                                            ,&nbsp;
                                            <Link href="#" color="secondary">Data Policy</Link>
                                            &nbsp;and&nbsp;
                                            <Link href="#" color="secondary">Cookies Policy</Link>
                                            .<br/>You may receive SMS Notifications from us and can opt out any time.
                                        </Typography>
                                    } />
                            </Grid>
                            <Grid item xs>
                                <Button variant="contained" color="secondary" 
                                    onClick={(e) => { this.handleClickedSubmit(e) }}
                                    style={{
                                        width:200,
                                        marginTop: 5,
                                        marginBottom: 10
                                    }}>
                                    SUBMIT
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </form>
                <XWaitingPlane open={this.state.open_waiting_progress} showTime={5*1000} onclosed={(timeout)=>{this.handleClosedWaitingProgress(timeout)}}/>
            </Container>
        </React.Fragment>
        );
    }
};