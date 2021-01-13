import React from 'react';
import G from './utils/global';

import mx from './utils';
import { emit } from 'process';

//
interface Firebase {
  SDK_VERSION:string;
  initializeApp(config:any);
  analytics();
}
//
declare global {
  interface Window {
    firebaseInstance:Firebase;
    firebaseInit:Function | undefined;
    firebaseInitCallback: Function | undefined;
  }
}


//
class FirebaseAnalytics {
  private _instance:Firebase| undefined;

  //
  constructor() {
    let temp = document.getElementById("id-firebase-root");
    if(!temp) {
      let elem = document.createElement("script");
      elem.id = "id-firebase-root";
      elem.text = ` function firebaseInit() {
        //
        if(firebaseInitCallback) {
          firebaseInitCallback(firebase);
        }
      }
      `;
      document.body.appendChild(elem);
    }
    temp = document.getElementById("id-firebase-app");
    if(!temp) {
      let elem = document.createElement("script");
      elem.id = "id-firebase-app";
      elem.src = "https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js";
      elem.async = true;
      document.body.appendChild(elem);
    }
    temp = document.getElementById("id-firebase-analytics");
    if(!temp) {
      let elem = document.createElement("script");
      elem.id = "id-firebase-analytics";
      elem.src = "https://www.gstatic.com/firebasejs/8.2.1/firebase-analytics.js";
      elem.async = true;
      elem.onload = () => {
        if(window.firebaseInit) {
          window.firebaseInit();
        }
      }
      document.body.appendChild(elem);
    }

    window.firebaseInitCallback = (inst) => {
      window.firebaseInstance = inst;
      console.info(`Firebase SDK: ${window.firebaseInstance.SDK_VERSION}`);

      // Your web app's Firebase configuration
      // For Firebase JS SDK v7.20.0 and later, measurementId is optional
      let firebaseConfig = {
        apiKey: "AIzaSyCrW5tJXlHjahjb4qC2IDS390xfnbBsxMk",
        authDomain: "mcmcx-b26dd.firebaseapp.com",
        projectId: "mcmcx-b26dd",
        storageBucket: "mcmcx-b26dd.appspot.com",
        messagingSenderId: "49421640243",
        appId: "1:49421640243:web:512e0778c53fca4106f946",
        measurementId: "G-R78ZXDMH1Q"
      };
      // Initialize Firebase
      window.firebaseInstance.initializeApp(firebaseConfig);
      window.firebaseInstance.analytics();

      this._instance = inst;
    }
  }
}

//
export default class XAnalytics {
  private _firebase:FirebaseAnalytics;
  constructor() {
    this._firebase = new FirebaseAnalytics();

  }
}
