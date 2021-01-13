//
import React from 'react';
import G from '../utils/global';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Pagination from '@material-ui/lab/Pagination';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

import mx from '../utils';
import {getSingleton} from '../utils/singleton';
import * as server_x from '../utils/ServerRequest';
import { NoteItem } from './NoteItem';

//
interface INoteListViewProps {
    data: any| undefined;
    onitem?: Function;
    onpage?: Function;
};

interface INoteListViewState {
    page: number;
    next: number;
    count: number;
    items: Array<any>;
    progress: number;

    //
    lend: boolean;
};

//
export class NoteListView extends React.Component<INoteListViewProps, INoteListViewState> {
    //
    private _item_data:any = {};
    private _progress_time_id: any = -1;
    private _progress_tick: number = 0;

    //
    public constructor(props) {
        super(props);

        this.state = {
            page: 1,
            next: 1,
            count: 1,
            items: [],
            progress: 0,
            lend: false,
        }


    }
    
    componentDidMount() {

        //
        this.progressShow();
    }
    
    componentWillUnmount() {
    }

    // Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps 
    // to suppress this warning in non-strict mode. In React 17.x, 
    // only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, 
    // you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.
    // componentWillReceiveProps(nextProps:Readonly<INoteListViewProps>) {
    UNSAFE_componentWillReceiveProps(nextProps:Readonly<INoteListViewProps>) {
        if(nextProps.data) {
            this._item_data = nextProps.data;
            this.processInit(this._item_data);
            this.progressClose();
        }
    }

    async processInit(data) {
        //
        this.updatePageItems(this.state.next, data);
    }

    updatePageItems(page, data) {
        if(page <= 0) { page = 1; }

        let count = G.data.notes_page_total();
        if(count == 0) { count = 1; }
        else { count = page + 1; }

        //
        let lend = false;
        if(page + 1 >= count && !data.next) {
            count = page; lend = true;
        }

        this.setState({
            page: page,
            count: count,
            items: data.items,
            lend: lend,
        });
    }

    progressShow() {
        if(this._progress_time_id >= 0) {
            return false;
        }

        //
        let timeout = 5 * 1000;
        this._progress_tick = mx.timestampMS();
        this._progress_time_id = setInterval(() =>{
            let time = mx.timestampMS() - this._progress_tick;
            let pos = 1;
            if(time < timeout) { 
                pos = time / timeout * 100;
                this.setState( {
                    progress: pos,
                })
            } else {
                setTimeout(() => {
                    this.progressClose();
                }, 200);
            }
        }, 200);
        return true;
    }

    progressClose() {
        if(this._progress_time_id >= 0) {
            clearInterval(this._progress_time_id);
            this._progress_time_id = -1;
        }
        this._progress_tick = 0;

        this.setState( {
            progress: 0,
        })
    }

    handleClickedItem(event, item) {
        setTimeout( async () => {
            if(this.props.onitem) {
                await this.props.onitem(item);
            }
        }, 100);
    }

    handleClickedAllViewCommits(event, item) {
        setTimeout( async () => {
            if(this.props.onitem) {
                await this.props.onitem(item);
            }
        }, 100);
    }

    handleClickedAllViewReplies(item, reply) {
        setTimeout( async () => {
            if(this.props.onitem) {
                await this.props.onitem(item);
            }
        }, 100);
    }

    handleChangedPage(event, value) {
        if(value < 0) { value = 1; }

        if(!this.progressShow()) {
            return ;
        }

        this.setState({ next: value, });

        setTimeout(async () => {
            let result = true;
            if(this.props.onpage) {
                result = await this.props.onpage(this.state.page, value, this._item_data);
            }

            this.progressClose();
            if(!result) {
                return ;
            }

            this.setState({ page: value, });
        }, 500);
    }

    render() {
        return (
        <React.Fragment>
            <Box component="div">
                { this.state.items && this.state.items.map((v, i) => {
                    return (
                        <Container key={v.nid}>
                            <NoteItem data={v} 
                            onclickedheader={(e) => { this.handleClickedItem(e, v); }}
                            onclickedcontent={(e) => {  }}
                            onclickedviewcommits={(e) => { this.handleClickedAllViewCommits(e, v); }}
                            onclickedviewreplies={(t) => { this.handleClickedAllViewReplies(v, t); } } />
                        </Container>);
                })}
            </Box>
            <Box component="div" style = {{ textAlign: "right", }}>
                {this.state.progress > 0 && this.state.progress < 100 && 
                <LinearProgress variant="determinate" color="secondary" value={this.state.progress}
                    style={{
                        marginTop: 10,
                    }}/>}
                {this.state.lend && (
                <Box component="div" style={{
                    backgroundColor: "lightgray",
                    textAlign: "center",
                    marginTop: 10,
                    borderTop: "1px solid gray"
                }}>
                    <Typography variant="overline">
                    Not More Notes
                    </Typography>
                </Box>
                )}
                <Pagination  count={this.state.count} page={this.state.page}
                    color="secondary" shape="rounded" showFirstButton
                    style={{ display:"flex", justifyContent: "center", marginTop:10 }}
                    onChange={(e, n) => { this.handleChangedPage(e, n) }}/>
            </Box>
        </React.Fragment>
        );
    }
};
