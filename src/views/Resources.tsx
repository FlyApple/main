//
import React from 'react';
import G from '../utils/global';



import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import { IViewState, ViewBase } from './Base';

//
interface IViewResourcesState extends IViewState {
}


//
export class ViewResources extends ViewBase<IViewResourcesState> {

    //
    public constructor(props) {
        super(props);

        //
        this.state = {
            data: undefined,
        }
    }
    
    componentDidMount() {
    }
    
    componentWillUnmount() {
    }
    render() {
        return (<React.Fragment>
            <Container>
            {G.data.settings_data && 
            <Box style={{ textAlign: "left", color: "gray"}}>
              <Typography variant="body2">
                IPv4: {G.data.settings_data.ip}
              </Typography>
              <Typography variant="body2">
                Time (UTC): {G.data.settings_data.time_utc}, (SVR): {G.data.settings_data.time_local}
              </Typography>
              <Divider />
            </Box>}
            <Box style={{ textAlign: "left", }}>
              <Typography variant="body1">
              MIT License:
              </Typography>
              <Typography variant="body2">
              COPYRIGHT© GameEyes Studio. 2012-2021 ALL RIGHTS RESERVED<br />
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated <br />
              documentation files (the "Software"), to deal in the Software without restriction, including without limitation <br />
              the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, <br />
              and to permit persons to whom the Software is furnished to do so, subject to the following conditions:<br />
              The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.<br />
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, <br />
              INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. <br />
              IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, <br />
              WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.<br />
              </Typography>
              <Typography variant="body2" color="error">
              (Additional Terms: All of our versions will be open source, any organization or individual can use and build it,<br />
              but selling or touting is not allowed.)
              </Typography>
            </Box>
            </Container>
        </React.Fragment>
        );
    }
};