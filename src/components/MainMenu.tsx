// uuid:
//  type: 1 用户， 2 NOTES， 
//  code: (type 2) 01 NOTES， 02 COMMITS
import React from 'react';


import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Link from '@material-ui/core/Link';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grow from '@material-ui/core/Grow';
import Divider from '@material-ui/core/Divider';
import Badge from '@material-ui/core/Badge';

import AddBoxIcon from '@material-ui/icons/AddBox';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import FaceRoundedIcon from '@material-ui/icons/FaceRounded';
import PersonAddRoundedIcon from '@material-ui/icons/PersonAddRounded';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import InputIcon from '@material-ui/icons/Input';

import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import colors_grey from '@material-ui/core/colors/grey';

import './MainMenu.css'

import mx from '../utils';
import {getSingleton} from '../utils/singleton';
import * as server_x from '../utils/ServerRequest';
import { Router, NavLink, withRouter } from 'react-router-dom';
import {RouteItemAny} from '../routes/base';
import {routeItems, browserHistory} from '../routes/index';
import G from '../utils/global';

import {ShowToast} from '../components/MessageBox';
import {XNoteWriting} from './NoteWriting';
import {IconLogin} from '../icons';

//
const XTabs = withStyles({
  root: {
    height:24,
    minHeight: 24,
    borderBottom: '1px solid #757575',
    // backgroundColor: '#2196f3'
  },
  indicator: {
    backgroundColor: '#2196f3',
  },
})(Tabs);

interface XTabProps {
  label: string;
  link: string;
}

const XTabItem = withStyles((theme: Theme) =>
  createStyles({
    root: {
      color: colors_grey[900],
      textTransform: 'none',
      textDecoration: 'none',
      textAlign: 'center',
      height:24,
      minHeight: 24,
      minWidth: 84,
      '&:hover': {
        color: colors_grey[300],
        backgroundColor: colors_grey[600],
        opacity: 1.0,
      },
      '&$selected': {
        color: colors_grey[200],
        fontWeight: theme.typography.fontWeightMedium,
        backgroundColor: colors_grey[800]
      },
      '&:focus': {
        color: colors_grey[100],
      },
    },
    selected: {},
  }),
)((props: XTabProps) => {
  return (
    <NavLink style={{ textDecoration:'none'}} to={props.link}>
      <Tab {...props} />
    </NavLink>
  );
});

//
interface IMainMenuProps {
};
interface IMainMenuState {
  menu_profile_show: boolean;
  menu_profile_anchor: HTMLElement| undefined;
  tab_selected_index: number;
  
  show_writingnotes: boolean;
  sendingnotes_progress: number;

  //
  login_status: number;
  account_nm: string;
  account_mid: string;
  account_level: number;
};

//
export class MainMenu extends React.Component <IMainMenuProps, IMainMenuState> {
  private _menus:Array<{}> = [];
  private _auth_data:any = undefined;
  private _login_data:any = undefined;

  private _index_menu_logout = 1;
  private _index_menu_writing_notes = 10;

  public constructor(props) {
    super(props);

    //
    this.state = {
      menu_profile_show: false,
      menu_profile_anchor: undefined,

      tab_selected_index: -1,

      show_writingnotes: false,
      sendingnotes_progress: 0,

      login_status: 0,
      account_nm: "",
      account_mid: "",
      account_level: 0,
    };
  }

  componentDidMount() {
    //
    this.processLoginAuthToken();

    //
    this.loadMenusFromRoutes(this._menus, routeItems.children);

    if(this._menus.length > 0) {
      this.setState({
        tab_selected_index:0
      });
    }
  }

  componentWillUnmount() {
  }

  loadMenusFromRoutes = (menus:Array<{}>, routes:Array<RouteItemAny>| undefined) : boolean => {
    if(!routes) { 
      return false;
    }
    routes.forEach((item, index) => {
      if(item.mainMenuOn && item.name) { 
        let v = {
          name:item.name,
          path:item.path,
          children:[],
        };
        if(item.children && item.children.length > 0) {
          this.loadMenusFromRoutes(v.children, item.children as Array<RouteItemAny>);
        }
        menus.push(v);
      }
    });
    return true;
  }

