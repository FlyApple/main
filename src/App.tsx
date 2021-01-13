import React from 'react';
import G from './utils/global';

import { ThemeProvider } from '@material-ui/core/styles';
import { ThemeDark } from './theme/ThemeDark'

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { Router } from 'react-router';
import { BrowserRouter } from 'react-router-dom';


import './App.css';
import mx from './utils';
import config from './config';
import {getSingleton} from './utils/singleton';
import * as server_x from './utils/ServerRequest';
import { MainMenu } from './components/MainMenu'
import { RenderRouteItems } from './routes/render';
import { routeItems, browserHistory } from './routes/index';

import XAnalytics from './Analytics';
import XData from './Data';

//
export class Application
{
  public static Instance:any| undefined = undefined;

  private _analytics:any| undefined = undefined;

  constructor() {
    Application.Instance = this;
  }

  public Init = async () => {
    this._analytics = new XAnalytics();
    
    return await this.OnInit();
  }

  //
  protected OnInit = async () => {
    //
    G.data = new XData();

    //
    let result = await getSingleton(server_x.ServerRequest).Settings();
    if(result && result.code >= 0) {
      G.data.settings_data = result.data;
    }

    //
    result = await getSingleton(server_x.ServerRequest).AuthToken();
    if(result && result.code >= 0) {
      G.data.auth_data = result.data;
    }

    //
    G.init();

    console.info(G.data);
    return true;
  }
}

//
export function ApplicationRender () {
  return (
    <ThemeProvider theme={ThemeDark}>
      <div className="App">
      <Router history={browserHistory}>
        <Container className="App-header">
          <MainMenu/>
        </Container>
        <Container fixed>
          <Container className="App-content">
              <Container className="App-content-view">
                <RenderRouteItems route={routeItems}/>
              </Container>
          </Container>
          <Container className="App-footer">
            <Box>
              <Typography variant="body2">
                COPYRIGHT© GameEyes Studio. ALL RIGHTS RESERVED. {config.development ? "(Development)" : ""}
              </Typography>
            </Box>
          </Container>
        </Container>
      </Router>
      </div>
    </ThemeProvider>
  );
}