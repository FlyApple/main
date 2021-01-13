//
import React from 'react';
import queryString from 'query-string';
import G from '../utils/global';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { browserHistory } from '../routes';

import mx from '../utils';
import {getSingleton} from '../utils/singleton';
import * as server_x from '../utils/ServerRequest';

import { ShowToast } from '../components/MessageBox';
import { XLoadingPlane } from '../components/LoadingPlane';
import { NoteListView } from '../components/NoteListView';

import { IViewState, ViewBase } from './Base';



//
interface IViewHomeState extends IViewState {
    show_loading: boolean;
}

//
export class ViewHome extends ViewBase<IViewHomeState> {
    private _data: any;

    //
    public constructor(props) {
        super(props);

        //
        let params = queryString.parse(this.props.location.search, 
            { 
                parseBooleans: true,
                parseNumbers: false,
            });
        this._data = {
            page: parseInt((params.page || "0") as string),
        };
        if(this._data.page <= 0) {
            this._data.page = 0;
        }

        //
        this.state = {
            data: undefined,

            show_loading: false,
        }
    }
    
    componentDidMount() {
        //
        this.processNotesLoad();
    }
    
    componentWillUnmount() {
    }


    async processNotesLoad() {

        //
        if(await this.processNotesLoading(this._data.page)) {
            let data = G.data.notes_page_view(this._data.page);
            this.setState({data:data});
        }
    }

    async processNotesLoading(page: number, last:any = {}) {
        let count = G.data.notes_data.pages.length;
        let item = {
            items: undefined,
        };

        if(count == 0 || page < 0) { page = 0; }

        let args = {
            page: page,
            last_uid: last?.next?.uid || 0,
            last_nid: last?.next?.nid || "",
        }
       
        let result = await getSingleton(server_x.ServerRequest).InitNoteList(args);
        if(!result || result.code < 0) { 
            return false;
        }

        item = result.data || {};
        G.data.notes_page_data(page, item);
        return true;
    }

    async handleClickedItem(item) {
        this.setState({ show_loading: true });

        // 跳转至NOTE VIEW
        if(item) {
            setTimeout(() => {
                this.setState({ show_loading: false });
                browserHistory.push(`/notes/view?note_uid=${item.uid}&note_nid=${item.nid}`);
            }, 500);
        } 
    }

    async handleChangedPage(page, next, data) {
        

        // 向前翻页
        if(next <= page) {
            if(next - 1 < 0) { return false; }
        // 向后翻页
        } else {
            if(!data.next) {
                ShowToast("warning", "There is no more content, it can't continue to the next page.");
                return false;
            }

            if(!await this.processNotesLoading(next - 1, data)) {
                return false;
            };
        }

        this._data.page = next - 1;
        this.setState({data:G.data.notes_page_view(this._data.page)});
        return true;
    }

    render() {
        return (
        <React.Fragment>
        <Box component="div">
            <Grid container direction="row" justify="center" alignItems="flex-start">
                <Grid item xs={12} sm={2}>
                    <Box component="span" style={{
                        minWidth: 200,
                    }}>
                        <Tabs orientation="vertical"           
                            indicatorColor="secondary"
                            value={0}
                            style={{
                                margin: 0,
                                marginRight: 5,
                                borderLeft: "1px solid #757575",
                            }}>
                            <Tab label="Recommend" wrapped/>
                        </Tabs>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={10}>
                    <Box component="span" style={{
                        minWidth: 600,
                    }}>
                        <NoteListView data={this.state.data} 
                            onitem={ async (v) => { await this.handleClickedItem(v) } }
                            onpage={ async (v, n, x) => { return await this.handleChangedPage(v, n, x) } }/>
                    </Box>
                </Grid>
            </Grid>
        </Box>
        <XLoadingPlane open={this.state.show_loading} text={`Loading ...`} time={(5 * 1000)}/>
        </React.Fragment>
        );
    }
};