  getTitle = () => {
    return "";
  }

  async processLoginAuthToken() {

    //
    this._login_data =  !G.data.login_data || !G.data.login_data.data ? undefined : G.data.login_data.data;
    this._auth_data = G.data.auth_data || undefined;

    // 验证TOKEN不存在或过期，重新请求
    if(!this._auth_data) {
      let result = await getSingleton(server_x.ServerRequest).AuthToken();
      if(result && result.code > 0) {
        this._auth_data = result.data;
      }
      G.data.auth_data = this._auth_data || undefined;
    }

    let status = 0;
    if(!this._auth_data || this._auth_data.user_privilege_level <= mx.defs.PRIVILEGE_LEVEL_GUEST
      //|| this._auth_data.auth_time_expired <= 0
      ) {
      this.setState({
        login_status: status,
        account_nm: "",
        account_mid: "",
        account_level: 0,
      });
      return ;
    }

    status = 1;
    this.setState({
      login_status: status,
      account_nm: this._login_data.user_nm || "",
      account_mid: this._login_data.user_nid || "",
      account_level: this._auth_data.user_privilege_level || 0,
    });
  };

  async processLogout() {
    console.info("Logout");
    let result = await getSingleton(server_x.ServerRequest).Logout();
    

    //
    G.data.login_status(false, result, "/home");
  }

  handleTabSelected = (event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({
      tab_selected_index:newValue
    });
    
    setTimeout(() => {
      this.handleTabSelectedCompleted(newValue)
    }, 100);
  };

  handleTabSelectedCompleted = (newValue: number) => {
  };

  handleToggleMenuProfile = (event) => {

    this.setState({
      menu_profile_show: !this.state.menu_profile_show,
      menu_profile_anchor: event.target as HTMLElement,
    });
  };
  handleCloseMenuProfile = (event) => {
    let elem:HTMLElement = event.target as HTMLElement;
    if (this.state.menu_profile_anchor && this.state.menu_profile_anchor.contains(elem)) {
      return;
    }
    if(elem.id == "id-menu-plane-profile" || (elem.parentElement && elem.parentElement.id == "id-menu-plane-profile")) {
      return;
    }
    console.info(elem);

    this.setState({
      menu_profile_show: false,
      menu_profile_anchor: undefined,
    });
  };

  handleClickedMenuProfileItem = (event, index) => {
    let elem:HTMLElement = event.target as HTMLElement;
    if (this.state.menu_profile_anchor && this.state.menu_profile_anchor.contains(elem)) {
      return;
    }

    //
    if(index == this._index_menu_logout) {
      this.processLogout();
    } else if(index == this._index_menu_writing_notes) {
      this.processWritingNotes();
    }

    //
    this.setState({
      menu_profile_show: false,
      menu_profile_anchor: undefined,
    });
  };

  handleClickedSigup = (event) => {
    browserHistory.push("/register");
  };

  handleClickedLogin = (event) => {
    browserHistory.push("/login");
  };

  handleClickedVerifying = (event) => {
    let active = false;
    if(this._auth_data.user_privilege_level == mx.defs.PRIVILEGE_LEVEL_REGISTERED) {
      active = true;
    }
    browserHistory.push("/verifying", {
      active: active,
      verifying: true
    });
  };

  //
  handleClickedWritingNotes = (event) => {
    this.processWritingNotes();
  }
  handleClosedWritingNotes = (event) => {
    //
    this.setState({
      show_writingnotes: false,
    });
  }
  handleDoneWritingNotes = (value) => {
    
    //
    this.setState({
      show_writingnotes: false,
      sendingnotes_progress: 1,
    });

    this.processSendingNotes(value);

    //
    setTimeout(() => {
      this.setState({
        sendingnotes_progress: 0,
      })
    }, 100);
  }

