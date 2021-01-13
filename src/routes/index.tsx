//
import React from 'react';
import { createHashHistory, createBrowserHistory} from 'history';

import { RouteItemAny } from './base';

import { ViewHome } from '../views/Home';
import { ViewResources } from '../views/Resources';
import { ViewLogin } from '../views/user/Login';
import { ViewRegister } from '../views/user/Register';
import { ViewVerifying } from '../views/user/Verfiying';

//
import { ViewNote } from '../views/notes/Note';


//
export const browserHistory = createBrowserHistory();

//
export const routeItems:RouteItemAny = {
    // 默认/home跳转到主页
    // 未在路由中设置的一律跳转主页
    //
    name:"Root",
    children:[
    {
        path:"/",
        name:"Main",
        mainMenuOn: true,
        component:ViewHome,
        children:[
        ]
    },
    {
        path:"/register",
        name:"Sigup",
        mainMenuOn: false,
        component:ViewRegister,
        children:[
        ]
    },
    {
        path:"/login",
        name:"Login",
        mainMenuOn: false,
        component:ViewLogin,
        children:[
        ]
    },
    {
        path:"/verifying",
        name:"Verifying",
        mainMenuOn: false,
        component:ViewVerifying,
        children:[
        ]
    },
    {
        path:"/notes",
        name:"Notes",
        mainMenuOn: false,
        component:undefined,
        children:[
            {
                path:"/notes/view",
                name:"NoteView",
                component:ViewNote,
                children:[
                ]
            }
        ]
    },
    {
        path:"/resources",
        name:"Resources",
        mainMenuOn: true,
        component: ViewResources,
        children:[
            {
                path:"/resources/index",
                name: null, //"Index",
                component:undefined,
                children:[
                ]
            },
            {
                path:"/resources/download",
                name: null, //"Download",
                component:undefined,
                children:[
                ]
            }
        ]
    },
    {
        path:"/home",
        name:"Home",
        mainMenuOn: false,
        redirect: "/"
    },
]};

export default routeItems;