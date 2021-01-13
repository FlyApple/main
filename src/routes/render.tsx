import React from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import { Router, Route, Switch, Redirect } from 'react-router';
import { RouteItemAny, RouteItem, RouteItemBase } from './base';


//
export interface RenderRouteItemsComponentProps <RouteT extends RouteItemBase = RouteItemAny> {
    route?: RouteT;
}

//
export interface RenderRouteItemsState {
    routes?: Array<RouteItemAny>;
}


//
export class RenderRouteItems  extends React.Component<RenderRouteItemsComponentProps<RouteItemAny>, RenderRouteItemsState> {

    public constructor(props) {
        super(props);

        this.state = {
            routes: undefined,
        };
    }

    componentDidMount() {
        this.loadingRoutes(this.props.route?.children);
    }

    loadingRoutes(routes) {
        routes = routes || [];
        let result = this.parseRoutes(routes);
        if(result) {
            this.setState({
                routes: result,
            })
        }
    }

    parseRoutes(routes?:Array<RouteItemAny>, items?:Array<any>, redirects?:Array<any>) {
        if(!routes) { return null; }

        items = items || [];
        redirects = redirects || [];

        // 排序
        if(!this.parseChildRoutes(routes, items, redirects)) {
            return null;
        }

        let temp:Array<any> = [];
        temp = temp.concat(items, redirects);
        return temp;
    }

    parseChildRoutes(routes:Array<RouteItemAny>, items:Array<any>, redirects:Array<any>) {
        routes.forEach((v, i) => {
            let enabled = true;

            //如果name为null, 或undefined, 代表该项不启用
            if (!v.name) { enabled = false; } 
            else if (v.redirect) { redirects.push(v); }
            else { 
                // 如果组件和菜单都未赋值，则忽略添加进路由表
                if(!v.component && !v.mainMenuOn) { }
                else { items.push(v); }
            }

            // 父项目启用，才递归子节点
            if(enabled && v.children && v.children.length > 0) {
                // 递归子项
                this.parseChildRoutes(v.children, items, redirects)
            }
        });
        return true;
    }

    renderRouteSubItems(items: Array<RouteItemAny> | undefined) {
        let temp = this.state.routes || [];

        // 路由
        let elems;
        if(temp && temp.length > 0) {
            elems  = temp.map((v, i) => {
                if(v.redirect) {
                    return (
                        <Redirect key={i} from={v.path} to={v.redirect} />
                    );
                }
                return (
                    <Route key={i}
                    exact = {v.exact == undefined || v.exact == true}
                    path = {v.path}
                    component = {v.component}
                />);
            });
        }
        return elems;
    }

    render() {
        return (
            <Box> 
                { this.state.routes && 
                <Switch>
                    { this.renderRouteSubItems(this.state.routes) }
                    <Redirect from="/*" to="/home" />
                </Switch>}
            </Box>);
    }
}
