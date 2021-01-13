import React from 'react';
import { RouteComponentProps } from "react-router";


export interface RouteItemBase 
{
    key?: React.Key;
    path?: string;
    name:string| null;
    exact?:boolean;
    value?:undefined| Object| string;
    //
    redirect?:string;
}

export interface RouteItemComponentProps<Params extends { [K in keyof Params]?: string } = {}> 
    extends RouteComponentProps<Params> {
    route?: RouteItem<RouteItemComponentProps<Params>>;
}

export type RouteItemComponentPropsAny = RouteItemComponentProps<any>;

export interface RouteItem<ComponentProps extends RouteItemComponentProps<any>> extends RouteItemBase
{
    mainMenuOn?:boolean;
    component?: React.ComponentType<ComponentProps> | React.ComponentType;
    children?: Array<RouteItem<ComponentProps>>;
}

export type RouteItemAny = RouteItem<RouteItemComponentPropsAny>;