//
import React from 'react';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Pagination from '@material-ui/lab/Pagination';
import Divider from '@material-ui/core/Divider';

import { RouteItemAny, RouteItemComponentPropsAny } from '../routes/base';
import {getSingleton} from '../utils/singleton';
import * as server_x from '../utils/ServerRequest';

import { NoteListView } from '../components/NoteListView';

//
export interface IViewState {
    data: any | undefined;
}

//
export class ViewBase<S extends IViewState> extends React.Component<RouteItemComponentPropsAny, S> {

    //
    public constructor(props) {
        super(props);
    }
};