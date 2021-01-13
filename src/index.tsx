import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Application, ApplicationRender} from './App';

//
const application = new Application();
application.Init().then((result) => {
    //
    ReactDOM.render(
        <ApplicationRender />,
        document.getElementById('root')
    );
}).catch((reason:any) => {
    console.error(reason);
});