  processWritingNotes = () => {
    if(this.state.show_writingnotes) {
      return false;
    }

    //
    this.setState({
      show_writingnotes: true,
    });
  }

  // NOTES
  processSendingNotes = async (value) => {
    let content = value.content;
    if(!content || content.length == 0) {
      ShowToast("warning", "You not sending null content");
      return ;
    }
    if(/[<>{}*$#~`]/g.test(content)) {
      ShowToast("warning", "Invalid characters");
      return ;
    }

    // 将内容进行一次BASE64编码
    let crypto_content = mx.crypto.base64EncodeString(content, true);
    // 客户端发送uuid, 内容，发送时间
    let data = {
      uuid: mx.generateUUID({ type: 2, value: 1, code: 1}),
      content: crypto_content,
      source_length: content.length,
      crypto_level: 1,
      crypto_length: crypto_content.length,
      tags: value.tags,
      time: mx.timestampS(),
      private_level: 0,
    }
    let result = await getSingleton(server_x.ServerRequest).SendingNotes(null, data);
    console.info(data, result);
  }

  // RENDER
  renderMenus() {
    let menu_items;
    if(this._menus.length > 0) {
      menu_items = (this._menus.map((item:any, i:number) => {
        return (
          <XTabItem key={i} label={item.name} link={item.path} />
        );
      }));
    }
    return menu_items;
  }
  render() {
    return (
      <React.Fragment>
        <AppBar position="fixed">
        <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={0} style={{ minWidth:800 }}>
        <Grid item xs={12}>
          <Toolbar className="MainMenu">
            <Grid container direction="row" justify="center" spacing={0}>
              <Grid item xs={12} sm={5}>
                <Box className="MainMenu-Title">
                  <img className="MainMenu-Title Logo" src="/eyes_1sm.png"/>
                  <Typography variant="h6" className="MainMenu-Title Text">
                    {this.getTitle()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Box className="MainMenu-Profile">
                  { this.state.login_status <= 0 ? (
                  <Container>
                    <Button variant="contained" color="secondary" size="small"
                      className="MainMenu-Profile Sigup"
                      startIcon={<PersonAddRoundedIcon fontSize="large"/>}
                      onClick={(e)=>{ this.handleClickedSigup(e); }}>
                    Sign Up
                    </Button>
                    <Button variant="outlined" color="inherit" size="small"
                      className="MainMenu-Profile Login"
                      startIcon={<FaceRoundedIcon fontSize="large"/>}
                      onClick={(e)=>{ this.handleClickedLogin(e); }}>
                    Login
                    </Button>
                  </Container>
                  ) : (
                  <Container>
                    {this._auth_data.user_privilege_level >= mx.defs.PRIVILEGE_LEVEL_USER && (
                    <Button variant="contained" color="secondary"  size="small"
                      startIcon={<BorderColorIcon />}
                      style = {{
                        marginTop: 0,
                        marginBottom: 10,
                        marginRight: 10
                      }}
                      onClick={(e) => { this.handleClickedWritingNotes(e); }}
                      disabled = {this.state.sendingnotes_progress > 0 && this.state.sendingnotes_progress < 100}
                    >
                      Writing
                    </Button>)}
                    <ButtonGroup variant="contained"> 
                      <Button variant="outlined"  disabled
                        style={{
                          color:"lightgray",
                          borderBottom: "1px solid gray",
                          borderLeft: "1px solid gray",
                          borderTop: "1px solid gray",
                          textTransform: "none",
                        }}
                        startIcon={<AccountCircleIcon />}>
                        <Typography variant="subtitle2">
                          {this.state.account_nm}
                        </Typography>
                      </Button>
                      <Button size="small" color="secondary"
                        onClick={(e) => { this.handleToggleMenuProfile(e); }}>
                        <ArrowDropDownIcon />
                      </Button>
                    </ButtonGroup>
                    <Container style={{ textAlign: "right" }}>
                      <Typography variant="caption" style={{
                          color:"darkgray",
                        }}>
                        {`MID: ${this.state.account_mid}`}
                        {this.state.account_level == mx.defs.PRIVILEGE_LEVEL_REGISTERED && 
                          <Link component="button" color="primary"
                            style={{
                              height:10,
                              marginLeft:5,
                              marginBottom:6
                            }}
                            onClick={(e) => { this.handleClickedVerifying(e); }}
                          >
                            <Typography variant="caption" style={{ color:"yellow", textTransform: "none"}}>
                            Verfiying {this._auth_data.verifying_email > 0 ? "Email" : ""}{this._auth_data.verifying_phone > 0 ? "Phone" : ""}
                            </Typography>
                          </Link>
                        }
                      </Typography>
                    </Container>
                  </Container>
                  )}
                  <Popper open={this.state.menu_profile_show} anchorEl={this.state.menu_profile_anchor} 
                    placement="bottom-end"
                    role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                      <Grow {...TransitionProps}
                        style={{
                          transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                      >
                        <Paper id="id-menu-plane-profile" elevation={1} style={{
                          color:colors_grey[100], backgroundColor: colors_grey[800]
                        }}>
                          <Container>
                            <Grid container spacing={1} direction="row" justify="flex-start" alignItems="flex-start">
                              <Grid item xs={3}>
                                <Badge overlap="circle" color="secondary" variant="dot"
                                  anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                  }}
                                  badgeContent={0} >
                                  <Avatar>{this.state.account_nm && this.state.account_nm[0].toUpperCase()}</Avatar>
                                </Badge>
                              </Grid>
                              <Grid item xs={9}>
                                <Container>
                                  <Typography variant="subtitle2" style={{
                                    color:colors_grey[100],
                                  }} noWrap>
                                  {`${this.state.account_nm}`}
                                  </Typography>
                                </Container>
                                <Container>
                                  <Typography variant="caption" style={{
                                    color:"lightgray",
                                  }}>
                                  {`MID: ${this.state.account_mid}`}
                                  </Typography>
                                </Container>
                              </Grid>
                            </Grid>
                          </Container>
                          <ClickAwayListener onClickAway={(e)=> { this.handleCloseMenuProfile(e) }}>
                            <MenuList id="id-menu-list-profile">
                              <Divider />
                              {this._auth_data.user_privilege_level >= mx.defs.PRIVILEGE_LEVEL_USER && (
                              <MenuItem key="menu-item-writing-notes" component="li"
                                onClick={(event) => { this.handleClickedMenuProfileItem(event, this._index_menu_writing_notes) }}
                                disabled = {this.state.sendingnotes_progress > 0 && this.state.sendingnotes_progress < 100}
                              >
                                <ListItemIcon style ={{ color:"lightgray" }}>
                                  <BorderColorIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="subtitle2">
                                  Writing Notes
                                </Typography>
                              </MenuItem>)}
                              <Divider />
                              <MenuItem key="menu-item-logout" component="li"
                                onClick={(event) => { this.handleClickedMenuProfileItem(event, this._index_menu_logout) }}
                              >
                                <ListItemIcon style ={{ color:"lightgray" }}>
                                  <IconLogin fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="subtitle2">
                                  Logout
                                </Typography>
                              </MenuItem>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </Box>
              </Grid>
            </Grid>
          </Toolbar>
        </Grid>
        <Grid item xs={12}>
          <Container className="MainMenu-Nav" fixed>
            <Container>
              <XTabs
                orientation="horizontal"
                aria-label="ant tabs"
                value={this.state.tab_selected_index}
                onChange={this.handleTabSelected}
              >
                {this.renderMenus()}
              </XTabs>
            </Container>
          </Container>
        </Grid>
        </Grid>
        <XNoteWriting open={this.state.show_writingnotes} title={`Editing Note:`} 
          ondone={(t) => { this.handleDoneWritingNotes(t) }}
          onclosed={(e) => { this.handleClosedWritingNotes(e) }}/>
        </AppBar>
      </React.Fragment>
    );
  }
};